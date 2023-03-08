import {AbstractFieldDirective} from './view/helpers/form-binding/field-directive-base';
import {
  standardFormBindingMap,
  vaadinFormBindingMap,
} from './view/helpers/form-binding/form-binding-maps';

console.log('running main.ts...');

AbstractFieldDirective.setFieldElementFormBindingEventMap(
  standardFormBindingMap
);
AbstractFieldDirective.setFieldElementFormBindingEventMap(vaadinFormBindingMap);
