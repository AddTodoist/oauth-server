/**
 * This module includes tools to interact with the Todoist API.
 */

import { TodoistApi } from '@doist/todoist-api-typescript';

export const getTodoistUserData = async (token: string) => {
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const body = JSON.stringify({ sync_token: '*', resource_types: '["user"]' });
  const requestConfig = { method: 'POST', headers, body };
  
  return await fetch('https://api.todoist.com/sync/v9/sync', requestConfig ).then(res => {
    if (res.ok) return res.json();
    throw new Error('Something went wrong getting your Todoist user data');
  });
};

export const getTodoistProjects = (token: string) => {
  const tdsClient = new TodoistApi(token);
  return tdsClient.getProjects();
};
  
