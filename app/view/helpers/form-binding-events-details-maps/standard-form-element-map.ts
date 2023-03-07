import {
  supportedStandardFormFieldElementsNodeNames,
  SupportedStandardFormFieldElements,
  FieldElementFormBindingEventMap,
} from '../abstract-field-directive';
import {
  GetFormBindingEventValue,
  FormBindingEventName,
  SetFormBindingEventValue,
  GetFormBindingDetails,
} from '../interface/form-binding-element';

const standardFormBindingMap: FieldElementFormBindingEventMap<
  string,
  SupportedStandardFormFieldElements
> = new Map();

supportedStandardFormFieldElementsNodeNames.forEach((nodeName) => {
  standardFormBindingMap.set(nodeName, {
    [GetFormBindingDetails]: () => [
      {
        [FormBindingEventName]: 'change',
        [GetFormBindingEventValue]: (event) =>
          (event.target as SupportedStandardFormFieldElements).value,
      },
    ],
    [SetFormBindingEventValue]: (newValue, element) => {
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
