import {assert} from '@open-wc/testing';
import {deepCheckAny} from './deep';

suite('deepCheckAny', () => {
  test('should works with nested object', () => {
    const target = {
      a: {
        b: {
          c: true,
        },
      },
    };
    const result = deepCheckAny(target, true);
    assert.equal(result, true);
  });

  test('should works with array', () => {
    const target = [
      {
        b: {
          c: true,
        },
      },
    ];
    const result = deepCheckAny(target, true);
    assert.equal(result, true);
  });

  test('should works with nested array', () => {
    const target = [
      {
        a: [{b: false, a: {f: true}}],
        b: {
          c: [false, false],
        },
      },
    ];
    const result = deepCheckAny(target, true);
    assert.equal(result, true);
  });
});
