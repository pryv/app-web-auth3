// @ flow

import Context from '../../../Context.js';

async function checkUsername (usernameOrEmail: string): string {
  // Convert email to Pryv username if needed
  const username = await Context.pryv.getUsernameForEmail(usernameOrEmail);
  // Check if username exists
  await Context.pryv.checkUsernameExistence(username);
  return username;
}

export default checkUsername;
