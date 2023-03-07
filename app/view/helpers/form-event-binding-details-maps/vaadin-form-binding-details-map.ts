import {TextField} from '@vaadin/text-field';
import {FieldElementFormBindingEventMap} from '../abstract-field-directive';
import {
  GetFormBindingEventValue,
  FormBindingEventName,
  SetFormBindingEventValue,
  GetFormBindingDetails,
} from '../interface/form-binding-element';

const vaadinFormBindingEventMap: FieldElementFormBindingEventMap<
  string,
  TextField
> = new Map();

vaadinFormBindingEventMap.set('VAADIN-TEXT-FIELD', {
  [GetFormBindingDetails]: () => [
    {
      [FormBindingEventName]: 'change',
      [GetFormBindingEventValue]: (event) => (event.target as TextField).value,
    },
  ],
  [SetFormBindingEventValue]: (newValue, element) => (element.value = newValue),
});

export {vaadinFormBindingEventMap};
