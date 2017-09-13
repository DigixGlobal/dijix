import IpfsApi from 'ipfs-api';
import * as a from 'awaiting';

function itemToBuffer(item) {
  if (Buffer.isBuffer(item)) { return item; }
  if (typeof item === 'string') { return Buffer.from(item); }
  return Buffer.from(JSON.stringify(item));
}

export default class Ipfs {
  constructor(dijix) {
    const { config: { ipfsEndpoint, concurrency } } = dijix;
    try {
      const [protocol, endpoint] = ipfsEndpoint.split('://');
      const [host, port] = endpoint.split(':');
      this.dijix = dijix;
      this.ipfs = new IpfsApi({ host, port, protocol });
      this.concurrency = concurrency || 10;
    } catch (e) {
      throw new Error(`Invalid IPFS endpoint: ${ipfsEndpoint}`);
    }
  }
  async add(item) {
    const buffer = itemToBuffer(item);
    const res = await a.callback(this.ipfs.add, buffer);
    const { hash } = res[0];
    this.dijix.emit('ipfsHashAdded', hash);
    return hash;
  }
  put(items) {
    if (Array.isArray(items)) { return a.map(items, this.concurrency, i => this.add(i)); }
    return this.add(items);
  }
}
