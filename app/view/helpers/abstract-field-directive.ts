import {ElementPart, noChange, nothing} from 'lit';
import {
  AsyncDirective,
  directive,
  DirectiveClass,
} from 'lit/async-directive.js';
import {fromEvent, Subscription} from 'rxjs';
import {deepGetValue} from './deep/index';
import {FormModel} from './form-model-controller';
import {
  FormBindingElement,
  FormFieldBindingMethodName,
} from './interface/form-binding-element';
import {FieldValues, FieldPath} from './types';

export type TFieldOptions =
  | Partial<{
      isValid: (value: unknown) => boolean;
      errorMessage: string;
      pattern: never;
    }>
  | Partial<{
      isValid: never;
      errorMessage: string;
      pattern: RegExp;
    }>;

type TBasicFormFieldElements =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement
  | FormBindingElement;

export type TFieldELement = TBasicFormFieldElements;
type TModel = FormModel | object;
export type TDirectiveValidator = (value: unknown) => boolean | string;
export abstract class AbstractFieldDirective extends AsyncDirective {
  static errorStylingAttributeNames = {
    invalid: 'invalid',
  };

  private _subscription: Subscription | undefined;
  private _customEventSubscriptions: Subscription[] = [];
  protected validator: TDirectiveValidator = () => true;

  abstract fieldElement: TFieldELement;
  abstract model: TModel;
  abstract path: string;
  abstract options: TFieldOptions | undefined;

  get fieldValue() {
    if (this.model instanceof FormModel) {
      return deepGetValue(this.model.data, this.path);
    }
    return deepGetValue(this.model, this.path);
  }

  get isValid() {
    return this.validator(this.fieldValue);
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
  abstract handleChangeEvent(event: Event): void;
  /**
   * Override to implement lower-level custom event handling detail
   * */
  abstract handleCustomEvent(eventPayload: unknown): void;

  protected ensureChangeEventSubscribed() {
    if (this._subscription === undefined) {
      this._subscription = fromEvent(this.fieldElement, 'change').subscribe(
        (event) => {
          this.handleChangeEvent(event);
          this._appendErrorStyleAttributes(
            (this.fieldElement as HTMLInputElement).value
          );
        }
      );
    }
  }

  protected ensureCustomEventSubscribed() {
    const formBindingEventDetails =
      // '!' assertion is fine here; method name has to exists in order to come in here
      (this.fieldElement as FormBindingElement)[FormFieldBindingMethodName]!();
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
            if (options.pattern && !options.pattern.test(value)) {
              return options.errorMessage ?? options.pattern!.test(value);
            }
            return true;
          } else {
            return true;
          }
        };
      }

      if (options.isValid) {
        this.validator = (value: unknown) => {
          const valid = options.isValid ? options.isValid(value) : true;
          if (!valid) {
            return options.errorMessage ?? valid;
          }
          return true;
        };
      }
    }
  }

  private _appendErrorStyleAttributes(value: unknown) {
    const validationResult = this.validator(value);
    const invalid =
      typeof validationResult === 'string' || validationResult === false;
    if (invalid) {
      this.fieldElement.setAttribute(
        AbstractFieldDirective.errorStylingAttributeNames.invalid,
        ''
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

      // setting default value for standard html elements
      if (model instanceof FormModel) {
        const defaultValue = deepGetValue(model.data, path);
        if ('value' in this.fieldElement) {
          this.fieldElement.value = defaultValue as string;
        }
      } else {
        const defaultValue = deepGetValue(model, path);
        if ('value' in this.fieldElement) {
          this.fieldElement.value = defaultValue as string;
        }
      }

      if (FormFieldBindingMethodName in this.fieldElement) {
        this.ensureCustomEventSubscribed();
      } else {
        this.ensureChangeEventSubscribed();
      }
    }

    return noChange;
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
    this.ensureChangeEventSubscribed();
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
