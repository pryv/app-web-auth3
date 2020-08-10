// @flow

import type Context from '../../../context.js';
import checkUsername from './check_username.js';

async function resetPassword (
  ctx: Context,
  newPassword: string,
  resetToken: string): Promise<void> {
  await checkUsername(ctx);
  await ctx.pryvService.resetPassword(
    ctx.user.username,
    newPassword,
    resetToken,
    ctx.appId);
}

export default resetPassword;
