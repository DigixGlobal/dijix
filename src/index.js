/* globals fetch */
import 'isomorphic-fetch';

import Ipfs from './ipfs';

const pluginKeys = ['populated', 'created', 'uploaded', 'fetched', 'read', 'ipfsHashAdded'];

const endPoints = typeof window === 'undefined' ? {
  ipfsEndpoint: 'http://localhost:5001',
  httpEndpoint: 'http://localhost:8080/ipfs',
} : {
  ipfsEndpoint: 'https://ipfs.infura.io:5001',
  httpEndpoint: 'https://ipfs.infura.io/ipfs',
};

const defaultConfig = {
  ...endPoints,
  concurrency: 10,
  cache: true,
  requestTimeout: 1000,
};

export default class Dijix {
  constructor(config) {
    this.types = {};
    this.cache = {};
    this.setConfig(config);
  }
  setConfig({ plugins, types, ...config } = {}) {
    this.config = { ...(this.config || defaultConfig), ...config };
    if ((!this.ipfs && this.config.ipfsEndpoint) || config.ipfsEndpoint) {
      this.ipfs = new Ipfs(this);
    }
    if (plugins) { this.registerPlugins(plugins); }
    if (types) { this.registerTypes(types); }
  }
  registerPlugins(plugins) {
    if (!Array.isArray(plugins)) { throw new Error('Plugins must be an array'); }
    if (this.plugins) { throw new Error('Plugins already defined'); }
    this.plugins = {};
    plugins.forEach(p => pluginKeys.forEach((k) => {
      if (p[k]) { this.plugins[k] = (this.plugins[k] || []).concat([(...opts) => p[k](...opts)]); }
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
    if (dijixObject === null || dijixObject === undefined) return dijixObject;
    const type = dijixObject.type && this.types[dijixObject.type];
    return type && type.readPipeline ? type.readPipeline(dijixObject, this, opts) : dijixObject;
  }
  async emit(stage, payload = {}) {
    const plugins = this.plugins && this.plugins[stage];
    if (!plugins || plugins.length === 0) { return payload; }
    return plugins.reduce(async (obj, plugin) => plugin(obj, this) || obj, payload);
  }
  async create(typeName, payload) {
    if (!this.types) { throw new Error('Not initialized!'); }
    const type = this.types[typeName];
    if (!type) { throw new Error(`Type does not exist: ${typeName}`); }
    let dijixObject = await this.emit('populated', this.populateHeaders(typeName));
    dijixObject = await this.emit('created', { ...dijixObject, data: await this.creationPipeline(payload, type) });
    // TODO options to embed it...
    return this.emit('uploaded', { ...dijixObject, ipfsHash: await this.ipfs.put(dijixObject) });
  }
  timeoutPromise(promise) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('promise timeout'));
      }, this.config.requestTimeout);
      promise.then(
        (res) => {
          clearTimeout(timeoutId);
          resolve(res);
        },
        (err) => {
          clearTimeout(timeoutId);
          reject(err);
        },
      );
    });
  }
  async failSafeFetch(ipfsHash, opts) {
    let dijixObject = this.config.cache && this.cache[ipfsHash];
    if (!dijixObject) {
      try {
        const body = await this.timeoutPromise(fetch(`${this.config.httpEndpoint}/${ipfsHash}`));
        if (body.status >= 200 && body.status < 300) {
          const json = await body.json();
          dijixObject = await this.emit('fetched', json);
          if (this.config.cache && !this.cache[ipfsHash]) {
            this.cache[ipfsHash] = dijixObject;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    return this.emit('read', await this.readPipeline(dijixObject, opts));
  }
  async fetch(ipfsHash, opts) {
    let dijixObject = this.config.cache && this.cache[ipfsHash];
    if (!dijixObject) {
      const body = await fetch(`${this.config.httpEndpoint}/${ipfsHash}`);
      const json = await body.json();
      // TODO resolve links...
      dijixObject = await this.emit('fetched', json);
    }
    // cache it (if not cached)...
    if (this.config.cache && !this.cache[ipfsHash]) {
      this.cache[ipfsHash] = dijixObject;
    }
    return this.emit('read', await this.readPipeline(dijixObject, opts));
  }
}
