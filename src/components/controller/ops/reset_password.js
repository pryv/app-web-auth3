// @ flow

import Context from '../../../Context.js';
import checkUsername from './check_username.js';

async function resetPassword (usernameOrEmail: string): [string, number] {
  const username = await checkUsername(usernameOrEmail);
  const status = await Context.pryv.requestPasswordReset(username);
  return [username, status];
}

export default resetPassword;
