// @ flow

import Context from '../../../Context.js';
import checkUsername from './check_username.js';

async function resetPassword (usernameOrEmail: string): number {
  const username = await checkUsername(usernameOrEmail);
  const status = await Context.pryv.requestPasswordReset(username);
  return status;
}

export default resetPassword;
