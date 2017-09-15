#!/usr/bin/env node

import program from 'commander';
import fs from 'fs';
import getInstalledPath from 'get-installed-path';

import Dijix from '../';

import { version } from '../../package.json';

process.on('unhandledRejection', console.error);

const defaultConfig = `${process.env.HOME}/.dijixrc`;

const autoDetectTypes = ['dijix-image', 'dijix-pdf', 'dijix-attestation'];
// const autoDetectTypes = ['dijix-image'];

function parseConfig(str) {
  let config;
  try {
    // try parsing file content
    config = fs.existsSync(str) && JSON.parse(fs.readFileSync(str).toString());
  } catch (e) { /* ignore */ }
  if (!config) {
    try {
      // try parsing the string itself
      config = JSON.parse(str);
    } catch (e) { /* ignore */ }
  }
  return config || {};
}

program
  .version(version)
  .usage('create <type> <src>')
  .description('Creates a dijix object of <type> using <src> path and upload it to ipfs')
  .option('-c, --config [string / path]', 'base config file (JSON string or path); defaults to ~/.dijixrc', defaultConfig)
  .option('-o, --options [string / path]', 'action options file (JSON string or path)')
  .option('-t, --types [npm_modules]', 'specify types to register (comma seperated npm module names)', s => (
    s.split(',').map(npm => ({ npm }))
  ))
  .option('-p, --plugins [npm_modules]', 'specify plugins to register (comma seperated npm module names)', s => (
    s.split(',').map(p => p)
  ))
  .action(async (cmd, type, src) => {
    // parse the options
    const config = parseConfig(program.config);
    const options = parseConfig(program.options);

    // auto-detect types
    const detectedTypes = (
      await Promise.all(autoDetectTypes.map(async (module) => {
        try {
          return { path: await getInstalledPath(module) };
        } catch (e) {
          return null;
        }
      }))
    ).filter(a => a);
    // register passed types
    const typesConfig = (detectedTypes).concat((config.types || []).concat(program.types || []));
    if (typesConfig.length === 0 && detectedTypes.length === 0) {
      throw new Error(`No dijix types set. Use -t, specify in config file, or npm i -g ${autoDetectTypes.join(' ')}.`);
    }
    const types = await Promise.all(typesConfig.map(async ({ npm, path, config: typeConfig }) => {
      try {
        const typePath = path || await getInstalledPath(npm);
        const required = require(typePath);
        const DijixType = required.default || required;
        const t = new DijixType(typeConfig);
        return t;
      } catch (e) {
        throw new Error(`Could not find path: ${npm || path} - ${e}`);
      }
    }));
    // TODO register plugins...
    const dijix = new Dijix({ ...config, types });
    const obj = await dijix.create(type, { src, ...options });
    process.stdout.write(JSON.stringify(obj, null, 2));
  });

program.parse(process.argv);
