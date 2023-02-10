import {nothing} from 'lit';
import {AsyncDirective, directive} from 'lit/async-directive.js';
import {fromEvent, Subscription} from 'rxjs';
import {FormModel} from './form-model-controller';
import type {ElementPart} from 'lit/directive.js';
import {deepUpdate} from './deepUpdate';

type TFieldOptions = Partial<
  | {
      isValid: (value: string) => boolean;
      errorMessage: string;
      pattern: never;
    }
  | {
      isValid: never;
      errorMessage: string;
      pattern: string;
    }
>;

// Custom field directive to bind form model to input value
export class FormFieldDirective extends AsyncDirective {
  _subscription: Subscription | undefined;
  /* params */
  _inputElement!: HTMLInputElement;
  _model!: FormModel;
  _options: TFieldOptions | undefined;
  _path!: string;

  render(_model: FormModel, _path: string, _options?: TFieldOptions) {
    return nothing;
  }

  ensureInputSubscribed() {
    if (this._subscription === undefined) {
      this._subscription = fromEvent(this._inputElement, 'input').subscribe(
        (event) => {
          const inputValue = (event.target as HTMLInputElement).value;
          // validate validity on change
          const validator = this._options?.isValid
            ? this._options.isValid
            : () => true;
          const valid = validator(inputValue);
          const errorValue = valid
            ? false
            : this._options?.errorMessage ?? !valid;
          const newErrors = deepUpdate(
            this._model.errors,
            this._path,
            errorValue
          );
          this._model.updateErrors(newErrors);
          // update data value
          const newData = deepUpdate(this._model.data, this._path, inputValue);
          this._model.updateData(newData);
        }
      );
    }
  }

  override update(
    part: ElementPart,
    [model, path, options]: Parameters<this['render']>
  ) {
    if (this.isConnected) {
      this._inputElement = part.element as HTMLInputElement;
      this._model = model;
      this._path = path;
      this._options = options;
      this.ensureInputSubscribed();
    }

    return this.render(model, path, options);
  }

  protected override disconnected(): void {
    this._subscription?.unsubscribe();
    this._subscription = undefined;
  }

  protected override reconnected(): void {
    this.ensureInputSubscribed();
  }
}

const _formField = directive(FormFieldDirective);
// wrapper function to provide type guard
export const formField = <T>(
  formModel: FormModel<T>,
  path: keyof T,
  options: TFieldOptions
) => {
  return _formField(formModel, path as string, options);
};
