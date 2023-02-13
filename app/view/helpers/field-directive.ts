import {directive} from 'lit/async-directive.js';
import {fromEvent, Subscription} from 'rxjs';
import {AbstractFieldDirective, TFieldOptions} from './AbstractFieldDirective';
import {deepUpdate} from './deep/deep';
import {FieldPath, FieldValues} from './types';

export class FieldDirective extends AbstractFieldDirective {
  _fieldElement!: HTMLInputElement | HTMLTextAreaElement;
  _subscription: Subscription | undefined;
  _model!: {[key: string]: unknown};
  _options!: TFieldOptions;
  _path!: string;

  ensureInputSubscribed() {
    if (this._subscription === undefined) {
      this._subscription = fromEvent(this._fieldElement, 'input').subscribe(
        (event) => {
          const inputValue = (event.target as HTMLInputElement).value;
          const newObject = deepUpdate(this._model, this._path, inputValue);
          Object.keys(this._model).forEach((key) => {
            this._model[key] = newObject[key];
          });
        }
      );
    }
  }
}

const _field = directive(FieldDirective);

// a wrapper function to provide type guard
export const field = <
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  obj: TFieldValues,
  path: TFieldName
) => {
  return _field(obj, path as string);
};
