import {
  supportedStandardFormFieldElementsNodeNames,
  SupportedStandardFormFieldElements,
  FieldElementFormBindingEventMap,
} from '../abstract-field-directive';

const standardFormBindingMap: FieldElementFormBindingEventMap = new Map();

supportedStandardFormFieldElementsNodeNames.forEach((nodeName) => {
  standardFormBindingMap.set(nodeName, {
    name: 'change',
    getValue: (event) =>
      (event.target as SupportedStandardFormFieldElements).value,
    setValue: (newValue, element) => {
      const elementType = element.getAttribute('type');
      // skip setting input[type="file"] for security reason
      if (elementType === 'file') return;
      // setting the default checked checkable input elements
      if (elementType === 'checkbox' || elementType === 'radio') {
        const checkValue = element.getAttribute('value');
        if (!checkValue) {
          console.warn(
            'Checkbox / radio element must specify a value attribute.'
          );
          return;
        }

        element.setAttribute('checked', '');
        return;
      }

      (element as SupportedStandardFormFieldElements).value =
        newValue as unknown as string;
    },
  });
});

export {standardFormBindingMap};
