/* global describe, it, beforeEach, afterEach */

import Pryv from '@/components/models/Pryv';
import moxios from 'moxios';

describe('Pryv.test.js', () => {
  beforeEach(function () {
    // import and pass your custom axios instance to this method
    moxios.install();
  });

  afterEach(function () {
    // import and pass your custom axios instance to this method
    moxios.uninstall();
  });

  it('...', () => {

  });
});
