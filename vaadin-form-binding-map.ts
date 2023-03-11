// import {RichTextEditor} from '@vaadin/rich-text-editor';
import {TextField} from '@vaadin/text-field';
import {Select} from '@vaadin/select';
import {TextArea} from '@vaadin/text-area';
import {DatePicker} from '@vaadin/date-picker';
import {TimePicker} from '@vaadin/time-picker';
import {DateTimePicker} from '@vaadin/date-time-picker';
import { RichTextEditor } from '@vaadin/rich-text-editor'

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
  'VAADIN-SELECT': Select,
  'VAADIN-TEXT-AREA': TextArea,
  'VAADIN-DATE-PICKER': DatePicker,
  'VAADIN-TIME-PICKER': TimePicker,
  'VAADIN-DATE-TIME-PICKER': DateTimePicker,
};

type SupportedVaadinDataEntryElements =
  | TextField
  | RichTextEditor
  | Select
  | TextArea
  | DatePicker
  | TimePicker
  | DateTimePicker;

const vaadinFormBindingMap: FieldElementFormBindingEventMap<SupportedVaadinDataEntryElements> =
  new Map();

Object.keys(supportedVaadinDataEntryElements).forEach((nodeName) => {
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
