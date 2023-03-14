import {css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {LitElement} from 'lit';
import {FormModel} from '../../helpers/form-binding/form-model-controller';
import {formField} from '../../helpers/form-binding/form-field-directive';
// vaadin components

const VaadinFormName = 'vaadin-form';
@customElement(VaadinFormName)
export class VaadinForm extends LitElement {
  static override styles = css`
    form > legend {
      margin-top: 32px;
    }
  `;

  @property()
  selectItems = [
    {label: 'Most recent first', value: 'recent'},
    {component: 'hr'},
    {label: 'Rating: low to high', value: 'rating-asc'},
    {label: 'Rating: high to low', value: 'rating-desc'},
    {component: 'hr'},
    {label: 'Price: low to high', value: 'price-asc', disabled: true},
    {label: 'Price: high to low', value: 'price-desc', disabled: true},
  ];

  @property()
  comboBoxItems = ['Item 1', 'Item 2'];
  @property()
  multiSelectItems = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
  @property()
  radioItems = ['Item 1', 'Item 2', 'Item 3'];

  @property()
  form = new FormModel(this, {
    zipCode: '',
    email: 'abc@email.com',
    richText: '',
    select: '',
    checkbox: true,
    checkboxGroup: ['Check 2'],
    comboBoxItems: 'Item 1',
    multiComboBox: ['Item 1', 'Item 2'],
    listBoxSelectedValue: [0],
    listBoxSelectedValues: [0, 2],
    radio: 'Item 1',
    password: 'password123',
    textArea: '',
    datePicker: '',
    timePicker: '',
    dateTimePicker: '',
    upload: '',
  });

  handleSubmit(e: Event) {
    e.preventDefault();
    console.log(this.form.getAllData());
  }

  @property()
  _renderCount = 0;

  override render() {
    this._renderCount += 1;
    return html`
      <p>Render count: ${this._renderCount}</p>

      <form @submit=${this.handleSubmit}>
        <h1>My Vaadin Form</h1>

        <vaadin-text-field
          label="Zip code"
          .invalid=${this.form.getErrors().zipCode === true ||
          typeof this.form.getErrors().zipCode === 'string'}
          .errorMessage=${this.form.getErrors().zipCode.toString()}
          ${formField(this.form, 'zipCode', {
            isValidFn: (value) =>
              (value as string).length === 5
                ? true
                : 'Zip-code should be 5 letters long',
          })}
        >
        </vaadin-text-field>

        <!-- <legend>Multi-select-combo-box:</legend> -->
        <!-- <vaadin-multi-select-combo-box></vaadin-multi-select-combo-box> -->

        <legend>Rich text:</legend>
        <vaadin-rich-text-editor
          ${formField(this.form, 'richText')}
        ></vaadin-rich-text-editor>

        <legend>Select:</legend>
        <vaadin-select
          .items=${this.selectItems}
          ${formField(this.form, 'select')}
        ></vaadin-select>

        <!-- TODO: add following vaadin elements -->
        <legend>Combo Box:</legend>
        <vaadin-combo-box
          allow-custom-value
          .items=${this.comboBoxItems}
          ${formField(this.form, 'comboBoxItems')}
        ></vaadin-combo-box>

        <legend>Email Field:</legend>
        <vaadin-email-field
          ${formField(this.form, 'email')}
        ></vaadin-email-field>

        <legend>Number Field:</legend>
        <vaadin-number-field></vaadin-number-field>

        <legend>List Box (Single):</legend>
        <vaadin-list-box ${formField(this.form, 'listBoxSelectedValue')}>
          <vaadin-item>Show assignee</vaadin-item>
          <vaadin-item>Show due date</vaadin-item>
          <vaadin-item>Show status</vaadin-item>
        </vaadin-list-box>

        <legend>List Box (Multiple):</legend>
        <vaadin-list-box
          multiple
          ${formField(this.form, 'listBoxSelectedValues')}
        >
          <vaadin-item>Show assignee</vaadin-item>
          <vaadin-item>Show due date</vaadin-item>
          <vaadin-item>Show status</vaadin-item>
        </vaadin-list-box>

        <legend>Multi-Select:</legend>
        <vaadin-multi-select-combo-box
          .items=${this.multiSelectItems}
          ${formField(this.form, 'multiComboBox')}
        ></vaadin-multi-select-combo-box>

        <legend>Password Field:</legend>
        <vaadin-password-field
          ${formField(this.form, 'password')}
        ></vaadin-password-field>

        <legend>Radio Field:</legend>
        <vaadin-radio-group ${formField(this.form, 'radio')}>
          ${this.radioItems.map((item) => {
            return html`
              <vaadin-radio-button
                value=${item}
                label=${item}
              ></vaadin-radio-button>
            `;
          })}
        </vaadin-radio-group>

        <legend>Checkbox:</legend>
        <vaadin-checkbox
          .label=${'Check me'}
          ${formField(this.form, 'checkbox')}
        ></vaadin-checkbox>

        <legend>Checkbox group:</legend>
        <vaadin-checkbox-group ${formField(this.form, 'checkboxGroup')}>
          <vaadin-checkbox
            value="Check 1"
            .label=${'Check 1'}
          ></vaadin-checkbox>
          <vaadin-checkbox
            value="Check 2"
            .label=${'Check 2'}
          ></vaadin-checkbox>
          <vaadin-checkbox
            value="Check 3"
            .label=${'Check 3'}
          ></vaadin-checkbox>
          <vaadin-checkbox
            value="Check 4"
            .label=${'Check 4'}
          ></vaadin-checkbox>
        </vaadin-checkbox-group>

        <legend>Sample text field:</legend>
        <vaadin-text-area
          ${formField(this.form, 'textArea')}
        ></vaadin-text-area>

        <legend>Datepicker</legend>
        <vaadin-date-picker
          ${formField(this.form, 'datePicker', {
            isValidFn: (newValue) => {
              return (
                new Date(newValue as string).getTime() < new Date().getTime() ||
                'Must be before today'
              );
            },
          })}
        ></vaadin-date-picker>

        <legend>Time picker</legend>
        <vaadin-time-picker
          ${formField(this.form, 'timePicker')}
        ></vaadin-time-picker>

        <legend>Date & Time picker:</legend>
        <vaadin-date-time-picker
          ${formField(this.form, 'dateTimePicker')}
        ></vaadin-date-time-picker>

        <input type="submit" />
      </form>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    [VaadinFormName]: VaadinForm;
  }
}
