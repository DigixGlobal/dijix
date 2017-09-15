import assert from 'assert';

import Dijix from '../src';

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

class MockPinningMiddleware {
  constructor(message) {
    this.message = message;
  }
  pin() {
    return new Promise(resolve => setTimeout(() => resolve(this.message), 20));
  }
  async uploaded(payload) {
    return { ...payload, pinned: await this.pin(payload) };
  }
}

class MockType {
  constructor(type, flag) {
    this.type = type;
    this.flag = !!flag;
  }
  creationPipeline() {
    return { myType: this.type, myFlag: this.flag };
  }
  readPipeline(payload) {
    return { ...payload, testTransform: this.flag };
  }
}

describe('dijix', function () {
  let dijix;
  beforeEach(() => { dijix = new Dijix(defaultConfig); });
  describe('initialization', function () {
    it('sets the default config', function () {
      dijix = new Dijix();
      assert.deepEqual(dijix.config, defaultConfig);
    });
    it('overrides the default config', function () {
      const override = { ipfsEndpoint: 'https://ipfs.infura.io:3030', badConfig: true };
      dijix = new Dijix(override);
      assert.deepEqual(dijix.config, { ...defaultConfig, ...override });
    });
  });
  describe('setConfig', function () {
    const testConfig = { ipfsEndpoint: 'https://localhost:8080' };
    const testConfig2 = { badConfig: true, blah: 3, ipfsEndpoint: 'http://mywebsite.com:3020' };
    it('allow setting the config', function () {
      dijix.setConfig(testConfig);
      assert.deepEqual(dijix.config, { ...defaultConfig, ...testConfig }, '1');
      dijix.setConfig(testConfig2);
      assert.deepEqual(dijix.config, { ...defaultConfig, ...testConfig2 }, '2');
    });
  });
  describe('registerTypes', function () {
    const types = [
      [new MockType('one'), new MockType('two')],
      [new MockType('three'), new MockType('four')],
      [new MockType('one', true), new MockType('two', true)],
    ];
    const expected = [
      { one: { type: 'one', flag: false }, two: { type: 'two', flag: false } },
      { three: { type: 'three', flag: false }, four: { type: 'four', flag: false } },
      { one: { type: 'one', flag: true }, two: { type: 'two', flag: true } },
    ];
    it('throws invalid types', function () {
      assert.throws(() => dijix.registerTypes(), 'does not throw undefined');
      assert.throws(() => dijix.registerTypes('test'), 'does not throw string');
      assert.throws(() => dijix.registerTypes([{ notype: true }]), 'does not throw object without type key');
    });
    it('accepts valid types', function () {
      dijix.registerTypes(types[0]);
      assert.deepEqual(dijix.types, expected[0], 'initial');
      dijix.registerTypes(types[1]);
      assert.deepEqual(dijix.types, { ...expected[0], ...expected[1] }, 'additional');
      dijix.registerTypes(types[2]);
      assert.deepEqual(dijix.types, { ...expected[0], ...expected[1], ...expected[2] }, 'overrides');
    });
    it('accepts valid types (in constrcutor)', function () {
      dijix = new Dijix({ types: types[0] });
      assert.deepEqual(dijix.types, expected[0], 'constructor');
      dijix.registerTypes(types[1]);
      assert.deepEqual(dijix.types, { ...expected[0], ...expected[1] }, 'additional');
    });
  });
  describe('populateHeaders', function () {
    it('throws non existant types', function () {
      assert.throws(() => dijix.populateHeaders('zebra'));
    });
    it('creates the correct default schema', function () {
      dijix.registerTypes([{ type: 'test' }]);
      const before = new Date().getTime();
      const { type, schema, created } = dijix.populateHeaders('test');
      assert.deepEqual({ type, schema }, { type: 'test', schema: '0.0.1' });
      const after = new Date().getTime();
      assert.ok(before <= created && after >= created);
    });
    it('creates the correct default overridden schema', function () {
      dijix.registerTypes([{ type: 'test2', schema: '0.0.3' }]);
      const { type, schema } = dijix.populateHeaders('test2');
      assert.deepEqual({ type, schema }, { type: 'test2', schema: '0.0.3' });
    });
  });
  describe('create & fetch', function () {
    let dijixObject;
    describe('create', function () {
      it('creates the dijixObject and uploads it to ipfs', async function () {
        dijix.registerTypes([new MockType('test')]);
        const before = new Date().getTime();
        dijixObject = await dijix.create('test');
        const { type, created, schema, data, ipfsHash } = dijixObject;
        assert.deepEqual({ type, schema, data }, { type: 'test', schema: '0.0.1', data: { myType: 'test', myFlag: false } });
        const after = new Date().getTime();
        assert.ok(before <= created && after >= created);
        assert.ok(ipfsHash.indexOf('Qm') === 0);
      });
    });
    describe('fetch', function () {
      it('fetches the dijix object from the IPFS hash', async function () {
        dijix.registerTypes([new MockType('test')]);
        const { ipfsHash, ...rest } = dijixObject;
        assert.deepEqual(await dijix.fetch(ipfsHash), { ...rest, testTransform: false });
      });
    });
  });
  describe('plugins', function () {
    it('hooks into global plugins', async function () {
      dijix = new Dijix({
        ...defaultConfig,
        types: [new MockType('test')],
        plugins: [new MockPinningMiddleware('test message')],
      });
      assert.equal((await dijix.create('test')).pinned, 'test message');
    });
  });
});
