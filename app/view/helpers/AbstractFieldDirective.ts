import {ElementPart, nothing} from 'lit';
import {
  AsyncDirective,
  directive,
  DirectiveClass,
} from 'lit/async-directive.js';
import {fromEvent, Subscription} from 'rxjs';
import {FormModel} from './form-model-controller';
import {FieldValues, FieldPath} from './types';

export type TFieldOptions = Partial<
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

type TFieldELement = HTMLInputElement | HTMLTextAreaElement;
type TModel = FormModel | object;
export abstract class AbstractFieldDirective extends AsyncDirective {
  abstract _subscription: Subscription | undefined;
  abstract _fieldElement: TFieldELement;
  abstract _model: TModel;
  abstract _path: string;
  abstract _options: TFieldOptions | undefined;

  override render(
    _model: FormModel | object,
    _path: string,
    _options?: TFieldOptions
  ) {
    return nothing;
  }

  /**
   * Override to implement lower-level input event handling detail
   * */
  abstract handleInputEvent(event: Event): void;

  protected ensureInputSubscribed() {
    if (this._subscription === undefined) {
      this._subscription = fromEvent(this._fieldElement, 'input').subscribe(
        (event) => {
          this.handleInputEvent(event);
        }
      );
    }
  }

  override update(
    part: ElementPart,
    [model, path, options]: Parameters<this['render']>
  ) {
    if (this.isConnected) {
      this._fieldElement = part.element as TFieldELement;
      this._model = model;
      this._path = path;
      this._options = options;
      this.ensureInputSubscribed();
    }

    return this.render(model, path, options);
  }

  override disconnected(): void {
    this._subscription?.unsubscribe();
    this._subscription = undefined;
  }

  override reconnected(): void {
    this.ensureInputSubscribed();
  }
}

export const createFieldDirective = (CustomDirectiveClass: DirectiveClass) => {
  const _fieldDirective = directive(CustomDirectiveClass);

  return <
    TFieldValues extends FieldValues = FieldValues,
    TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
  >(
    formModel: FormModel<TFieldValues> | TFieldValues,
    path: TFieldName,
    options?: TFieldOptions
  ) => {
    return _fieldDirective(formModel, path, options);
  };
};
