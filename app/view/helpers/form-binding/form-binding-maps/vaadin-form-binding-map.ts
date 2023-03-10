import {TextField} from '@vaadin/text-field';
import {FieldElementFormBindingEventMap} from '../field-directive-base';
import {
  GetFormBindingEventValue,
  FormBindingEventName,
  SetFormBindingEventValue,
  GetFormBindingDetails,
} from '../../interface/form-binding-element';

const vaadinFormBindingMap: FieldElementFormBindingEventMap<TextField> =
  new Map();

vaadinFormBindingMap.set('VAADIN-TEXT-FIELD', {
  [GetFormBindingDetails]: () => [
    {
      [FormBindingEventName]: 'change',
      [GetFormBindingEventValue]: function (_event) {
        return this.value;
      },
    },
  ],
  [SetFormBindingEventValue]: function (newValue) {
    this.value = newValue as string;
  },
});

export {vaadinFormBindingMap};
