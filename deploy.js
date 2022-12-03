const deployOAuthURL = process.env.DEPLOY_ENDPOINT_OAUTH;

if (deployOAuthURL) await fetch(deployOAuthURL);

