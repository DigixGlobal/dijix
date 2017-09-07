/* globals fetch */
import 'isomorphic-fetch';

import Ipfs from './ipfs';

const endPoints = typeof window === 'undefined' ? {
  ipfsEndpoint: 'http://localhost:5001',
  httpEndpoint: 'http://localhost:8080/ipfs',
} : {
  ipfsEndpoint: 'https://ipfs.infura.io:5001',
  httpEndpoint: 'https://ipfs.infura.io/ipfs',
};

export const defaultConfig = {
  ...endPoints,
  concurrency: 10,
};

export default class Dijix {
  constructor(config) {
    this.setConfig(config);
  }
  setConfig({ plugins, types, ...config } = {}) {
    this.config = { ...(this.config || defaultConfig), ...config };
    if (config.ipfsEndpoint) { this.ipfs = new Ipfs(this.config); }
    if (plugins) { this.registerPlugins(plugins); }
    if (types) { this.registerTypes(types); }
  }
  registerPlugins(plugins) {
    if (!Array.isArray(plugins)) { throw new Error('Plugins must be an array'); }
    if (this.plugins) { throw new Error('Plugins already defined'); }
    this.plugins = { populated: [], created: [], uploaded: [], fetched: [], read: [] };
    plugins.forEach(p => Object.keys(this.plugins).forEach((k) => {
      if (p[k]) { this.plugins[k] = this.plugins[k].concat([(...opts) => p[k](...opts)]); }
    }));
  }
  registerTypes(types) {
    if (!Array.isArray(types)) { throw new Error('Invalid Types'); }
    types.forEach((t) => { if (!t.type) { throw new Error(`Invalid type ${t}')`); } });
    this.types = types.reduce((o, t) => ({ ...o, [t.type]: t }), this.types || {});
  }
  populateHeaders(type) {
    return {
      type,
      created: new Date().getTime(),
      schema: this.types[type].schema || '0.0.1',
    };
  }
  async creationPipeline(payload, type) {
    return type.creationPipeline ? type.creationPipeline(payload, this) : {};
  }
  async readPipeline(dijixObject, opts) {
    const type = dijixObject.type && this.types[dijixObject.type];
    return type.readPipeline ? type.readPipeline(dijixObject, this, opts) : dijixObject;
  }
  async emit(stage, payload = {}) {
    const plugins = this.plugins && this.plugins[stage];
    if (!plugins || plugins.length === 0) { return payload; }
    return plugins.reduce(async (obj, plugin) => plugin(obj, this), payload);
  }
  async create(typeName, payload) {
    if (!this.types) { throw new Error('Not initialized!'); }
    const type = this.types[typeName];
    if (!type) { throw new Error(`Type does not exist: ${typeName}`); }
    let dijixObject = await this.emit('populated', this.populateHeaders(typeName));
    dijixObject = await this.emit('created', { ...dijixObject, data: await this.creationPipeline(payload, type) });
    return this.emit('uploaded', { ...dijixObject, ipfsHash: await this.ipfs.put(dijixObject) });
  }
  async fetch(ipfsHash, opts) {
    const body = await fetch(`${this.config.httpEndpoint}/${ipfsHash}`);
    const json = await body.json();
    const dijixObject = await this.emit('fetched', json);
    return this.emit('read', await this.readPipeline(dijixObject, opts));
  }
}
