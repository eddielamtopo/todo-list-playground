import {FieldPath, FieldValues} from '../types';

export type Indexable<T extends FieldValues = FieldValues> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [Property in keyof T]: any;
};

type Split<S extends string> = S extends `${string}.${infer U}`
  ? [...Split<U>]
  : [S];
type Element<A extends string[]> = A[0];
/**
 * @example
 * ```ts
 * const endPath: LastPath<'my.end.path'> = 'path'
 * ```
 * */
type LastPath<TPath extends string> = `${Element<Split<TPath>>}`;

/**
 * @example
 * ```ts
 * const value = { a: { b: { c: 123 } } }
 * const newValue:DeepUpdateReturnType<typeof value, 'a.b.c', string> = value; // error: Type 'number' is not assignable to type 'string'.
 * const updatedValue = newValue.a.b.c // type: 'string'
 * ```
 * */
type DeepUpdateReturnType<T, TPath extends string, TValue> = {
  [Property in keyof T]: T[Property] extends Indexable
    ? DeepUpdateReturnType<T[Property], TPath, TValue>
    : Property extends LastPath<TPath>
    ? TValue
    : T[Property];
};

export function deepUpdate<
  T extends Indexable,
  TValue,
  TFieldName extends string = FieldPath<T>
>(
  target: T,
  path: TFieldName,
  value: TValue
): DeepUpdateReturnType<T, TFieldName, TValue> {
  const [head, ...rest] = path.split('.');
  if (Array.isArray(target)) {
    return [
      ...target.slice(0, Number(head)),
      rest.length
        ? deepUpdate(target[Number(head)], rest.join('.'), value)
        : value,
      ...target.slice(Number(head) + 1),
    ] as unknown as DeepUpdateReturnType<T, TFieldName, TValue>;
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
  } as unknown as DeepUpdateReturnType<T, TFieldName, TValue>;
}

/**
 * Caution: array of mixed types will return unknown.
 * e.g. Indexing { a: { b: [ 1, { c: 2 } ] } } with 'a.b.1.c' will return type 'unknown',
 * becasue b is typed array and not tuple in ts -- i.e. '(number | { c: number })[]'
 * */
export type TypeAtPath<
  TTarget extends Indexable,
  TPath extends string
> = TPath extends `${infer Head}.${infer Tail}`
  ? TypeAtPath<TTarget[Head], `${Tail}`>
  : TPath extends string
  ? TTarget[TPath]
  : unknown;

export function deepGetValue<
  T extends FieldValues,
  TFieldName extends FieldPath<T> = FieldPath<T>
>(target: T, path: TFieldName): TypeAtPath<T, TFieldName> {
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

export function deepSetAll<T extends Indexable, TValue>(
  target: Indexable,
  defaultValue: TValue
): {[key in keyof T]: TValue} {
  const keys = Object.keys(target);
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
