import {Subscription} from 'rxjs';
import {FormModel} from './form-model-controller';
import {deepUpdate} from './deep/deep';
import {
  AbstractFieldDirective,
  createFieldDirective,
  TFieldOptions,
} from './AbstractFieldDirective';

// Custom field directive to bind form model to input value
export class FormFieldDirective extends AbstractFieldDirective {
  _fieldElement!: HTMLInputElement | HTMLTextAreaElement;
  _subscription: Subscription | undefined;
  _model!: FormModel;
  _options!: TFieldOptions;
  _path!: string;

  handleInputEvent(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;

    // validate validity on change
    const validator = this._options?.isValid
      ? this._options.isValid
      : this._options?.pattern
      ? (value: typeof inputValue) => this._options.pattern!.test(value)
      : () => true;
    const valid = validator(inputValue);
    const errorValue = valid ? false : this._options?.errorMessage ?? !valid;
    const newErrors = deepUpdate(this._model.errors, this._path, errorValue);
    this._model.updateErrors(newErrors);

    // update data value
    const newData = deepUpdate(this._model.data, this._path, inputValue);
    this._model.updateData(newData);
  }
}

export const formField = createFieldDirective(FormFieldDirective);
