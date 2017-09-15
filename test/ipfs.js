import assert from 'assert';

import Ipfs from '../src/ipfs';

import { defaultConfig } from './index';

const ipfs = new Ipfs({ config: defaultConfig, emit: () => { } });

const testItems = [
  [{ hello: true }, { world: 'test' }, 'string'],
  [
    'QmcZMmd8oAJLa6Ejyk6F4uWAYiXvJNegjRMJX7nwd5y9nj',
    'Qma6voNxbgq83VKjFBjsRguEwURqHxJPpLApYo2Dnw2LWe',
    'QmVGtJ3tWYAotBwcwmRsdNqA9vtWZWkKCwxxLSwsBo3QFA',
  ],
];

describe('ipfs', function () {
  describe('put', function () {
    this.timeout(Infinity);
    it('puts one item to ipfs', async function () {
      assert.equal(await ipfs.put(testItems[0][0]), testItems[1][0]);
    });
    it('puts two items to ipfs', async function () {
      assert.deepEqual(await ipfs.put(testItems[0]), testItems[1]);
    });
  });
});
