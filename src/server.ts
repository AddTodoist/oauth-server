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
  
  if (path === '/status') return res.writeHead(200).end();

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

  const { token, errorStatus } = await getUserToken(code as string);

  if (token === null) {
    if (errorStatus >= 500) {
      return sendDirectMessage(twId, TEXTS.TODOIST_ERROR, {
        type: 'options',
        options: [{ label: '/init' }]
      });
    }
    return sendDirectMessage(twId, `${TEXTS.GENERAL_WRONG} getting your Todoist token. Try again.`, {
      type: 'options',
      options: [{ label: '/init' }]
    });
  }

  // get user projects and save default project
  const projects = await getUserProjects(token);

  if (projects === null || projects.length === 0) {
    return sendDirectMessage(twId, `${TEXTS.GENERAL_WRONG} getting your projects.`,  {
      type: 'options',
      options: [{ label: '/init' }]
    });
  }

  // get todoist id
  const todoistId = await getTodoistId(token);

  if(!todoistId) {
    return sendDirectMessage(twId, `${TEXTS.GENERAL_WRONG} getting your Todoist ID`,  {
      type: 'options',
      options: [{ label: '/init' }]
    });
  }

  const projectsString = projects.map((project, index) => `${index} - ${project.name}`).join('\n');

  const user = new UserInfo({
    _id: hashId(twId),
    todoistToken: encryptString(token),
    todoistProjectId: projects[0].id,
    todoistId,
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

  sendDirectMessage(
    twId,
    TEXTS.PROJECT_CONFIG_HEADER + projectsString + TEXTS.PROJECT_CONFIG_FOOTER,
    {
      type: 'options',
      options: [ { label: '/project 0' }, { label: `/project ${projects.length - 1}` }]
    }
  );
};

export const getUserToken = async (authCode: string) => {
  const clientId = process.env.TODOIST_CLIENT_ID;
  const clientSecret = process.env.TODOIST_CLIENT_SECRET;

  const url = new URL('https://todoist.com/oauth/access_token');
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('client_secret', clientSecret);
  url.searchParams.append('code', authCode);

  try {
    const data = await fetch(url.href, { method: 'POST' }).then(async res => {
      if (res.ok) return res.json();
      return Promise.reject(res);
    });

    const token: string = data.access_token;

    return { token } as const;
  } catch (err) { // Response object
    console.log('[getUserToken] Error getting token', err);

    console.log({ status: err.status, url: err.url });
  
    return { token: null, errorStatus: err.status as number } as const;
  }
};

async function getUserProjects (token: string) {
  try {
    const projects = await getTodoistProjects(token);
    return projects;
  } catch (err) {
    Bugsnag.notify(err);
    return null;
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
