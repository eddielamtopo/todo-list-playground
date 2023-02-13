import {directive} from 'lit/async-directive.js';
import {fromEvent, Subscription} from 'rxjs';
import {FormModel} from './form-model-controller';
import {deepUpdate} from './deepUpdate';
import {FieldPath, FieldValues} from './types';
import {AbstractFieldDirective, TFieldOptions} from './AbstractFieldDirective';

// Custom field directive to bind form model to input value
export class FormFieldDirective extends AbstractFieldDirective {
  _fieldElement!: HTMLInputElement | HTMLTextAreaElement;
  _subscription: Subscription | undefined;
  _model!: FormModel;
  _options!: TFieldOptions;
  _path!: string;

  ensureInputSubscribed(): void {
    if (this._subscription === undefined) {
      this._subscription = fromEvent(this._fieldElement, 'input').subscribe(
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
}

const _formField = directive(FormFieldDirective);
// wrapper function to provide type guard
export const formField = <
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  formModel: FormModel<TFieldValues>,
  path: TFieldName,
  options: TFieldOptions
) => {
  return _formField(formModel, path as string, options);
};
