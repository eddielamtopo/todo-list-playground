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

type CheckBoxElement = HTMLInputElement & {checked: boolean};

supportedStandardFormFieldElementsNodeNames.forEach((nodeName) => {
  standardFormBindingMap.set(nodeName, {
    [GetFormBindingDetails]: () => [
      {
        [FormBindingEventName]: 'change',
        [GetFormBindingEventValue]: function (_event) {
          const elementType = this.getAttribute('type');
          if (elementType === 'checkbox' || elementType === 'radio') {
            return (this as CheckBoxElement).checked ? this.value : false;
          }

          return this.value;
        },
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

        (this as CheckBoxElement).checked = checkValue === newValue;

        return;
      }

      this.value = newValue as string;
    },
  });
});

export {standardFormBindingMap};
