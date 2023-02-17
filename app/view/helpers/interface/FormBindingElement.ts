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
  [FormFieldBindingMethodName](): TFormBindingEventDetail<
    TFieldValue,
    TEvent
  >[];
}
