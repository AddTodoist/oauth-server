import { createServer, RequestListener } from 'http';
import { parse, URL } from 'url';
import { sendDirectMessage } from 'services/twitter-api';
import TEXTS from './texts';
import UserInfo from 'services/database';
import { encryptString, hashId } from 'services/crypto';
import Bugsnag from 'services/bugsnag';
import { getTodoistProjects, getTodoistUserData } from 'services/todoist-api';

export async function setupOAuthServer() {
  const server = createServer(requestListener);

  await new Promise<void>((resolve, reject) => {
    server.listen(3000)
      .once('listening', resolve)
      .once('error', reject);
  });

  console.log('OAuthServer listening on port 3000');

  return server;
}

const requestListener: RequestListener = async (req, res) => {
  const { pathname: path, query } = parse(req.url as string, true);
  
  if (path === '/status') {
    return res.writeHead(200).end();
  }

  if (path === '/usercount') {
    const count = await UserInfo.countDocuments();
    const HALF_AN_HOUR_IN_SECONDS = 60 * 30;
    // https://shields.io/endpoint
    const shieldResponse = {
      schemaVersion: 1,
      label: 'Total Users',
      message: String(count),
      cacheSeconds: HALF_AN_HOUR_IN_SECONDS
    };
    return res.writeHead(200).end(JSON.stringify(shieldResponse));
  }

  // only accept reqests to oauth endpoint
  if (path !== '/redirect/oauth') {
    return res.writeHead(301, { Location: 'https://dubis.dev' }).end();
  }
  
  const { code, state, error } = query;

  if (error === 'access_denied') return res.writeHead(301, { Location: 'https://twitter.com/messages' }).end();
  if (error) Bugsnag.notify(new Error(error as string, { cause: new Error('Something went wrong getting the token') }));
  if (!code || !state) return res.end('Invalid request');

  const twId = state as string;

  res.writeHead(301, { Location: 'https://twitter.com/messages' }).end();

  const token = await getUserToken(code as string);

  if (!token) return sendDirectMessage(twId, `${TEXTS.GENERAL_WRONG}: err 9`);

  const user = new UserInfo({
    _id: hashId(twId),
    todoistToken: encryptString(token),
    todoistProjectId: '0',
    todoistId: '0'
  });

  try {
    await user.save();
  } catch (err) {
    if (err.code === 11000) {
      user.isNew = false;
      await user.save();
    } else {
      Bugsnag.notify(err);
      return sendDirectMessage(twId, `${TEXTS.GENERAL_WRONG}: Could not save user info to database`);
    }
  }

  await sendDirectMessage(twId, TEXTS.ACCOUNT_LINKED);

  // get user projects and save default project
  const projects = await getUserProjects(token);
  user.todoistProjectId = projects?.[0].id || '0';

  // get todoist id
  const todoistId = await getTodoistId(token);
  if(!todoistId) sendDirectMessage(twId, `${TEXTS.GENERAL_WRONG}: Something went wrong getting your Todoist ID`);
  user.todoistId = todoistId || '0';

  try {
    await user.save();
  } catch (err) {
    Bugsnag.notify(err);
    return sendDirectMessage(twId, `${TEXTS.GENERAL_WRONG}: err 12`);
  } 

  const projectsString = projects
    ? projects.map((project, index) => `${index} - ${project.name}`).join('\n')
    : 'Something went wrong getting your projects. Please try again later.';

  sendDirectMessage(
    twId,
    TEXTS.PROJECT_CONFIG_HEADER + projectsString + TEXTS.PROJECT_CONFIG_FOOTER,
  );
};

export const getUserToken = async (authCode: string) => {
  const clientId = process.env.TODOIST_CLIENT_ID as string;
  const clientSecret = process.env.TODOIST_CLIENT_SECRET as string;

  const url = new URL('https://todoist.com/oauth/access_token');
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('client_secret', clientSecret);
  url.searchParams.append('code', authCode);

  try {
    const data = await fetch(url.href, { method: 'POST' }).then(res => {
      if (res.ok) return res.json();
      throw new Error('Could not get token', { cause: new Error(res.statusText) });
    });

    return data.access_token || null;
  } catch (err) {
    Bugsnag.notify(err);
    console.log('Something went wrong in getUserToken');
    return null;
  }
};

async function getUserProjects (token: string) {
  try {
    const projects = await getTodoistProjects(token);
    return projects;
  } catch (err) {
    Bugsnag.notify(err);
  }
}

async function getTodoistId (token: string) {
  let todoistId: string | undefined;
  try {
    const data = await getTodoistUserData(token);
    todoistId = data.user?.id;
  } catch (err) {
    Bugsnag.notify(err);
  }
  return todoistId;
}
