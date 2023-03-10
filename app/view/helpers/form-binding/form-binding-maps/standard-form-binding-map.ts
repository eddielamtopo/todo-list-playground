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
        [GetFormBindingEventValue]: function (_event) {
          // getting the next value of the checkbox
          // when a checkbox was already checked, it's next value is 'unchecked'
          if (this.type === 'checkbox') {
            if (this.hasAttribute('checked')) {
              return null;
            } else {
              return this.value;
            }
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

        if (newValue === checkValue) {
          // uncheck previously checked checkbox
          if (elementType === 'checkbox' && this.getAttribute('checked')) {
            this.removeAttribute('checked');
            return;
          }
          this.setAttribute('checked', '');
        } else {
          this.removeAttribute('checked');
        }
        return;
      }

      this.value = newValue as string;
    },
  });
});

export {standardFormBindingMap};
