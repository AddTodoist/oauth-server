declare global {
  interface IUserInfo {
    /**
     * Unique user id
     */
    _id: string;
    /**
     * Todoist **encrypted** token
     */
    todoistToken: string;
    /**
     * The todoist projectId to add tasks to
     */
    todoistProjectId: string;
    /**
     * If true, the user will not receive any response from the bot when saving a tweet
     */
    noResponse?: true;
    /**
     * The label to add to the task when added from thread
     */
    threadLabel?: string | null;
    /**
     * The label to add to the task when added from normal tweet
     */
    tweetLabel?: string | null;
  }

}

export { };
