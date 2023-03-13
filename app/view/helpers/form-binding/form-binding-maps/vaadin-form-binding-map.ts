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

import {FieldElementFormBindingEventMap} from '../field-directive-base';
import {
  GetFormBindingEventValue,
  FormBindingEventName,
  SetFormBindingEventValue,
  GetFormBindingDetails,
} from '../../interface/form-binding-element';

const supportedVaadinDataEntryElements = {
  'VAADIN-TEXT-FIELD': TextField,
  'VAADIN-RICH-TEXT-EDITOR': RichTextEditor,
  'VAADIN-CHECKBOX': Checkbox,
  'VAADIN-CHECKBOX-GROUP': CheckboxGroup,
  'VAADIN-SELECT': Select,
  'VAADIN-TEXT-AREA': TextArea,
  'VAADIN-DATE-PICKER': DatePicker,
  'VAADIN-TIME-PICKER': TimePicker,
  'VAADIN-DATE-TIME-PICKER': DateTimePicker,
} as const;

type SupportedVaadinDataEntryElements =
  | TextField
  | RichTextEditor
  | Select
  | Checkbox
  | CheckboxGroup
  | TextArea
  | DatePicker
  | TimePicker
  | DateTimePicker;

const vaadinFormBindingMap: FieldElementFormBindingEventMap<SupportedVaadinDataEntryElements> =
  new Map();

(
  Object.keys(supportedVaadinDataEntryElements) as Array<
    keyof typeof supportedVaadinDataEntryElements
  >
).forEach((nodeName) => {
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

  vaadinFormBindingMap.set(nodeName, {
    [GetFormBindingDetails]: () => [
      {
        [FormBindingEventName]: 'change',
        [GetFormBindingEventValue]: function () {
          return this.value;
        },
      },
    ],
    [SetFormBindingEventValue]: function (newValue) {
      this.value = newValue as string;
    },
  });
});

export {vaadinFormBindingMap};
