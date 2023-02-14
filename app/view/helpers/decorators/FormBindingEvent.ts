import {LitElement} from 'lit';

type TFormBindingEvent = {
  name: string;
  getValue: (e: Event) => CustomEvent<unknown>;
};
export type TFormBindingEvents = TFormBindingEvent[];

export const FormBindingEventsPropertyName = 'formBindingEvents';
export function FormBindingEvent(eventName: string) {
  // parent class, name of function,
  return function (
    target: LitElement & {formBindingEvents?: TFormBindingEvent[]},
    _key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const formBindingEvent = {
      name: eventName,
      getValue: descriptor.value,
    };

    let baseValue: TFormBindingEvent[] = target.formBindingEvents ?? [];
    Object.defineProperty(target, FormBindingEventsPropertyName, {
      enumerable: true,
      get() {
        return baseValue;
      },
      set(newValue: TFormBindingEvent[]) {
        baseValue = newValue;
      },
    });

    target[FormBindingEventsPropertyName] = target.formBindingEvents
      ? [...target.formBindingEvents, formBindingEvent]
      : [formBindingEvent];

    return descriptor;
  };
}
