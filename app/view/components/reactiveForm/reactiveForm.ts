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
    nested: {mem: string};
  }> = new ReactiveFormController(this, {
    left: '',
    right: '',
    nested: {
      mem: '',
    },
    top: 123, // FIXME: not type safe; how to make generic constructor?
  });

  private _formState = this.formController.formState;

  handleChange<K extends keyof typeof this._formState>(e: Event, name: K) {
    const input = e.target as HTMLInputElement;
    this._formState = {...this._formState, [name]: input.value};
  }

  override render() {
    this.renderCount += 1;

    return html`
      <p>Render count: ${this.renderCount}</p>

      <form>
        <h1>My Reactive form:</h1>
        <input
          .value=${this._formState.left}
          @change=${(e: Event) =>
            this.formController.setformState(
              'left',
              (e.target as HTMLInputElement).value
            )}
        />
        <input
          .value=${this._formState.right}
          @change=${(e: Event) =>
            this.formController.setformState(
              'right',
              (e.target as HTMLInputElement).value
            )}
        />
        <input
          .value=${this._formState.right}
          @change=${(e: Event) =>
            this.formController.setformState(
              'nested',
              (e.target as HTMLInputElement).value
            )}
        />
      </form>
    `;
  }
}
