import {ElementPart, nothing} from 'lit';
import {
  AsyncDirective,
  directive,
  DirectiveClass,
} from 'lit/async-directive.js';
import {fromEvent, Subscription} from 'rxjs';
import {deepGetValue} from './deep/index';
import {FormModel} from './form-model-controller';
import {
  FormFieldBindingMethodName,
  IFormBindingElement,
} from './interface/FormBindingElement';
import {FieldValues, FieldPath} from './types';

export type TFieldOptions =
  | Partial<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isValid: (value: unknown) => boolean;
      errorMessage: string;
      pattern: RegExp;
    }>
  | Partial<{
      isValid: never;
      errorMessage: string;
      pattern: RegExp;
    }>;

type TFieldELement = HTMLElement & {
  [FormFieldBindingMethodName]?: (
    ...args: Parameters<
      IFormBindingElement<unknown>[typeof FormFieldBindingMethodName]
    >
  ) => ReturnType<
    IFormBindingElement<unknown>[typeof FormFieldBindingMethodName]
  >;
};
type TModel = FormModel | object;
export abstract class AbstractFieldDirective extends AsyncDirective {
  static errorStylingAttributeNames = {
    invalid: 'invalid',
  };

  private _subscription: Subscription | undefined;
  private _customEventSubscriptions: Subscription[] = [];
  protected validator: (value: unknown) => boolean = () => true;

  abstract fieldElement: TFieldELement;
  abstract model: TModel;
  abstract path: string;
  abstract options: TFieldOptions | undefined;

  get fieldValue() {
    // TODO: will the model be either FormModel or object in the long term?
    // if not this is not good for maintenance
    if (this.model instanceof FormModel) {
      return deepGetValue(this.model.data, this.path);
    }
    return deepGetValue(this.model, this.path);
  }

  override render(
    _model: object | FormModel,
    _path: string,
    _options?: TFieldOptions
  ) {
    return nothing;
  }

  /**
   * Override to implement lower-level input event handling detail
   * */
  abstract handleInputEvent(event: Event): void;
  /**
   * Override to implement lower-level custom event handling detail
   * */
  abstract handleCustomEvent(eventPayload: unknown): void;

  protected ensureInputSubscribed() {
    if (this._subscription === undefined) {
      this._subscription = fromEvent(this.fieldElement, 'input').subscribe(
        (event) => {
          this.handleInputEvent(event);
          this._appendErrorStyleAttributes(
            (this.fieldElement as HTMLInputElement).value
          );
        }
      );
    }
  }

  protected ensureCustomEventSubscribed() {
    const formBindingEventDetails =
      this.fieldElement[FormFieldBindingMethodName]!();
    formBindingEventDetails.forEach(({name, getValue}) => {
      const newSub = fromEvent(this.fieldElement, name).subscribe((e) => {
        const value = getValue(e as CustomEvent);
        this.handleCustomEvent(value);
        this._appendErrorStyleAttributes(value);
      });

      this._customEventSubscriptions.push(newSub);
    });
  }

  /**
   * This method hook up the field directive with a validator function
   * The validator will be the 'isValid' function if provided,
   * if isValid was not provided, 'pattern' will be used to test the string value,
   * if pattern was provided, the validator will validate string value with the pattern regex,
   * (** note if value is not string, then the validator will simply have no effect)
   * */
  private _configureValidator(options?: TFieldOptions) {
    if (options) {
      if (options.pattern) {
        this.validator = (value) => {
          if (typeof value === 'string') {
            return options.pattern!.test(value);
          } else {
            return true;
          }
        };
      }

      if (options.isValid) {
        this.validator = options.isValid;
      }
    }
  }

  private _appendErrorStyleAttributes(value: unknown) {
    const valid = this.validator(value);
    if (!valid) {
      this.fieldElement.toggleAttribute(
        AbstractFieldDirective.errorStylingAttributeNames.invalid
      );
    } else {
      this.fieldElement.removeAttribute(
        AbstractFieldDirective.errorStylingAttributeNames.invalid
      );
    }
  }

  override update(
    part: ElementPart,
    [model, path, options]: Parameters<this['render']>
  ) {
    if (this.isConnected) {
      this.fieldElement = part.element as TFieldELement;
      this.model = model;
      this.path = path;
      this.options = options;
      this._configureValidator(options);

      if (FormFieldBindingMethodName in this.fieldElement) {
        this.ensureCustomEventSubscribed();
      } else {
        this.ensureInputSubscribed();
      }
    }

    return this.render(model, path, options);
  }

  override disconnected(): void {
    this._subscription?.unsubscribe();
    this._subscription = undefined;
    this._customEventSubscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
    this._customEventSubscriptions = [];
  }

  override reconnected(): void {
    this.ensureInputSubscribed();
    this.ensureCustomEventSubscribed();
  }
}

// helper function to create type safe field directive
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
