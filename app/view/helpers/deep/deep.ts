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
  target: T | object,
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

export function deepSetDefault<T extends object>(
  target: T,
  defaultValue: unknown
): T {
  const keys = Object.keys(target);
  const clone = Array.isArray(target) ? [...target] : {...target};
  const isArray = Array.isArray(clone) && typeof target !== 'string';

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const indexer = isArray ? i : key;

    if (Object.keys((clone as TObject)[indexer]).length) {
      // TODO: refactor to make it cleaner
      if (typeof (clone as TObject)[indexer] === 'string') {
        (clone as TObject)[indexer] = defaultValue;
      } else {
        (clone as TObject)[indexer] = deepSetDefault(
          (clone as TObject)[indexer],
          defaultValue
        );
      }
    } else {
      (clone as TObject)[indexer] = defaultValue;
    }
  }

  return clone as T;
}
