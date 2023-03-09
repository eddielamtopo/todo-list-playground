import {assert} from '@open-wc/testing';
import {deepSetAll} from './deep';

suite('deepSetAll', () => {
  test('should set default value for nested object', () => {
    const target = {
      a: {
        b: {
          c: '',
        },
      },
    };
    const defaultValue = 'default';
    const updatedTarget = deepSetAll(target, defaultValue);
    const correctResult: {[x: string]: any} = {
      a: {
        b: {
          c: defaultValue,
        },
      },
    };
    assert.deepEqual(updatedTarget, correctResult);
  });

  test('should works on array with nested values', () => {
    const target = ['abc', '', {a: {b: 'abc', c: ['']}}];
    const defaultValue = 'default';
    const newTarget = deepSetAll(target, defaultValue);
    assert.deepEqual(newTarget, [
      defaultValue,
      defaultValue,
      {a: {b: defaultValue, c: [defaultValue]}},
    ] as unknown as typeof newTarget);
  });

  test('should set values in nested array', () => {
    const target = {
      a: {
        b: {
          c: ['', 'abc', ''],
          d: '123',
        },
      },
    };

    const defaultValue = 'default';
    const newTarget = deepSetAll(target, defaultValue);
    const correctResult = {
      a: {
        b: {
          c: [defaultValue, defaultValue, defaultValue],
          d: defaultValue,
        },
      },
    };
    assert.deepEqual(newTarget, correctResult as unknown as typeof newTarget);
  });
});
