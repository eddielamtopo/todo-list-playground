export const FormFieldBindingMethodName = 'getFormFieldBindingEvents';
export const FormFieldBindingEventNamePropertyName = 'name';
export const FormFieldBindingEventGetValueMethodName = 'getValue';

type TFormBindingEventDetail<
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
  [FormFieldBindingMethodName](): TFormBindingEventDetail<
    TFieldValue,
    TEvent
  >[];
}

export interface FormBindingElement extends HTMLElement {
  [FormFieldBindingMethodName]?: (
    ...args: Parameters<
      IFormBindingElement<unknown>[typeof FormFieldBindingMethodName]
    >
  ) => ReturnType<
    IFormBindingElement<unknown>[typeof FormFieldBindingMethodName]
  >;
}
