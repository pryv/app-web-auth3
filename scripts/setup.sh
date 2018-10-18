#!/bin/sh

set -e

# working dir fix
scriptsFolder=$(cd $(dirname "$0"); pwd)
cd $scriptsFolder/..


echo "
Installing Node modules from 'package.json' if necessary...
"
yarn install

if [ -d dist ] && [! -d dist/.git]
then
  echo "
  Conflict with previous unpublished build, cleaning 'dist' folder."
  rm -rf dist/
fi

if [ ! -d dist ]
then
  echo "
Setting up 'dist' folder for publishing to GitHub pages...
"
  git clone git@github.com:pryv/app-web-auth3.git dist && cd dist && git checkout gh-pages
fi

echo "
Setup is complete, you can proceed with publishing.
"