import {LitElement} from 'lit';

type TFormBindingEvent = {
  name: string;
  getValue: (e: Event) => CustomEvent<unknown>;
};
export type TFormBindingEvents = TFormBindingEvent[];

export const FormBindingEventsPropertyName = 'formBindingEvents';
/**
 * Decorate a method that instructs how to query the event payload.
 *
 * **IMPORTANT:**
 * - Return value of this decorated method will be used to update the same field in a form model.
 * - `this` in the decorated method is not bounded to the lit element; so `this.someProperty` will not work;
 *   - (A work around is to pass the data needed in the event's payload.)
 *
 * @example
 * ```
 * class MyCheckList extends LitComponent {
 *    // both of these decorator methods' return value
 *    // will be applied to the same form field
 *    *@FormBindingEventPayload('add-item')*
 *    getPayload(event: CustomEvent<TAddItemPayload>) {
 *      return event.detail.items.filter(item => item.id !== event.detail.removeId);
 *    }
 *
 *    *@FormBindingEventPayload('remove-item')*
 *    getPayload(event: CustomEvent<TRemoveItemPayload>) {
 *      return event.detail.items.concat(event.payload.newItem)
 *    }
 * }
 * ```
 * */

export function FormBindingEventPayload(eventName: string) {
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
    if (!target[FormBindingEventsPropertyName]) {
      Object.defineProperty(target, FormBindingEventsPropertyName, {
        enumerable: true,
        get() {
          return baseValue;
        },
        set(newValue: TFormBindingEvent[]) {
          baseValue = newValue;
        },
      });
    }

    target[FormBindingEventsPropertyName] =
      (function updateFormBindingEvents() {
        const foundExisting = baseValue?.find((e) => e.name === eventName)
          ? true
          : false;

        if (foundExisting) {
          return baseValue;
        }

        return [...baseValue, formBindingEvent];
      })();

    return descriptor;
  };
}
