import UserInfo from './database';
import JustCache from 'just-cache';

const HALF_HOUR_IN_SECONDS = 1800;

const cache = new JustCache({ ttl: HALF_HOUR_IN_SECONDS });

export const getUsersCount = async () => {
  const cachedCount = cache.get<number>('usersCount');
  if (cachedCount) return cachedCount;

  const count = await UserInfo.countDocuments();
  cache.set('usersCount', count);
  return count;
};

// https://shields.io/endpoint
export const generateShieldResponse = (count: number) => ({
  schemaVersion: 1,
  label: 'Total Users',
  message: String(count),
  cacheSeconds: HALF_HOUR_IN_SECONDS,
}) as const;
