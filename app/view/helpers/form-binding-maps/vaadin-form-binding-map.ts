import {TextField} from '@vaadin/text-field';
import {FieldElementFormBindingEventMap} from '../abstract-field-directive';
import {
  GetFormBindingEventValue,
  FormBindingEventName,
  SetFormBindingEventValue,
  GetFormBindingDetails,
} from '../interface/form-binding-element';

const vaadinFormBindingMap: FieldElementFormBindingEventMap<TextField> =
  new Map();

vaadinFormBindingMap.set('VAADIN-TEXT-FIELD', {
  [GetFormBindingDetails]: () => [
    {
      [FormBindingEventName]: 'change',
      [GetFormBindingEventValue]: (event) => (event.target as TextField).value,
    },
  ],
  [SetFormBindingEventValue]: function (newValue) {
    this.value = newValue as string;
  },
});

export {vaadinFormBindingMap};
