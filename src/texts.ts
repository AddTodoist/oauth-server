enum OAuthServerTexts {
  GENERAL_WRONG = '🔴 Something went wrong',

  PROJECT_CONFIG_HEADER = `
🔴 Welcome again! \n\
Now that I can access your account, let's select:\n\
In which project sould I save the tweets?:\n`,

  PROJECT_CONFIG_FOOTER = `\n
To select a project send me\n\
/project <number>\n\
By default project 0 is selected`,
  TODOIST_ERROR = '🔴 Something went wrong with Todoist Servers. This is not your fault, also not ours. Please try again later.',
}

export default OAuthServerTexts;
