import {ElementPart, nothing} from 'lit';
import {directive} from 'lit/async-directive.js';
import {fromEvent} from 'rxjs';

import {FormFieldDirective} from './form-field-directive';

class FieldDirective extends FormFieldDirective {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _object!: Record<string, any>;

  override render(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _object: Record<string, any>,
    _path: string
  ) {
    return nothing;
  }

  override ensureInputSubscribed(): void {
    if (this._subscription === undefined) {
      this._subscription = fromEvent(this._inputElement, 'input').subscribe(
        (event) => {
          const inputValue = (event.target as HTMLInputElement).value;
          this._object[this._path] = inputValue; // FIXME: use setValue??
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

export const field = directive(FieldDirective);
