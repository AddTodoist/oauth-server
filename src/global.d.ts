declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TODOIST_CLIENT_ID: string;
      TODOIST_CLIENT_SECRET: string;
      TWITTER_CONSUMER_KEY: string;
      TWITTER_CONSUMER_SECRET: string;
      TWITTER_ACCESS_TOKEN: string;
      TWITTER_ACCESS_TOKEN_SECRET: string;
      TWITTER_WEBHOOK_ENV: string;
      BUGSNAG_API_KEY: string;
      MONGO_DB: string;
      DB_SECRET: string;
    }
  }
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
    /**
     * The user's todoist id
     *  
    */
     todoistId: string;
  }

}

export { };
