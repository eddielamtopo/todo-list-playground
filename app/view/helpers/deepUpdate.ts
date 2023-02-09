/**
 * A pure function that recursively update nested array or object
 *
 * JS Fiddle: https://jsfiddle.net/yztmwn9j/1/
 *
 * Ref: https://www.webtips.dev/webtips/javascript/update-nested-property-by-string
 * */
export function deepUpdate(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target: {[key: string]: any},
  path: string,
  value: unknown
): unknown {
  const [head, ...rest] = path.split('.');
  if (Array.isArray(target)) {
    return [
      ...target.slice(0, Number(head)),
      rest.length
        ? deepUpdate(target[Number(head)], rest.join('.'), value)
        : value,
      ...target.slice(Number(head) + 1),
    ];
  }
  return {
    ...target,
    [head]: rest.length
      ? deepUpdate(target[head], rest.join('.'), value)
      : value,
  };
}

// tests
const nestedObject = {
  layer1: {
    layer2: {
      layer3: {
        array: [
          {
            value: '321',
            array2: ['abc'],
          },
        ],
        value: '123',
      },
    },
  },
};

const test1 = deepUpdate(
  nestedObject,
  'layer1.layer2.layer3.array.0.value',
  '456'
);

const test2 = deepUpdate(
  nestedObject,
  'layer1.layer2.layer3.array.0.array2.0',
  'def'
);

console.log('updated:', test1);
console.log('updated:', test2);
