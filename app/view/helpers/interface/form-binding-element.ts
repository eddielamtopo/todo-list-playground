export const FormFieldBindingMethodName = Symbol('getFormFieldBindingEvents');
export const FormFieldBindingEventNamePropertyName = 'name';
export const FormFieldBindingEventGetValueMethodName = 'getValue';
export const FormFieldBindingEventSetValueMethodName = Symbol('setValue');

export type FormBindingEventDetail<
  TFieldValue,
  TEvent extends Event = Event,
  TEventName extends string = string
> = {
  [FormFieldBindingEventNamePropertyName]: TEventName;
  [FormFieldBindingEventGetValueMethodName]: (e: TEvent) => TFieldValue;
};

export interface IFormBindingElement<
  TFieldValue,
  TEvent extends CustomEvent = CustomEvent
> {
  /**
   * Return an array of object, with custom form binding event name and a function that returns its payload to bind to form field
   * @example
   * ```
   * [FormFieldBindingMethodName]() {
   *   return [
   *     {
   *       [FormFieldBindingEventNamePropertyName]: 'my-custom-event',
   *       [FormFieldBindingEventGetValueMethodName]: (event: CustomEvent<TMyCustomEventPayload>) => event.detail.foo
   *     }
   *   ]
   * }
   * ```
   * */
  [FormFieldBindingMethodName](): FormBindingEventDetail<TFieldValue, TEvent>[];

  /**
   * Set the property that will be used to bind to the form
   * (Used by the form model to update the value in this form binding element)
   * @example
   * ```
   * @property()
   * items: TItems = [];
   *
   * [FormFieldBindingEventSetValueMethodName](newValue: TItems) {
   *   this.items = newValue;
   * }
   * ```
   * */
  [FormFieldBindingEventSetValueMethodName]: (newValue: TFieldValue) => void;
}
