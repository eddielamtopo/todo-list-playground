import {FieldPath} from '../types';

interface Indexable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: number]: any;
}

export function deepUpdate<
  T extends Indexable,
  TFieldName extends string = FieldPath<T>
>(target: T, path: TFieldName, value: unknown): T {
  const [head, ...rest] = path.split('.');
  if (Array.isArray(target)) {
    return [
      ...target.slice(0, Number(head)),
      rest.length
        ? deepUpdate(target[Number(head)], rest.join('.'), value)
        : value,
      ...target.slice(Number(head) + 1),
    ] as unknown as T;
  }
  return {
    ...target,
    [head]: rest.length
      ? deepUpdate(
          (target as Indexable)[head] as Indexable,
          rest.join('.'),
          value
        )
      : value,
  } as T;
}

export function deepGetValue<
  T extends Indexable,
  TFieldName extends string = FieldPath<T>
>(target: T, path: TFieldName): T[TFieldName] {
  const [head, ...rest] = path.split('.');
  const targetValue = target[head];
  // if there are more to go
  if (rest.length) {
    return deepGetValue(targetValue as Indexable, rest.join('.'));
  }
  // if we have reached the end
  else {
    return targetValue;
  }
}

export function deepSetAll<T extends Indexable>(
  target: Indexable,
  defaultValue: string | number | boolean
): T {
  const keys = typeof target === 'string' ? [] : Object.keys(target);
  const clone = Array.isArray(target) ? [...target] : {...target};
  const isArray = Array.isArray(clone);

  // iterate and update each value in the object / array to 'defaultValue'...
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const indexer = isArray ? i : key;

    // if the value to be updated is string ...
    if (!Array.isArray(clone) && typeof clone[indexer] === 'string') {
      clone[indexer] = defaultValue;
      continue;
    }

    // else if the value is has nested values -- i.e. is array or object ...
    if (Object.keys((clone as Indexable)[indexer]).length) {
      // if we are sure it is an object ...
      if (!Array.isArray(clone)) {
        clone[indexer] = deepSetAll(clone[indexer], defaultValue);
        continue;
      }
      // if we are sure it is an array ...
      if (typeof indexer === 'number') {
        clone[indexer] = deepSetAll(clone[indexer], defaultValue);
        continue;
      }
      // is array but indexer is not number ...
    }

    (clone as Indexable)[indexer] = defaultValue;
  }

  return clone as T;
}

export function deepCheckAny(
  target: Indexable,
  value: unknown,
  _previousResult = false
) {
  if (typeof target !== 'object') return target === value;
  // iterate through the target
  const indexers = Object.keys(target);
  let currentResult = _previousResult;

  for (let i = 0; i < indexers.length; i++) {
    const indexedValue = target[indexers[i]];
    // not iterable
    if (typeof indexedValue !== 'object') {
      currentResult = indexedValue === value;
    } else {
      // iterable
      currentResult = deepCheckAny(indexedValue, value, currentResult);
    }

    // if there's a match already, return true
    if (currentResult === true) {
      return true;
    }
  }

  return Boolean(currentResult);
}
