import {css, html, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// form model and form field directive
import {FormModel} from '../../helpers/form-model-controller';
import {formField} from '../../helpers/form-field-directive';

const FormWithValidationName = 'form-with-validation';

@customElement(FormWithValidationName)
export class FormWithValidation extends LitElement {
  formModel: FormModel<{
    left: string;
    right: string;
  }> = new FormModel(this, {left: '', right: '', top: 123});
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
  `;

  @property()
  renderCount = 0;

  _handleSubmit(e: Event) {
    e.preventDefault();
    console.log(this.formModel.data);
  }

  override render() {
    this.renderCount += 1;

    return html`
      <p>Render count: ${this.renderCount}</p>
      <form @submit=${this._handleSubmit}>
        <h1>My Form With Validation:</h1>

        <div class="input-container">
          <label for="left"> Left: <sub>*</sub></label>
          <input
            ${formField(this.formModel, 'left', {
              isValid: (value) => value.length > 0,
              errorMessage: 'Left is required!',
            })}
          />
          ${this.formModel.errors.left
            ? html`<span class="error-message"
                >${this.formModel.errors.left}</span
              >`
            : nothing}
        </div>

        <div class="input-container">
          <label for="right"> Right: <sub>*</sub></label>
          <input
            ${formField(this.formModel, 'right', {
              isValid: (value) => value.length > 0,
            })}
          />
          ${this.formModel.errors.right
            ? html`<span class="error-message">Right is required</span>`
            : nothing}
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
