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
    console.log(this.form.data);
  }

  override render() {
    return html`
      <form @submit=${this.handleSubmit}>
        <h1>My Vaadin Form</h1>
        <vaadin-text-field
          label="Zip code"
          .invalid=${this.form.errors.zipCode.length > 0}
          .errorMessage=${this.form.errors.zipCode}
          ${formField(this.form, 'zipCode', {
            isValid: (value) => value.length === 5,
            errorMessage: 'Zip-code should be 5 letters long',
          })}
        >
        </vaadin-text-field>

        <vaadin-text-field
          label="Last name"
          .invalid=${this.form.errors.lastName.length > 0}
          .errorMessage=${this.form.errors.lastName
            ? 'Last name is required'
            : ''}
          ${formField(this.form, 'lastName', {
            isValid: (value) => value.length > 0,
            errorMessage: 'Last name required',
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
