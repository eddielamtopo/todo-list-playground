import {deepCheckAny} from './deep';

describe('deepCheckAny', () => {
  it('should check if value is in target of object', () => {
    const target = {
      a: {
        b: {
          c: true,
        },
      },
    };
    const result = deepCheckAny(target, true);
    expect(result).toBe(true);
  });

  it('should check if value is in target of array', () => {
    const target = [
      {
        b: {
          c: true,
        },
      },
    ];
    const result = deepCheckAny(target, true);
    expect(result).toBe(true);
  });

  it('should check if value is in target of nested array or object', () => {
    const target = [
      {
        a: [{b: false, a: {f: true}}],
        b: {
          c: [false, false],
        },
      },
    ];
    const result = deepCheckAny(target, true);
    expect(result).toBe(true);
  });
});
