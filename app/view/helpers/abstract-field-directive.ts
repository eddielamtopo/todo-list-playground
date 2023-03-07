import {AsyncDirective} from 'lit/async-directive.js';
import {fromEvent, Subscription} from 'rxjs';
import {CustomFormBindingElementTag} from './decorators/support-form-binding';
import {
  IFormBindingElement,
  FormFieldBindingMethodName,
  FormFieldBindingEventSetValueMethodName,
  FormBindingEventDetail,
  FormFieldBindingEventGetValueMethodName,
  FormFieldBindingEventNamePropertyName,
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

export type FieldElementFormBindingEventMapValue =
  FormBindingEventDetail<unknown> & {
    setValue: <TValue>(newValue: TValue, element: Element) => void;
  };

export type FieldElementFormBindingEventMap = Map<
  string,
  FieldElementFormBindingEventMapValue
>;

export abstract class AbstractFieldDirective extends AsyncDirective {
  static readonly errorStylingAttributeNames = {
    invalid: 'invalid',
  };
  private static fieldElementFormBindingEventMap: FieldElementFormBindingEventMap =
    new Map();

  static setFieldElementFormBindingEventMap(
    map: FieldElementFormBindingEventMap
  ) {
    AbstractFieldDirective.fieldElementFormBindingEventMap = new Map([
      ...AbstractFieldDirective.fieldElementFormBindingEventMap,
      ...map,
    ]);
  }

  protected abstract get fieldValue(): unknown;

  private _defaultSet = false;
  private _subscription: Subscription | undefined;
  private _customEventSubscriptions: Subscription[] = [];
  protected _formBindingEventDetail!: FieldElementFormBindingEventMapValue;

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

  private ensureChangeEventSubscribed() {
    if (this._subscription === undefined) {
      this._subscription = fromEvent(
        this.fieldElement,
        this._formBindingEventDetail[FormFieldBindingEventNamePropertyName]
      ).subscribe((event) => {
        const newValue =
          this._formBindingEventDetail[FormFieldBindingEventGetValueMethodName](
            event
          );

        this.updateModelData(newValue);
        this.appendErrorStyleAttributes(newValue);
      });
    }
  }

  private ensureCustomEventSubscribed() {
    if (!this._customEventSubscriptions.length) {
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
        ](defaultValue);
        return;
      } else {
        // set default value on mapped elements
        this._formBindingEventDetail.setValue(defaultValue, this.fieldElement);
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

    const formBindingEventDetailsFound =
      AbstractFieldDirective.fieldElementFormBindingEventMap.get(
        this.fieldElement.nodeName
      );
    if (formBindingEventDetailsFound) {
      this._formBindingEventDetail = formBindingEventDetailsFound;
    } else if (!isCustomFormBindingElement) {
      console.warn(`Cannot find corresponding form binding event details of '${this.fieldElement.nodeName}'. 
      Please provide details to the 'fieldEventBindingMap'.`);
      return;
    }

    this.configureValidator(options);
    this.appendDefaultValueAttribute();

    if (isCustomFormBindingElement) {
      this.ensureCustomEventSubscribed();
    } else {
      this.ensureChangeEventSubscribed();
    }
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
