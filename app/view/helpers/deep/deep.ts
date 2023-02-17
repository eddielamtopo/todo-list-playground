/**
 * A pure function that recursively update nested array or object
 *
 * JS Fiddle: https://jsfiddle.net/yztmwn9j/1/
 *
 * Ref: https://www.webtips.dev/webtips/javascript/update-nested-property-by-string
 * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TObject = Record<string | number, any>;

export function deepUpdate<T extends object>(
  target: T,
  path: string,
  value: unknown
): T {
  const [head, ...rest] = path.split('.');
  if (Array.isArray(target)) {
    return [
      ...target.slice(0, Number(head)),
      rest.length
        ? deepUpdate(target[Number(head)], rest.join('.'), value)
        : value,
      ...target.slice(Number(head) + 1),
    ] as T;
  }
  return {
    ...target,
    [head]: rest.length
      ? deepUpdate((target as TObject)[head], rest.join('.'), value)
      : value,
  } as T;
}

export function deepGetValue<T extends TObject>(
  target: T,
  path: string
): unknown {
  const [head, ...rest] = path.split('.');
  const targetValue = target[head];
  // if there are more to go
  if (rest.length) {
    return deepGetValue(targetValue, rest.join('.'));
  }
  // if we have reached the end
  else {
    return targetValue;
  }
}

export function deepSetDefault<T extends TObject>(
  target: TObject,
  defaultValue: unknown
): T {
  if (
    typeof target === 'string' ||
    typeof target === 'number' ||
    typeof target === 'bigint'
  ) {
    return defaultValue as T;
  }

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
    if (Object.keys((clone as TObject)[indexer]).length) {
      // if we are sure it is an object ...
      if (!Array.isArray(clone)) {
        clone[indexer] = deepSetDefault(
          (clone as TObject)[indexer],
          defaultValue
        );
        continue;
      }
      // if we are sure it is an array ...
      if (typeof indexer === 'number') {
        clone[indexer] = deepSetDefault(clone[indexer], defaultValue);
        continue;
      }
      // is array but indexer is not number ...
    }

    (clone as Record<string | number, unknown>)[indexer] = defaultValue;
  }

  return clone as T;
}

export function deepCheckAny(
  target: TObject,
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
