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
  form = new FormModel(this, {
    zipCode: '',
    richText: '',
    select: '',
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

        <legend>Rich text:</legend>
        <vaadin-select
          .items=${this.selectItems}
          ${formField(this.form, 'select')}
        ></vaadin-select>

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
