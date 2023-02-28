export const CustomFormBindingElementTag = Symbol(
  'isCustomFormBindingElementTag'
);

export function supportFormBinding() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function <TClassDecorator extends {new (...args: any[]): HTMLElement}>(
    constructor: TClassDecorator
  ) {
    return class extends constructor {
      [CustomFormBindingElementTag] = true;
    };
  };
}
