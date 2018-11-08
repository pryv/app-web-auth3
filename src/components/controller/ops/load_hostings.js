// @flow

import type Context from '../../../Context.js';
import type HostingSelection from '../../models/Hostings.js';

async function loadHostings (ctx: Context): Promise<HostingSelection> {
  const hostings = await ctx.pryv.getAvailableHostings();
  const hostingsSelection = hostings.getSelection();
  return hostingsSelection;
}

export default loadHostings;
