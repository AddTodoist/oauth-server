import axios from 'axios';

const deployOAuthURL = process.env.DEPLOY_ENDPOINT_OAUTH;

if (deployOAuthURL) await axios.get(deployOAuthURL);

