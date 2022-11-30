/**
 * This module includes tools to interact with the Todoist API.
 */

import { TodoistApi } from '@doist/todoist-api-typescript';
import axios from 'axios';

export const getTodoistUserData = async (token: string) => {
  const { data } = await axios.post('https://api.todoist.com/sync/v9/sync',
    { sync_token: '*', resource_types: ['user'] },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const { user } = data;
  return user;
};

export const getTodoistProjects = (token: string) => {
  const tdsClient = new TodoistApi(token);
  return tdsClient.getProjects();
};
  
