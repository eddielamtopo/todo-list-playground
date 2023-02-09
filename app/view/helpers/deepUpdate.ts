/**
 * A pure function that recursively update nested array or object
 *
 * JS Fiddle: https://jsfiddle.net/yztmwn9j/1/
 *
 * Ref: https://www.webtips.dev/webtips/javascript/update-nested-property-by-string
 * */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TObject = Record<string, any>;

export function deepUpdate(
  target: TObject,
  path: string,
  value: unknown
): TObject {
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
