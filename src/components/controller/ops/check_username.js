// @flow

import type Context from '../../../context.js';

async function checkUsername (ctx: Context): Promise<void> {
  // Convert email to Pryv username if needed
  const username = ctx.user.username = await ctx.pryv.getUsernameForEmail(ctx.user.username);
  // Check if username exists and retrieve according server/core
  await ctx.pryv.checkUsernameExistence(username);
}

export default checkUsername;
