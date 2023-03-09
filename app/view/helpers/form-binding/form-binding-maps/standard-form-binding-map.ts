import {
  supportedStandardFormFieldElementsNodeNames,
  SupportedStandardFormFieldElements,
  FieldElementFormBindingEventMap,
} from '../field-directive-base';
import {
  GetFormBindingEventValue,
  FormBindingEventName,
  SetFormBindingEventValue,
  GetFormBindingDetails,
} from '../../interface/form-binding-element';

const standardFormBindingMap: FieldElementFormBindingEventMap<SupportedStandardFormFieldElements> =
  new Map();

supportedStandardFormFieldElementsNodeNames.forEach((nodeName) => {
  standardFormBindingMap.set(nodeName, {
    [GetFormBindingDetails]: () => [
      {
        [FormBindingEventName]: 'change',
        [GetFormBindingEventValue]: (event) =>
          (event.target as SupportedStandardFormFieldElements).value,
      },
    ],
    [SetFormBindingEventValue]: function (newValue) {
      const elementType = this.getAttribute('type');
      // skip setting input[type="file"] for security reason
      if (elementType === 'file') return;
      // setting the default checked checkable input elements
      if (elementType === 'checkbox' || elementType === 'radio') {
        const checkValue = this.getAttribute('value');
        if (!checkValue && checkValue !== '') {
          console.warn(
            `${this.nodeName} element must specify a value attribute.`
          );
          return;
        }
        if (newValue === checkValue) {
          this.setAttribute('checked', '');
        }
        return;
      }

      this.value = newValue as string;
    },
  });
});

export {standardFormBindingMap};
