// @ flow

import Context from '../../../Context.js';
import type HostingSelection from '../../models/Hostings.js';

async function loadHostings (): HostingSelection {
  const hostings = await Context.pryv.getAvailableHostings();
  const hostingsSelection = hostings.getSelection();
  return hostingsSelection;
}

export default loadHostings;
