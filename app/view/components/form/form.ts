import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// custom directive
import {MyFormController} from './MyFormModel';

const FormContainerName = 'form-container';
@customElement(FormContainerName)
export class FormContainer extends LitElement {
  formModel: MyFormController<{
    left: string;
    right: number;
    obj: {abc: string}; // FIXME: nested object won't get intellisence
  }> = new MyFormController(this);

  _handleSubmit(e: Event) {
    e.preventDefault();
    const formData = this.formModel.getFormData();
    console.log(formData);
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
          <input
            type="text"
            name="left"
            ${this.formModel.registerField('left')}
          />
        </label>

        <label for="right">
          Right:
          <input
            type="text"
            name="right"
            ${this.formModel.registerField('right')}
          />
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
