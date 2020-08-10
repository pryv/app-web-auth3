// @flow

import type Context from '../../../context.js';
import checkUsername from './check_username.js';

async function changePassword (
  ctx: Context,
  oldPassword: string,
  newPassword: string): Promise<void> {
  await checkUsername(ctx);
  await ctx.pryvService.changePassword(
    ctx.user.username,
    oldPassword,
    newPassword,
    ctx.user.personalToken);
}

export default changePassword;
