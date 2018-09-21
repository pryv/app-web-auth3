import {Selector} from 'testcafe';

// A fixture must be created for each group of tests.
fixture(`Register page`)
  // Load the URL your development server runs on.
  .page('http://localhost:8080/register');

// Create a new test(description, function(testController): <Promise>)
test('Body > h1 contains "Register a new user!"', async testController => {
  // Select the paragraph element under the body.
  // Must use promises (async / await  here) for communication with the browser.
  const titleSelector = await new Selector('body > h1');

  // Assert that the inner text of the paragraph is "Register a new user!"
  await testController.expect(titleSelector.innerText).eql('Register a new user!');
});
