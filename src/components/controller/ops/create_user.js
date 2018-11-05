// @ flow

import type Context from '../../../Context.js';
import type NewUser from '../../models/Pryv.js';

async function createUser (
  ctx: Context,
  username: string,
  password: string,
  email: string,
  hosting: string,
): NewUser | void {
  // Create the new user
  const newUser = await ctx.pryv.createUser(username, password, email, hosting);

  // If the goal was only to register a new user (no requested permissions)
  // then we just redirect the new user to its pryv core
  if (ctx.permissions.list == null) {
    location.href = ctx.pryv.core(newUser.username);
  } else {
    return newUser;
  }
}

export default createUser;
