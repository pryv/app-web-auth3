// @ flow

import Context from '../../../Context.js';
import checkUsername from './check_username.js';

async function changePassword (
  usernameOrEmail: string,
  newPassword: string,
  resetToken: string): number {
  const username = await checkUsername(usernameOrEmail);
  const status = await Context.pryv.changePassword(username, newPassword, resetToken);
  return status;
}

export default changePassword;
