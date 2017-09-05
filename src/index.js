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
  setConfig({ types, ...config } = {}) {
    this.config = { ...(this.config || defaultConfig), ...config };
    if (config.ipfsEndpoint) { this.ipfs = new Ipfs(this.config); }
    if (types) { this.registerTypes(types); }
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
  async create(typeName, payload) {
    if (!this.types) { throw new Error('Not initialized!'); }
    const type = this.types[typeName];
    if (!type) { throw new Error(`Type does not exist: ${typeName}`); }
    // trigger an event!
    const headers = this.populateHeaders(typeName);
    // trigger some middleware!
    const data = type.creationPipeline ? await type.creationPipeline(payload, this) : {};
    const dijixObject = { ...headers, data };
    // trigger some more middleware!
    const ipfsHash = await this.ipfs.put(dijixObject);
    // trigger even more middleware!
    return { dijixObject, ipfsHash };
  }
  async fetch(ipfsHash, opts) {
    const { httpEndpoint } = this.config;
    const body = await fetch(`${httpEndpoint}/${ipfsHash}`);
    const json = await body.json();
    // return the IPFS object
    // fetch(this.ipfsEndpoint ipfsHash);
    // TODO determine if it needs to be decrypted...
    // TODO determine if we should resolve links...
    return json;
  };
}
