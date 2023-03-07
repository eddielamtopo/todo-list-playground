import {FieldElementFormBindingEventMap} from '../abstract-field-directive';
import {TextField} from '@vaadin/text-field';

const vaadinFormBindingEventMap: FieldElementFormBindingEventMap = new Map();

vaadinFormBindingEventMap.set('VAADIN-TEXT-FIELD', {
  name: 'change',
  getValue: (event) => (event.target as TextField).value,
  setValue: (newValue, element) =>
    ((element as TextField).value = newValue as unknown as string),
});

export {vaadinFormBindingEventMap};
