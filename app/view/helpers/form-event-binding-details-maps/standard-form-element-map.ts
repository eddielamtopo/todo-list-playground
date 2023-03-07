import {
  supportedStandardFormFieldElementsNodeNames,
  SupportedStandardFormFieldElements,
  FieldElementFormBindingEventMap,
} from '../abstract-field-directive';
import {
  FormFieldBindingEventGetValueMethodName,
  FormFieldBindingEventNamePropertyName,
  FormFieldBindingEventSetValueMethodName,
  FormFieldBindingMethodName,
} from '../interface/form-binding-element';

const standardFormBindingMap: FieldElementFormBindingEventMap<
  string,
  SupportedStandardFormFieldElements
> = new Map();

supportedStandardFormFieldElementsNodeNames.forEach((nodeName) => {
  standardFormBindingMap.set(nodeName, {
    [FormFieldBindingMethodName]: () => [
      {
        [FormFieldBindingEventNamePropertyName]: 'change',
        [FormFieldBindingEventGetValueMethodName]: (event) =>
          (event.target as SupportedStandardFormFieldElements).value,
      },
    ],
    [FormFieldBindingEventSetValueMethodName]: (newValue, element) => {
      const elementType = element.getAttribute('type');
      // skip setting input[type="file"] for security reason
      if (elementType === 'file') return;
      // setting the default checked checkable input elements
      if (elementType === 'checkbox' || elementType === 'radio') {
        const checkValue = element.getAttribute('value');
        if (!checkValue && checkValue !== '') {
          console.warn(
            'Checkbox / radio element must specify a value attribute.'
          );
          return;
        }

        element.setAttribute('checked', '');
        return;
      }

      element.value = newValue;
    },
  });
});

export {standardFormBindingMap};
