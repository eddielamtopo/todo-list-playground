import {deepUpdate} from './deepUpdate';

describe('deepUpdate', () => {
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

    expect(test1).toEqual(expectedTest1);
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

    expect(test2).toEqual(expectedTest2);
  });
});
