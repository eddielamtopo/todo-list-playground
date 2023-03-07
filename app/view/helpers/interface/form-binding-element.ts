export const GetFormBindingDetails = Symbol('getFormFieldBindingEvents');
export const FormBindingEventName = 'name' as const;
export const GetFormBindingEventValue = 'getValue' as const;
export const SetFormBindingEventValue = Symbol('setValue');

export type FormBindingEventDetail<
  TFieldValue,
  TEvent extends Event = Event,
  TEventName extends string = string
> = {
  [FormBindingEventName]: TEventName;
  [GetFormBindingEventValue]: (e: TEvent) => TFieldValue;
};

export type FormFieldBindingEventSetValueFn<
  TFieldValue = unknown,
  TElement extends Element = Element
> = (newValue: TFieldValue, element: TElement) => void;

export interface IFormBindingElement<
  TFieldValue,
  TEvent extends Event | CustomEvent = Event,
  TElement extends Element = Element
> {
  /**
   * Return an array of object, with custom form binding event name and a function that returns its payload to bind to form field
   * @example
   * ```
   * [GetFormBindingDetails]() {
   *   return [
   *     {
   *       [FormBindingEventName]: 'my-custom-event',
   *       [GetFormBindingEventValue]: (event: CustomEvent<TMyCustomEventPayload>) => event.detail.foo
   *     }
   *   ]
   * }
   * ```
   * */
  [GetFormBindingDetails](): FormBindingEventDetail<TFieldValue, TEvent>[];

  /**
   * Set the property that will be used to bind to the form
   * (Used by the form model to update the value in this form binding element)
   * @example
   * ```
   * @property()
   * items: TItems = [];
   *
   * [SetFormBindingEventValue](newValue: TItems) {
   *   this.items = newValue;
   * }
   * ```
   * */
  [SetFormBindingEventValue]: FormFieldBindingEventSetValueFn<
    TFieldValue,
    TElement
  >;
}
