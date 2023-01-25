import { TwitterApi } from 'twitter-api-v2';
import Bugsnag from 'services/bugsnag';

const userClient = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

export const sendDirectMessage = async (userId: string, message: string) => {
  try {
    await userClient.v1.sendDm({
      recipient_id: userId,
      text: message,
    });
  } catch (e) {
    Bugsnag.notify(e);
    console.log('[sendDirectMessage] Something went wrong');
    console.log({ userId });
    console.log({ e });
  }
};
