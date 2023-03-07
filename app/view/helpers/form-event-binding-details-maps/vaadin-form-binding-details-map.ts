import {TextField} from '@vaadin/text-field';
import {FieldElementFormBindingEventMap} from '../abstract-field-directive';
import {
  FormFieldBindingEventGetValueMethodName,
  FormFieldBindingEventNamePropertyName,
  FormFieldBindingEventSetValueMethodName,
  FormFieldBindingMethodName,
} from '../interface/form-binding-element';

const vaadinFormBindingEventMap: FieldElementFormBindingEventMap<
  string,
  TextField
> = new Map();

vaadinFormBindingEventMap.set('VAADIN-TEXT-FIELD', {
  [FormFieldBindingMethodName]: () => [
    {
      [FormFieldBindingEventNamePropertyName]: 'change',
      [FormFieldBindingEventGetValueMethodName]: (event) =>
        (event.target as TextField).value,
    },
  ],
  [FormFieldBindingEventSetValueMethodName]: (newValue, element) =>
    (element.value = newValue),
});

export {vaadinFormBindingEventMap};
