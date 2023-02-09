import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ReactiveFormController} from './reactiveFormController';

const ReactiveFormName = 'reactive-form';
@customElement(ReactiveFormName)
export class ReactiveForm extends LitElement {
  @property()
  renderCount = 0;

  formController: ReactiveFormController<{
    left: string;
    right: string;
  }> = new ReactiveFormController(this, {
    left: '',
    right: '',
  });

  private _formState = this.formController.formState;
  handleChange<K extends keyof typeof this._formState>(e: Event, name: K) {
    const input = e.target as HTMLInputElement;
    this._formState = {...this._formState, [name]: input.value};
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    console.log(this._formState);
  }

  override render() {
    this.renderCount += 1;

    return html`
      <p>Render count: ${this.renderCount}</p>

      <form @submit=${this.handleSubmit}>
        <h1>My Reactive form:</h1>
        <div>
          <label>Left:</label>
          <input
            .value=${this._formState.left}
            @change=${(e: Event) => this.handleChange(e, 'left')}
          />
        </div>

        <div>
          <label>Right:</label>
          <input
            .value=${this._formState.right}
            @change=${(e: Event) => this.handleChange(e, 'right')}
          />
        </div>

        <input type="submit" />
      </form>
    `;
  }
}
