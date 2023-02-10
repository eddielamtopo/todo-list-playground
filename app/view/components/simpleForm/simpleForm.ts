import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// field directive
import {field} from '../../helpers/field-directive';

const SimpleFormName = 'simple-form';
@customElement(SimpleFormName)
export class SimpleForm extends LitElement {
  formModel = {
    left: '',
    right: '',
    nested: {
      a: '',
      b: [''],
    },
  };

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
    console.log(this.formModel);
  }

  override render() {
    this.renderCount += 1;

    return html`
      <p>Render count: ${this.renderCount}</p>
      <form @submit=${this._handleSubmit}>
        <h1>My Simple Form:</h1>

        <div class="input-container">
          <label for="left"> Left: <sub>*</sub></label>
          <input ${field(this.formModel, 'left')} />
        </div>

        <div class="input-container">
          <label for="right"> Right: <sub>*</sub></label>
          <input ${field(this.formModel, 'right')} />
        </div>

        <div class="input-container">
          <label for="left"> Data nested.a: <sub>*</sub></label>
          <input ${field(this.formModel, 'nested.a')} />
        </div>

        <div class="input-container">
          <label for="left"> Data nested.b.0: <sub>*</sub></label>
          <input ${field(this.formModel, 'nested.b.0')} />
        </div>

        <input type="submit" />
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [SimpleFormName]: SimpleForm;
  }
}
