import {Selector} from 'testcafe';

fixture(`Register page`)
  .page('http://localhost:8080/#/register');

test('Form validation', async testController => {
  const emailSelector = Selector('#email');
  const usernameSelector = Selector('#username');
  const passSelector = Selector('#password');
  const repassSelector = Selector('#passConfirmation');
  const hostingSelector = Selector('#hosting');

  const formSelector = Selector('#registerForm');

  await testController
    .typeText(emailSelector, 'invalid_email')
    .expect(formSelector.textContent).contains('E-mail must be valid')
    .typeText(emailSelector, 'test@test.com')
    .typeText(usernameSelector, 'test')
    .typeText(passSelector, 'password')
    .typeText(repassSelector, 'password')
    .typeText(hostingSelector, '1')
    .click('#submitButton');
});
