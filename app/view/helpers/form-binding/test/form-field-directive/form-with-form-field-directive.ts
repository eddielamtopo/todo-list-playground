import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {formField} from '../../form-field-directive';
import {FormModel} from '../../form-model-controller';

export type TestFormDataType = {
  textField: string;
  numberField: number;
  fileField: string;
  dateField: string;
  checkboxesField: string[];
  radioField: string;
  selectField: string;
};

const FormWithFormFieldDirectiveName = 'form-with-form-field-directive';
@customElement(FormWithFormFieldDirectiveName)
export class FormWithFormFieldDirective extends LitElement {
  // Avoiding issues class fields problematic interaction with reactive properties
  declare form: FormModel<TestFormDataType>;
  declare renderCount: number;
  constructor() {
    super();
    this.form = new FormModel<TestFormDataType>(this, {
      textField: '',
      numberField: 123,
      fileField: '',
      dateField: '',
      checkboxesField: ['checked', 'unchecked', 'unchecked'],
      radioField: 'dewey',
      selectField: '',
    });
    this.renderCount = 1;
  }

  override render() {
    return html`
      <form
        @submit=${(e: Event) => {
          e.preventDefault();
        }}
      >
        <input
          class="text-field"
          type="text"
          ${formField(this.form, 'textField', {
            isValidFn: (value) => {
              return (value as string).length > 0 || 'required';
            },
          })}
        />
        <input
          class="number-field"
          type="number"
          ${formField(this.form, 'numberField')}
        />
        <input
          class="date-field"
          type="date"
          ${formField(this.form, 'dateField')}
        />
        <input
          class="file-field"
          type="file"
          ${formField(this.form, 'fileField')}
        />
        <input
          class="checkboxes-field"
          type="checkbox"
          value="checked"
          ${formField(this.form, 'checkboxesField.0')}
        />
        <input
          class="checkboxes-field"
          type="checkbox"
          value="checked"
          ${formField(this.form, 'checkboxesField.1', {
            isValidFn: (value) => {
              return (value as string) === 'checked' || 'must be checked';
            },
          })}
        />
        <input
          class="checkboxes-field"
          type="checkbox"
          value="checked"
          ${formField(this.form, 'checkboxesField.2')}
        />
        <input
          class="radio-group-field"
          name="radio-group"
          type="radio"
          value="Huey"
          ${formField(this.form, 'radioField')}
        />
        <input
          class="radio-group-field"
          name="radio-group"
          type="radio"
          value="Dewey"
          ${formField(this.form, 'radioField')}
        />
        <input
          class="radio-group-field"
          name="radio-group"
          type="radio"
          value="Louie"
          ${formField(this.form, 'radioField')}
        />
        <select ${formField(this.form, 'selectField')}>
          <option value="option-1">Option 1</option>
          <option value="option-2">Option 2</option>
          <option value="option-3">Option 3</option>
        </select>

        <input type="submit" value="Submit" />
      </form>

      <div id="form-result-container"></div>
    `;
  }
}
