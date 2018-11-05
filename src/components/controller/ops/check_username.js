// @ flow

import type Context from '../../../Context.js';

async function checkUsername (ctx: Context, usernameOrEmail: string): string {
  // Convert email to Pryv username if needed
  const username = await ctx.pryv.getUsernameForEmail(usernameOrEmail);
  // Check if username exists
  await ctx.pryv.checkUsernameExistence(username);
  return username;
}

export default checkUsername;
