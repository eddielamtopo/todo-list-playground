import {AbstractFieldDirective} from './view/helpers/abstract-field-directive';
import {
  standardFormBindingMap,
  vaadinFormBindingMap,
} from './view/helpers/form-binding-maps';

console.log('running main.ts...');

AbstractFieldDirective.setFieldElementFormBindingEventMap(
  standardFormBindingMap
);
AbstractFieldDirective.setFieldElementFormBindingEventMap(vaadinFormBindingMap);
