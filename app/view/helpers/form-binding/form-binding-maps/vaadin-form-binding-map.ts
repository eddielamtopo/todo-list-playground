import {TextField} from '@vaadin/text-field';
import {Select} from '@vaadin/select';
import {Checkbox, CheckboxCheckedChangedEvent} from '@vaadin/checkbox';
import {
  CheckboxGroup,
  CheckboxGroupValueChangedEvent,
} from '@vaadin/checkbox-group';
import {TextArea} from '@vaadin/text-area';
import {DatePicker} from '@vaadin/date-picker';
import {TimePicker} from '@vaadin/time-picker';
import {DateTimePicker} from '@vaadin/date-time-picker';
import {RichTextEditor} from '@vaadin/rich-text-editor';
import {
  ComboBox,
  ComboBoxChangeEvent,
  ComboBoxCustomValueSetEvent,
  ComboBoxFilterChangedEvent,
  ComboBoxValueChangedEvent,
} from '@vaadin/combo-box';
import '@vaadin/combo-box';
import {EmailField} from '@vaadin/email-field';
import '@vaadin/email-field';
import {
  ListBox,
  ListBoxSelectedValuesChangedEvent,
  ListBoxSelectedChangedEvent,
} from '@vaadin/list-box';
import '@vaadin/list-box';
import '@vaadin/item';

import {
  MultiSelectComboBox,
  MultiSelectComboBoxSelectedItemsChangedEvent,
} from '@vaadin/multi-select-combo-box';
import '@vaadin/multi-select-combo-box';
import {PasswordField} from '@vaadin/password-field';
import '@vaadin/password-field';
import {RadioGroup} from '@vaadin/radio-group';
import '@vaadin/radio-group';

import {FieldElementFormBindingEventMap} from '../field-directive-base';
import {
  GetFormBindingEventValue,
  FormBindingEventName,
  SetFormBindingEventValue,
  GetFormBindingDetails,
} from '../../interface/form-binding-element';

const supportedVaadinDataEntryElementMap = {
  'VAADIN-TEXT-FIELD': TextField,
  'VAADIN-EMAIL-FIELD': EmailField,
  'VAADIN-RICH-TEXT-EDITOR': RichTextEditor,
  'VAADIN-LIST-BOX': ListBox,
  'VAADIN-CHECKBOX': Checkbox,
  'VAADIN-COMBO-BOX': ComboBox,
  'VAADIN-MULTI-SELECT-COMBO-BOX': MultiSelectComboBox,
  'VAADIN-CHECKBOX-GROUP': CheckboxGroup,
  'VAADIN-SELECT': Select,
  'VAADIN-TEXT-AREA': TextArea,
  'VAADIN-DATE-PICKER': DatePicker,
  'VAADIN-TIME-PICKER': TimePicker,
  'VAADIN-DATE-TIME-PICKER': DateTimePicker,
} as const;

type ExtractComponent<K extends string> =
  K extends keyof typeof supportedVaadinDataEntryElementMap
    ? InstanceType<typeof supportedVaadinDataEntryElementMap[K]>
    : unknown;

const vaadinFormBindingMap: FieldElementFormBindingEventMap<
  ExtractComponent<keyof typeof supportedVaadinDataEntryElementMap>
> = new Map();

(
  Object.keys(supportedVaadinDataEntryElementMap) as Array<
    keyof typeof supportedVaadinDataEntryElementMap
  >
).forEach((nodeName) => {
  if (nodeName === 'VAADIN-LIST-BOX') {
    vaadinFormBindingMap.set(nodeName, {
      [GetFormBindingDetails]: () => [
        {
          [FormBindingEventName]: 'selected-values-changed',
          [GetFormBindingEventValue]: function (e) {
            return (e as ListBoxSelectedValuesChangedEvent).detail.value;
          },
        },
        {
          [FormBindingEventName]: 'selected-changed',
          [GetFormBindingEventValue]: function (e) {
            return (e as ListBoxSelectedChangedEvent).detail.value;
          },
        },
      ],
      [SetFormBindingEventValue]: function (newValue) {
        // new value will be number[]
        if (Array.isArray(newValue)) {
          // handling set value of 'selected-values-changed'
          if (this.hasAttribute('multiple')) {
            if (
              Array.isArray(newValue) ||
              newValue === null ||
              newValue === undefined
            ) {
              (this as ListBox).selectedValues = newValue;
            }
          } else {
            // handling set value of 'selected-changed'
            if (typeof newValue[0] === 'number') {
              (this as ListBox).selected = newValue[0];
              this.setAttribute('selected', String(newValue));
            }
          }
        }
      },
    });
    return;
  }

  if (nodeName === 'VAADIN-CHECKBOX') {
    vaadinFormBindingMap.set(nodeName, {
      [GetFormBindingDetails]: () => [
        {
          [FormBindingEventName]: 'checked-changed',
          [GetFormBindingEventValue]: function (e) {
            return (e as CheckboxCheckedChangedEvent).detail.value;
          },
        },
      ],
      [SetFormBindingEventValue]: function (newValue) {
        if (typeof newValue === 'boolean') {
          (this as Checkbox).checked = newValue;
        }
      },
    });
    return;
  }

  if (nodeName === 'VAADIN-CHECKBOX-GROUP') {
    vaadinFormBindingMap.set(nodeName, {
      [GetFormBindingDetails]: () => [
        {
          [FormBindingEventName]: 'value-changed',
          [GetFormBindingEventValue]: function (e) {
            return (e as CheckboxGroupValueChangedEvent).detail.value;
          },
        },
      ],
      [SetFormBindingEventValue]: function (newValue) {
        if (Array.isArray(newValue)) {
          (this as CheckboxGroup).value = newValue;
        }
      },
    });
    return;
  }

  if (nodeName === 'VAADIN-COMBO-BOX') {
    vaadinFormBindingMap.set(nodeName, {
      [GetFormBindingDetails]: () => [
        {
          [FormBindingEventName]: 'value-changed',
          [GetFormBindingEventValue]: function (e) {
            return (e as ComboBoxValueChangedEvent).detail.value;
          },
        },
      ],
      [SetFormBindingEventValue]: function (newValue) {
        if (typeof newValue === 'string') {
          (this as ComboBox).value = newValue;
        }
      },
    });
    return;
  }

  if (nodeName === 'VAADIN-MULTI-SELECT-COMBO-BOX') {
    vaadinFormBindingMap.set(nodeName, {
      [GetFormBindingDetails]: () => [
        {
          [FormBindingEventName]: 'selected-items-changed',
          [GetFormBindingEventValue]: function (e) {
            return (
              e as MultiSelectComboBoxSelectedItemsChangedEvent<unknown[]>
            ).detail.value;
          },
        },
      ],
      [SetFormBindingEventValue]: function (newValue) {
        if (Array.isArray(newValue)) {
          (this as MultiSelectComboBox).selectedItems = newValue;
        }
      },
    });
    return;
  }

  vaadinFormBindingMap.set(nodeName, {
    [GetFormBindingDetails]: () => [
      {
        [FormBindingEventName]: 'change',
        [GetFormBindingEventValue]: function () {
          return (this as unknown as ExtractComponent<typeof nodeName>).value;
        },
      },
    ],
    [SetFormBindingEventValue]: function (newValue) {
      (this as unknown as ExtractComponent<typeof nodeName>).value =
        newValue as string;
    },
  });
});

export {vaadinFormBindingMap};
