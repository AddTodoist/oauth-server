/**
 * This module includes tools to interact with the Todoist API.
 */

import { TodoistApi } from '@doist/todoist-api-typescript';

export const getTodoistProjects = (token: string) => {
  const tdsClient = new TodoistApi(token);
  return tdsClient.getProjects();
};
  
