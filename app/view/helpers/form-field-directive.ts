import {ElementPart, nothing} from 'lit';
import {AsyncDirective, directive} from 'lit/async-directive.js';
import {fromEvent, Subscription} from 'rxjs';
import {FormModel} from './form-model-controller';

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
  _subscriptions: Subscription[] = [];

  render(_model: FormModel, _path: string, _options?: TFieldOptions) {
    return nothing;
  }

  override update(
    part: ElementPart,
    [model, path, options]: Parameters<this['render']>
  ) {
    const newSub = fromEvent(part.element, 'input').subscribe((event) => {
      const inputValue = (event.target as HTMLInputElement).value;
      // validate validity on change
      const validator = options?.isValid ? options.isValid : () => true;
      const valid = validator(inputValue);
      const errorValue = valid ? false : options?.errorMessage ?? !valid;
      // FIXME: this cannot handle nested objects... write a function to update object with given path e.g. 'path.to.value'
      model.updateErrors({...model.errors, [path]: errorValue});
      // update data value
      model.updateData({...model.data, [path]: inputValue});
    });

    this._subscriptions = [...this._subscriptions, newSub];
    return nothing;
  }

  override disconnected(): void {
    this._subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}

export const formField = directive(FormFieldDirective);
