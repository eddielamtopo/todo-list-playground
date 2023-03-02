import {html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {LitElement} from 'lit';
// import {field} from '../../helpers/field-directive';
import '@vaadin/text-field';
import '@vaadin/text-field/src/vaadin-text-field';
import {FormModel} from '../../helpers/form-model-controller';
import {formField} from '../../helpers/form-field-directive';

const VaadinFormName = 'vaadin-form';
@customElement(VaadinFormName)
export class VaadinForm extends LitElement {
  @property()
  form = new FormModel<{zipCode: string; lastName: string}>(this, {
    zipCode: '',
    lastName: '',
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

        <vaadin-text-field
          label="Last name"
          .invalid=${this.form.getErrors().lastName === true ||
          typeof this.form.getErrors().lastName === 'string'}
          .errorMessage=${this.form.getErrors().lastName
            ? 'Last name is required'
            : ''}
          ${formField(this.form, 'lastName', {
            isValidFn: (value) =>
              (value as string).length > 0 ? true : 'Last name required',
          })}
        >
        </vaadin-text-field>

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
