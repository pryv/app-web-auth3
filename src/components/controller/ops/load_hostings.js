// @ flow

import Context from '../../../Context.js';
import type HostingSelection from '../../models/Hostings.js';

async function loadHostings (): [HostingSelection, string] {
  const hostings = await Context.pryv.getAvailableHostings();
  const hostingsSelection = hostings.getSelection();
  let preSelected = '';
  if (hostingsSelection.length > 0) {
    preSelected = hostingsSelection[0].value;
  }
  return [hostingsSelection, preSelected];
}

export default loadHostings;
