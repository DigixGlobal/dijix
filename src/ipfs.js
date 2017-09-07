import IpfsApi from 'ipfs-api';
import * as a from 'awaiting';

function itemToBuffer(item) {
  if (Buffer.isBuffer(item)) { return item; }
  if (typeof item === 'string') { return Buffer.from(item); }
  return Buffer.from(JSON.stringify(item));
}

export default class Ipfs {
  constructor({ ipfsEndpoint, concurrency }) {
    try {
      const [protocol, endpoint] = ipfsEndpoint.split('://');
      const [host, port] = endpoint.split(':');
      this.ipfs = new IpfsApi({ host, port, protocol });
      this.concurrency = concurrency || 10;
    } catch (e) {
      throw new Error(`Invalid IPFS endpoint: ${ipfsEndpoint}`);
    }
  }
  async add(item) {
    const buffer = itemToBuffer(item);
    const res = await a.callback(this.ipfs.add, buffer);
    return res[0].hash;
  }
  put(items) {
    if (Array.isArray(items)) { return a.map(items, this.concurrency, i => this.add(i)); }
    return this.add(items);
  }
}
