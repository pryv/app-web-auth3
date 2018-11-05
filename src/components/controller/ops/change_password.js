// @ flow

import type Context from '../../../Context.js';
import checkUsername from './check_username.js';

async function changePassword (
  ctx: Context,
  usernameOrEmail: string,
  newPassword: string,
  resetToken: string): number {
  const username = await checkUsername(ctx, usernameOrEmail);
  const status = await ctx.pryv.changePassword(username, newPassword, resetToken);
  return status;
}

export default changePassword;
