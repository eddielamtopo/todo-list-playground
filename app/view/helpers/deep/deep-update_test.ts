import {assert} from '@open-wc/testing';
import {deepUpdate} from './deep';

suite('deepUpdate', () => {
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

  test('expect update object value in array to work', () => {
    const test1 = deepUpdate(
      nestedObject,
      'layer1.layer2.layer3.array.0.value',
      456
    );

    const expectedTest1 = {
      layer1: {
        layer2: {
          layer3: {
            array: [
              {
                value: 456,
                array2: ['abc'],
              },
            ],
            value: '123',
          },
        },
      },
    };

    assert.deepEqual(test1, expectedTest1 as unknown as typeof test1);
  });

  test('expect update nested array value to work', () => {
    const test2 = deepUpdate(
      nestedObject,
      'layer1.layer2.layer3.array.0.array2.0',
      'def'
    );

    const expectedTest2 = {
      layer1: {
        layer2: {
          layer3: {
            array: [
              {
                value: '321',
                array2: ['def'],
              },
            ],
            value: '123',
          },
        },
      },
    };

    assert.deepEqual(test2, expectedTest2 as unknown as typeof test2);
  });

  test('expect update array of nested values to work', () => {
    const target = [
      {
        layer1: {
          layer2: {
            value: 123,
          },
        },
      },
    ];

    const result = deepUpdate(target, '0.layer1.layer2.value', 456);
    assert.deepEqual(result, [
      {
        layer1: {
          layer2: {
            value: 456,
          },
        },
      },
    ]);
  });
});
