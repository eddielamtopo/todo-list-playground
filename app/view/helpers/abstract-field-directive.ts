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
  IFormBindingElement,
  FormFieldBindingMethodName,
} from './interface/form-binding-element';
import {FieldValues, FieldPath} from './types';

export type FieldOptions = Partial<{
  isValidFn: (value: unknown) => boolean | string;
}>;

type SupportedStandardFormFieldElements =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

type CustomFormFieldElement = IFormBindingElement<unknown>;

type SupportedCustomFormFieldElement = CustomFormFieldElement;

type SupportedFormFieldElements =
  | SupportedStandardFormFieldElements
  | SupportedCustomFormFieldElement;

export const supportedStandardFormFieldElementsNodeNames = [
  'INPUT',
  'TEXTAREA',
  'SELECT',
] as const;

export type FieldElement = SupportedFormFieldElements;

type FieldModel = FormModel | object;
export type FieldValidator = (value: unknown) => boolean | string;
export abstract class AbstractFieldDirective extends AsyncDirective {
  static errorStylingAttributeNames = {
    invalid: 'invalid',
  };
  protected abstract model: FieldModel;

  private _defaultSet = false;
  private _subscription: Subscription | undefined;
  private _customEventSubscriptions: Subscription[] = [];
  protected validator: FieldValidator = () => true;
  protected fieldElement!: FieldElement;
  protected path!: string;
  protected options: FieldOptions | undefined;

  private get fieldValue() {
    if (this.model instanceof FormModel) {
      return deepGetValue(this.model.getAllData(), this.path);
    }
    return deepGetValue(this.model, this.path);
  }

  get isValid() {
    return this.validator(this.fieldValue);
  }

  override render(
    _model: object | FormModel,
    _path: string,
    _options?: FieldOptions
  ) {
    return nothing;
  }

  /**
   * Implement logic to update the data stored in the generic model
   * */
  protected abstract updateModelData(value: unknown): void;

  private ensureChangeEventSubscribed() {
    if (this._subscription === undefined) {
      this._subscription = fromEvent(this.fieldElement, 'change').subscribe(
        (event) => {
          this.updateModelData(
            (event.target as SupportedStandardFormFieldElements).value
          );
          this.appendErrorStyleAttributes(
            (this.fieldElement as HTMLInputElement).value
          );
        }
      );
    }
  }

  private ensureCustomEventSubscribed() {
    const formBindingEventDetails =
      // '!' assertion is fine here; method name has to exists in order to come in here
      (this.fieldElement as CustomFormFieldElement)[
        FormFieldBindingMethodName
      ]!();
    formBindingEventDetails.forEach(({name, getValue}) => {
      const newSub = fromEvent(this.fieldElement, name).subscribe((e) => {
        const value = getValue(e as CustomEvent);
        this.updateModelData(value);
        this.appendErrorStyleAttributes(value);
      });

      this._customEventSubscriptions.push(newSub);
    });
  }

  /**
   * This method hook up the field directive with a validator function
   * The validator will be the 'isValidFn' function if provided,
   * returning string | false will indicate there's an error.
   * e.g. string can be the error message for the failed validation rules.
   * */
  private configureValidator(options?: FieldOptions) {
    if (options?.isValidFn) {
      this.validator = options.isValidFn;
    }
  }

  private appendErrorStyleAttributes(value: unknown) {
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

  private appendDefaultValueAttribute() {
    // setting default value for standard html elements
    if (!this._defaultSet) {
      // retrive the default value for this field element
      let defaultValue: unknown;
      if (this.model instanceof FormModel) {
        defaultValue = deepGetValue(this.model.getAllData(), this.path);
      } else {
        defaultValue = deepGetValue(this.model, this.path);
      }

      const elementTypeAttr = this.fieldElement.getAttribute('type');
      const isInputElement =
        this.fieldElement.nodeName.toLocaleLowerCase() === 'input';
      const isSelectElement =
        this.fieldElement.nodeName.toLocaleLowerCase() === 'select';

      if (isInputElement && elementTypeAttr && elementTypeAttr === 'checkbox') {
        const checkboxValue = this.fieldElement.getAttribute('value');
        if (checkboxValue === defaultValue) {
          this.fieldElement.setAttribute('checked', 'true');
        }
      } else if (
        (isInputElement || isSelectElement) &&
        'value' in this.fieldElement
      ) {
        if (
          typeof defaultValue === 'string' ||
          typeof defaultValue === 'number'
        ) {
          this.fieldElement.setAttribute('value', String(defaultValue));
        }
      }

      this._defaultSet = true;
    }
  }

  override update(
    part: ElementPart,
    [model, path, options]: Parameters<this['render']>
  ) {
    if (this.isConnected) {
      this.fieldElement = part.element as FieldElement;
      this.model = model;
      this.path = path;
      this.options = options;
      this.configureValidator(options);

      this.appendDefaultValueAttribute();

      if (FormFieldBindingMethodName in this.fieldElement) {
        this.ensureCustomEventSubscribed();
      } else {
        this.ensureChangeEventSubscribed();
      }
    }

    return this.render(this.model, this.path, this.options);
  }

  override disconnected(): void {
    this._subscription?.unsubscribe();
    this._subscription = undefined;
    this._customEventSubscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
    this._customEventSubscriptions = [];
  }

  protected override reconnected(): void {
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
    options?: FieldOptions
  ) => {
    return _fieldDirective(formModel, path, options);
  };
};
