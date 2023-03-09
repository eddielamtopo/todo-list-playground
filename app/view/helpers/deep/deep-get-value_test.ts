import {assert} from '@open-wc/testing';
import {deepGetValue} from './deep';

suite('deepGetValue', () => {
  test('should retrieve deeply nested value in object or array', () => {
    const value = 'pp';
    const target = {
      a: {
        b: [{c: [value]}],
      },
    };
    const target1 = [
      {
        a: {
          b: {
            c: 'not it',
            d: value,
          },
        },
      },
    ];
    assert.deepEqual(deepGetValue(target, 'a.b.0.c.0'), value);
    assert.deepEqual(deepGetValue(target1, '0.a.b.d'), value);
  });
});
