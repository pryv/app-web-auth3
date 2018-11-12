// @flow

import type Context from '../../../Context.js';
import type NewUser from '../../models/Pryv.js';

async function createUser (
  ctx: Context,
  password: string,
  email: string,
  hosting: string,
): Promise<NewUser> {
  // Create the new user
  const newUser = await ctx.pryv.createUser(ctx.user.username, password, email, hosting, ctx.language);
  return newUser;
}

export default createUser;
