// @ flow

import Context from '../../../Context.js';
import checkUsername from './check_username.js';

async function login (
  usernameOrEmail: string,
  password: string): string {
  const username = await checkUsername(usernameOrEmail);

  // Login against Pryv
  const personalToken = await Context.pryv.login(username, password);
  return personalToken;
}

export default login;
