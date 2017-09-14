#!/usr/bin/env node

process.on('unhandledRejection', console.error);

require('babel-register')({
  ignore: /node_modules\/(?!dijix-)/,
});
require('babel-polyfill');
require('./cli.js');
