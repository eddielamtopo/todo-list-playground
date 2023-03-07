import {AsyncDirective} from 'lit/async-directive.js';
import {fromEvent, Subscription} from 'rxjs';
import {CustomFormBindingElementTag} from './decorators/support-form-binding';
import {
  IFormBindingElement,
  FormFieldBindingMethodName,
  FormFieldBindingEventSetValueMethodName,
  FormFieldBindingEventGetValueMethodName,
  FormFieldBindingEventNamePropertyName,
  FormBindingEventDetail,
  FormFieldBindingEventSetValueFn,
} from './interface/form-binding-element';

export type FieldOptions = Partial<{
  isValidFn: (value: unknown) => boolean | string;
}>;

export type SupportedStandardFormFieldElements =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

type CustomFormFieldElement = IFormBindingElement<unknown>;

type SupportedCustomFormFieldElement = IFormBindingElement<unknown> & Element;

type SupportedFormFieldElements =
  | SupportedStandardFormFieldElements
  | SupportedCustomFormFieldElement;

export const supportedStandardFormFieldElementsNodeNames = [
  'INPUT',
  'TEXTAREA',
  'SELECT',
] as const;

export type FieldElement = SupportedFormFieldElements;

export type FieldValidator = (value: unknown) => boolean | string;

export type FieldElementFormBindingEventMap<
  TFieldValue = unknown,
  TElement extends Element = Element
> = Map<
  string,
  IFormBindingElement<TFieldValue, Event | CustomEvent, TElement>
>;

export abstract class AbstractFieldDirective extends AsyncDirective {
  static readonly errorStylingAttributeNames = {
    invalid: 'invalid',
  };

  private static fieldElementFormBindingEventMap = new Map();
  static setFieldElementFormBindingEventMap<TElement extends Element>(
    map: FieldElementFormBindingEventMap<string, TElement>
  ) {
    AbstractFieldDirective.fieldElementFormBindingEventMap = new Map([
      ...AbstractFieldDirective.fieldElementFormBindingEventMap,
      ...map,
    ]);
  }

  protected abstract get fieldValue(): unknown;

  private _defaultSet = false;
  private _subscriptions: Subscription[] = [];
  protected _formBindingEventDetails: FormBindingEventDetail<unknown>[] = [];
  protected _formBindingSetValueFn: FormFieldBindingEventSetValueFn = () => {
    console.error(
      `'${this.fieldElement}' did not specify form binding set value function.`
    );
  };

  protected validator: FieldValidator = () => true;
  protected fieldElement!: FieldElement;
  protected path!: string;
  protected options: FieldOptions | undefined;

  get isValid() {
    return this.validator(this.fieldValue);
  }

  /**
   * Implement logic to update the data stored in the generic model
   * */
  protected abstract updateModelData(value: unknown): void;

  private ensureFormBindingEventSubscribed() {
    if (!this._subscriptions.length) {
      this._formBindingEventDetails.map((detail) => {
        return fromEvent(
          this.fieldElement,
          detail[FormFieldBindingEventNamePropertyName]
        ).subscribe((event) => {
          const value = detail[FormFieldBindingEventGetValueMethodName](event);
          this.updateModelData(value);
          this.appendErrorStyleAttributes(value);
        });
      });
    }
  }

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
      // retrieve the default value for this field element
      const defaultValue = this.fieldValue;

      // set value on custom form binding element
      if (CustomFormBindingElementTag in this.fieldElement) {
        (this.fieldElement as CustomFormFieldElement)[
          FormFieldBindingEventSetValueMethodName
        ](defaultValue, this.fieldElement);
        return;
      } else {
        // set default value on mapped elements
        this._formBindingSetValueFn(defaultValue, this.fieldElement);
      }

      this._defaultSet = true;
    }
  }

  protected bind(
    fieldElement: FieldElement,
    path: string,
    options: FieldOptions | undefined
  ) {
    this.fieldElement = fieldElement;
    this.path = path;
    this.options = options;
    const isCustomFormBindingElement =
      CustomFormBindingElementTag in this.fieldElement;

    if (isCustomFormBindingElement) {
      this._formBindingEventDetails = (
        this.fieldElement as CustomFormFieldElement
      )[FormFieldBindingMethodName]();
      this._formBindingSetValueFn = (
        this.fieldElement as CustomFormFieldElement
      )[FormFieldBindingEventSetValueMethodName];
    } else {
      const formBindingEventDetailsFound =
        AbstractFieldDirective.fieldElementFormBindingEventMap.get(
          this.fieldElement.nodeName
        );
      if (formBindingEventDetailsFound) {
        this._formBindingEventDetails =
          formBindingEventDetailsFound[FormFieldBindingMethodName]();
        this._formBindingSetValueFn =
          formBindingEventDetailsFound[FormFieldBindingEventSetValueMethodName];
      } else {
        console.warn(`Cannot find corresponding form binding event details of '${this.fieldElement.nodeName}'. 
        Please provide details to the 'fieldEventBindingMap'.`);
        return;
      }
    }

    this.configureValidator(options);
    this.appendDefaultValueAttribute();

    this.ensureFormBindingEventSubscribed();
  }

  override disconnected(): void {
    this._subscriptions.forEach((sub) => sub.unsubscribe());
    this._subscriptions = [];
  }

  protected override reconnected(): void {
    this.ensureFormBindingEventSubscribed();
  }
}
