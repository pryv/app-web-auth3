// @flow

import type Context from '../../../context.js';
import checkUsername from './check_username.js';

async function resetPassword (ctx: Context): Promise<void> {
  await checkUsername(ctx);
  await ctx.pryvService.requestPasswordReset(ctx.user.username, ctx.appId);
}

export default resetPassword;
