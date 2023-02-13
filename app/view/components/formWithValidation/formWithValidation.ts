import {css, html, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// form model and form field directive
import {FormModel} from '../../helpers/form-model-controller';
import {formField} from '../../helpers/form-field-directive';

const FormWithValidationName = 'form-with-validation';

@customElement(FormWithValidationName)
export class FormWithValidation extends LitElement {
  formModel: FormModel<{
    firstName: string;
    lastName: string;
    phoneNumber: {
      personal: '';
      work: [''];
    };
  }> = new FormModel(this, {
    firstName: '',
    lastName: '',
    phoneNumber: {personal: '', work: ['']},
  });
  // FIXME: make this confirm to generic type; might need an 'activator function' instead of new

  static override styles = css`
    .input-container {
      display: flex;
      flex-direction: column;
      margin-bottom: 20px;
      align-items: flex-start;
    }

    label {
      margin-bottom: 10px;
    }

    label sub {
      vertical-align: text-top;
      color: red;
    }

    .error-message {
      color: red;
    }

    .additional-work-phone-container {
      padding-bottom: 20px;
    }

    .additional-work-phone-container > *:not(:last-child) {
      margin-bottom: 20px;
    }
  `;

  @property()
  renderCount = 0;

  _handleSubmit(e: Event) {
    e.preventDefault();
    console.log(this.formModel.data);
  }

  @property()
  additionalWorkNumberCount = 0;

  _handleAddAdditional() {
    this.additionalWorkNumberCount += 1;
    this.formModel.data.phoneNumber.work[this.additionalWorkNumberCount] = '';
  }

  override render() {
    this.renderCount += 1;

    return html`
      <p>Render count: ${this.renderCount}</p>
      <form @submit=${this._handleSubmit}>
        <h1>My Form With Validation:</h1>

        <div class="input-container">
          <label> First name: <sub>*</sub></label>
          <input
            placeholder="This is required!"
            ${formField(this.formModel, 'firstName', {
              isValid: (value) => value.length > 0,
              errorMessage: 'Left is required!',
            })}
          />
          ${this.formModel.errors.firstName
            ? html`<span class="error-message"
                >${this.formModel.errors.firstName}</span
              >`
            : nothing}
        </div>

        <div class="input-container">
          <label> Last name: <sub>*</sub></label>
          <input
            placeholder="This is required!"
            ${formField(this.formModel, 'lastName', {
              isValid: (value) => value.length > 0,
            })}
          />
          ${this.formModel.errors.lastName
            ? html`<span class="error-message">Right is required</span>`
            : nothing}
        </div>

        <div class="input-container">
          <label> Phone number: <sub>*</sub></label>
          <input
            placeholder="Enter 8 digits"
            ${formField(this.formModel, 'phoneNumber.personal', {
              pattern: /^\d{8}$/,
              errorMessage: 'Enter 8 digit',
            })}
          />
          ${this.formModel.errors.phoneNumber.personal
            ? html`<span class="error-message"
                >${this.formModel.errors.phoneNumber.personal}</span
              >`
            : nothing}
        </div>

        <div class="input-container">
          <label> Work phone number: <sub>*</sub></label>
          <input
            placeholder="Match pattern /^d{8}$/"
            ${formField(this.formModel, `phoneNumber.work.0`, {
              pattern: /^\d{8}$/,
              errorMessage: 'Enter 8 digit',
            })}
          />
          ${this.formModel.errors.phoneNumber.work[0]
            ? html`<span class="error-message">
                ${this.formModel.errors.phoneNumber.work[0]}</span
              >`
            : nothing}
        </div>

        <div class="additional-work-phone-container">
          <button @click=${this._handleAddAdditional}>Add another</button>
          ${Array.from(
            Array(this.additionalWorkNumberCount),
            (_, i) => i + 1
          ).map((i) => {
            return html`
              <div class="input-container">
                <label for="nested.b.${i}">
                  Additional work phone (${i}):</label
                >
                <input ${formField(this.formModel, `phoneNumber.work.${i}`)} />
              </div>
            `;
          })}
        </div>

        <input type="submit" />
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [FormWithValidationName]: FormWithValidation;
  }
}
