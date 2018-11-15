// @flow

import type Context from '../../../Context.js';
import checkUsername from './check_username.js';

async function changePassword (
  ctx: Context,
  newPassword: string,
  resetToken: string): Promise<void> {
  await checkUsername(ctx);
  await ctx.pryv.changePassword(
    ctx.user.username,
    newPassword,
    resetToken,
    ctx.appId);
}

export default changePassword;
