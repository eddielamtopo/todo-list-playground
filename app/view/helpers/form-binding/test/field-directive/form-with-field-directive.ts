import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {field} from '../../field-directive';

export type TestFormDataType = {
  textField: string;
  numberField: number;
  fileField: string;
  dateField: string;
  checkboxesField: string[];
  radioField: string;
  selectField: string;
};

const FormWithFieldDirectiveName = 'form-with-field-directive';
@customElement(FormWithFieldDirectiveName)
export class FormWithFieldDirective extends LitElement {
  // Avoiding issues class fields problematic interaction with reactive properties
  declare form: TestFormDataType;
  constructor() {
    super();
    this.form = {
      textField: '',
      numberField: 123,
      fileField: '',
      dateField: '',
      checkboxesField: ['unchecked', 'unchecked', 'unchecked'],
      radioField: 'dewey',
      selectField: '',
    };
  }

  override render() {
    return html`
      <form
        @submit=${(e: Event) => {
          e.preventDefault();
          // this.returnResult(this.form);
        }}
      >
        <input
          class="text-field"
          type="text"
          ${field(this.form, 'textField')}
        />
        <input
          class="number-field"
          type="number"
          ${field(this.form, 'numberField')}
        />
        <input
          class="date-field"
          type="date"
          ${field(this.form, 'dateField')}
        />
        <input
          class="file-field"
          type="file"
          ${field(this.form, 'fileField')}
        />
        <input
          class="checkboxes-field"
          type="checkbox"
          value="checked"
          ${field(this.form, 'checkboxesField.0')}
        />
        <input
          class="checkboxes-field"
          type="checkbox"
          value="checked"
          ${field(this.form, 'checkboxesField.1')}
        />
        <input
          class="checkboxes-field"
          type="checkbox"
          value="checked"
          ${field(this.form, 'checkboxesField.2')}
        />
        <input
          class="radio-group-field"
          name="radio-group"
          type="radio"
          value="Huey"
          ${field(this.form, 'radioField')}
        />
        <input
          class="radio-group-field"
          name="radio-group"
          type="radio"
          value="Dewey"
          ${field(this.form, 'radioField')}
        />
        <input
          class="radio-group-field"
          name="radio-group"
          type="radio"
          value="Louie"
          ${field(this.form, 'radioField')}
        />
        <select ${field(this.form, 'selectField')}>
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
