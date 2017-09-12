import program from 'commander';
import fs from 'fs';
import getInstalledPath from 'get-installed-path';

import Dijix from '../';

const defaultConfig = `${process.env.HOME}/.dijixrc`;

const autoDetectTypes = ['dijix-image', 'dijix-pdf'];

program
  .version('0.0.1')
  .usage('create <type> <src>')
  .description('Creates a dijix object of <type> using <src> path and upload it to ipfs')
  .option('-c, --config [path]', 'base config file (JSON path); defaults to ~/.dijixrc', defaultConfig)
  .option('-o, --overrides [path]', 'action overrides file (JSON path)')
  .option('-t, --types [npm_modules]', 'specify types to register (comma seperated npm module names)', (v) => {
    v.split(',').map(npm => ({ npm }));
  })
  .action(async (cmd, type, src) => {
    // read the config file
    let config = {};
    let overrides = {};
    try {
      config = JSON.parse(fs.readFileSync(program.config).toString());
      overrides = program.overrides && JSON.parse(fs.readFileSync(program.overrides).toString());
    } catch (e) { /* do nothing */ }
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
        return new DijixType(typeConfig);
      } catch (e) {
        throw new Error(`Could not find path: ${npm || path} - ${e}`);
      }
    }));
    // TODO register plugins...
    const dijix = new Dijix({ ...config, types });
    const obj = await dijix.create(type, { src, ...overrides });
    console.log(JSON.stringify(obj, null, 2));
  });

program.parse(process.argv);
