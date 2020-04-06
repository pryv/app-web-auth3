
const createTestCafe = require('testcafe');
const testHelpers = require('./test-helpers');
let testcafe = null;

/**
 * Launch with node tests/run.js (-s)
 * -s: to take snapshots
 */
(async () => {
  await testHelpers.load();

  createTestCafe('localhost')
    .then(tc => {
      testcafe = tc;
      const runner = testcafe.createRunner();

      runner
        .src(['tests/e2e/*.test.js'])
        .browsers(['chrome'])
        .startApp('yarn dev');

      if (process.argv.includes('-s')) {
        console.log('saving snapshots');
        // screenshots does not work for an unkown reason.
        // needs to investigate
        // https://devexpress.github.io/testcafe/documentation/using-testcafe/programming-interface/runner.html#screenshots
        runner.screenshots({
          path: 'screenshots',
          takeOnFails: true,
        });
      };

      return runner.run();
    })
    .then(failedCount => {
      console.log('Tests failed: ' + failedCount);
      testcafe.close();
    });
})();
