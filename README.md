# Authentication web app (app-web-auth v3)

Pryv.io web pages for user registration, authentication & password reset.

These web pages are the "popup frame" that opens during the authentication process [http://api.pryv.com/reference/#authentication](http://api.pryv.com/reference/#authentication)

## How to?

| Task                              | Command                        |
| --------------------------------- | ------------------------------ |
| Install dependencies              | `yarn install`                 |
| Create distribution               | `yarn build`                   |
| Run the app locally               | `yarn start`                   |
| Run unit tests                    | `yarn unit`                    |
| Run E2E tests                     | `yarn e2e`                     |
| Run E2E tests with snapshots      | `yarn e2eS`                    |
| Run eslint                        | `yarn lint`                    |

### Publish to github pages

If it is the first time you publish app-web-auth3, be sure to run `yarn setup` once.

Create a distribution with your changes by running `yarn build`.

Then, publish your changes by running `yarn upload ${COMMIT_MESSAGE}`

If you encounter conflicts while publishing, run `yarn clear` to reset the `dist/` folder,
then build and publish again.

## License

[Revised BSD license](https://github.com/pryv/documents/blob/master/license-bsd-revised.md)