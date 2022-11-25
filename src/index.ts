import 'services/configure-dotenv';

import { setupOAuthServer } from './server';

console.clear();

await setupOAuthServer();
