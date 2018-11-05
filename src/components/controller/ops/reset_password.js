// @ flow

import type Context from '../../../Context.js';
import checkUsername from './check_username.js';

async function resetPassword (ctx: Context, usernameOrEmail: string): number {
  const username = await checkUsername(ctx, usernameOrEmail);
  const status = await ctx.pryv.requestPasswordReset(username);
  return status;
}

export default resetPassword;
