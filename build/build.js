'use strict'
require('./check-versions')()

process.env.NODE_ENV = 'production'

const ora = require('ora')
const rm = require('rimraf')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const config = require('../config')
const webpackConfig = require('./webpack.prod.conf')
const mkdirp = require('mkdirp')
const fs = require('fs');

const Aliases = require('../src/router/aliases.js');

const spinner = ora('building for production...')
spinner.start()

rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  webpack(webpackConfig, (err, stats) => {
    addAliases();
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    if (stats.hasErrors()) {
      console.log(chalk.red('  Build failed with errors.\n'))
      process.exit(1)
    }

    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  })
})

function addAliases() {
  const dest = config.build.assetsRoot + '/' + Aliases.basePath ;
  mkdirp.sync(dest);

  // static
  if (!fs.existsSync(dest + '/' + config.build.assetsSubDirectory)) {
    fs.symlinkSync('../' + config.build.assetsSubDirectory, dest + '/' + config.build.assetsSubDirectory);
  }

  Object.values(Aliases.pages).forEach((filename) => { 
    const link = dest + filename; 
    if (! fs.existsSync(link)) {
     fs.symlinkSync('../index.html', link);
    } else if (! fs.lstatSync(link).isSymbolicLink()) {
      throw new Error('Cannot create symlink, Please remove file ' + link);
    }
  });
}

