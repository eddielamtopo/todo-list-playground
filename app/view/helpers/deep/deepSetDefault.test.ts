import {deepSetDefault} from './deep';

describe('test deepSetDefault', () => {
  it('should set default value for nested object', () => {
    const target = {
      a: {
        b: {
          c: '',
          d: '',
        },
      },
    };
    const defaultValue = 'default 123';
    const newTarget = deepSetDefault(target, defaultValue);

    expect(newTarget).toStrictEqual({
      a: {
        b: {
          c: defaultValue,
          d: defaultValue,
        },
      },
    });
  });

  it('should work for setting default array value', () => {
    const target = {
      a: {
        b: {
          c: ['', '', ''],
          d: '',
        },
      },
    };

    const defaultValue = 'default 123';
    const newTarget = deepSetDefault(target, defaultValue);

    expect(newTarget).toStrictEqual({
      a: {
        b: {
          c: [defaultValue, defaultValue, defaultValue],
          d: defaultValue,
        },
      },
    });
  });

  it('should work on array of values', () => {
    const target = ['', '', {a: {b: '', c: ['']}}];
    const defaultValue = 'default 123';
    const newTaget = deepSetDefault(target, defaultValue);
    expect(newTaget).toStrictEqual([
      defaultValue,
      defaultValue,
      {a: {b: defaultValue, c: [defaultValue]}},
    ]);
  });
});
