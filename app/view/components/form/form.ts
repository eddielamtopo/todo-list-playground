import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// custom directive
import {FormModel} from './MyFormModel';

const FormContainerName = 'form-container';

@customElement(FormContainerName)
export class FormContainer extends LitElement {
  formModel: FormModel<{
    left: string;
    right: number;
    // FIXME: nested object won't get intellisence
    obj: {abc: string};
    // FIXME: nested object won't get intellisence
  }> = new FormModel(this, {left: '', right: ''});

  _handleSubmit(e: Event) {
    e.preventDefault();
    console.log(this.formModel.model);
  }

  @property()
  renderCount = 0;

  override render() {
    this.renderCount += 1;

    return html`
      <p>Render count: ${this.renderCount}</p>
      <form @submit=${this._handleSubmit}>
        <h1>My form:</h1>

        <label for="left">
          Left:
          <input ${this.formModel.registerField('left')} />
        </label>

        <label for="right">
          Right:
          <!-- this.formModel.registerField('nonExistent') will show type error -->
          <input ${this.formModel.registerField('right')} />
        </label>

        <input type="submit" />
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [FormContainerName]: FormContainer;
  }
}
