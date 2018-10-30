// @ flow

import Context from '../../../Context.js';

async function login (
  usernameOrEmail: string,
  password: string): [string, string] {
  // Convert email to Pryv username if needed, check existence
  const username = await Context.pryv.getUsernameForEmail(usernameOrEmail);
  await Context.pryv.checkUsernameExistence(username);

  // Login against Pryv
  const personalToken = await Context.pryv.login(username, password);
  return [username, personalToken];
}

export default login;
