import {deepGetValue} from './deep';

describe('deepGetValue', () => {
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
    expect(deepGetValue(target, 'a.b.0.c.0')).toEqual(value);
    expect(deepGetValue(target1, '0.a.b.d')).toEqual(value);
  });
});
