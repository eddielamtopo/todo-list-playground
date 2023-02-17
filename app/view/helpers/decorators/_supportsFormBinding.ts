import {LitElement} from 'lit';

export const customEventNames = '_formBindingEventNames';
export const customEventHandlerName = '_formBindingEventsHandler';

export type FormBindingEvent<
  TName extends string = string,
  TPayload extends object = object
> = CustomEvent<TPayload> & {type: TName};

type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
  infer ElementType
>
  ? ElementType
  : never;

export function supportsFormBinding<
  TEventsPayloadMap extends FormBindingEvent[],
  TEventNames extends readonly string[] = string[]
>({
  eventNames,
  getFieldValue,
}: {
  eventNames: TEventNames;
  getFieldValue: (event: ElementType<TEventsPayloadMap>) => unknown;
}) {
  return function <
    TClsDecorator extends {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (...args: any[]): LitElement;
    }
  >(constructor: TClsDecorator): TClsDecorator {
    return class extends constructor {
      [customEventNames] = eventNames;
      [customEventHandlerName] = getFieldValue;
    };
  };
}
