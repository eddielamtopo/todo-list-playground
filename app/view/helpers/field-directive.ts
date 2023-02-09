import {ElementPart, nothing} from 'lit';
import {directive} from 'lit/async-directive.js';
import {fromEvent} from 'rxjs';

import {FormFieldDirective} from './form-field-directive';

class FieldDirective extends FormFieldDirective {
  override render(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _object: Record<string, any>,
    _path: string
  ) {
    return nothing;
  }

  override update(
    part: ElementPart,
    [object, path]: Parameters<this['render']>
  ) {
    const newSub = fromEvent(part.element, 'input').subscribe((event) => {
      const inputValue = (event.target as HTMLInputElement).value;
      object[path] = inputValue; // FIXME: hmm
    });
    this._subscriptions = [...this._subscriptions, newSub];
    // _subscriptions will be cleaned up in the superclass disconnected method
    return nothing;
  }
}

export const field = directive(FieldDirective);
