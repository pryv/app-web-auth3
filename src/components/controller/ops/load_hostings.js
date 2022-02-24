// @flow

import type Context from '../../../context.js';
import type { HostingSelection } from '../../models/Hostings.js';

async function loadHostings (ctx: Context): Promise<HostingSelection> {
  const hostings = await ctx.pryvService.getAvailableHostings();
  const hostingsSelection = hostings.getSelection();
  return hostingsSelection;
}

export default loadHostings;
