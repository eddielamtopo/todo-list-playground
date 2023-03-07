import {AbstractFieldDirective} from './view/helpers/abstract-field-directive';
import {
  standardFormBindingMap,
  vaadinFormBindingEventMap,
} from './view/helpers/form-event-binding-details-maps';

console.log('running main.ts...');

AbstractFieldDirective.setFieldElementFormBindingEventMap(
  standardFormBindingMap
);
AbstractFieldDirective.setFieldElementFormBindingEventMap(
  vaadinFormBindingEventMap
);
