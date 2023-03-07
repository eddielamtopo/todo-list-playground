import {AbstractFieldDirective} from './view/helpers/abstract-field-directive';
import {
  standardFormBindingMap,
  vaadinFormBindingEventMap,
} from './view/helpers/form-binding-events-details-maps';

console.log('running main.ts...');

AbstractFieldDirective.setFieldElementFormBindingEventMap(
  standardFormBindingMap
);
AbstractFieldDirective.setFieldElementFormBindingEventMap(
  vaadinFormBindingEventMap
);
