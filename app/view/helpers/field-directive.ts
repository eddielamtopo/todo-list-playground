import {ElementPart, nothing} from 'lit';
import {directive} from 'lit/async-directive.js';
import {fromEvent} from 'rxjs';
import {deepUpdate} from './deepUpdate';
import {FormFieldDirective} from './form-field-directive';

export class FieldDirective extends FormFieldDirective {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _object!: any;

  override render(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _object: object,
    _path: string
  ) {
    return nothing;
  }

  override ensureInputSubscribed(): void {
    if (this._subscription === undefined) {
      this._subscription = fromEvent(this._inputElement, 'input').subscribe(
        (event) => {
          const inputValue = (event.target as HTMLInputElement).value;
          const newObject = deepUpdate(this._object, this._path, inputValue);
          Object.keys(this._object).forEach((key) => {
            this._object[key] = newObject[key];
          });
        }
      );
    }
  }

  override update(
    part: ElementPart,
    [object, path]: Parameters<this['render']>
  ) {
    this._inputElement = part.element as HTMLInputElement;
    this._object = object;
    this._path = path;

    if (this.isConnected) {
      this.ensureInputSubscribed();
    }

    return this.render(object, path);
  }
}

const _field = directive(FieldDirective);
// a wrapper function to provide type guard
export const field = <T extends object>(obj: T, path: keyof T) => {
  return _field(obj, path as string);
};
