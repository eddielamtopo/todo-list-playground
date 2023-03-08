import {AsyncDirective} from 'lit/async-directive.js';
import {fromEvent, Subscription} from 'rxjs';
import {CustomFormBindingElementTag} from './decorators/support-form-binding';
import {
  IFormBindingElement,
  GetFormBindingDetails,
  SetFormBindingEventValue,
  GetFormBindingEventValue,
  FormBindingEventName,
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
  TElement extends Element = Element
> = Map<string, IFormBindingElement<unknown, Event | CustomEvent, TElement>>;

export abstract class AbstractFieldDirective extends AsyncDirective {
  static readonly errorStylingAttributeNames = {
    invalid: 'invalid',
  };

  private static fieldElementFormBindingEventMap: FieldElementFormBindingEventMap =
    new Map();
  /**
   * Used for adding details of how a specific element node retrieve and update form binding value based on specific events
   * */
  static setFieldElementFormBindingEventMap<
    TMap extends FieldElementFormBindingEventMap<Element>,
    TElement extends Element = TMap extends FieldElementFormBindingEventMap<
      infer TElement
    >
      ? TElement
      : Element
  >(map: FieldElementFormBindingEventMap<TElement>) {
    map.forEach((value, key) => {
      (
        AbstractFieldDirective.fieldElementFormBindingEventMap as FieldElementFormBindingEventMap<TElement>
      ).set(key, value);
    });
  }

  /**
   * Implement the logic to retrieve value from the binding model
   * */
  protected abstract get fieldValue(): unknown;

  private _isDefaultValueSet = false;
  private _subscriptions: Subscription[] = [];
  protected _formBindingEventDetails: FormBindingEventDetail<unknown>[] = [];
  protected _formBindingSetValueFn: FormFieldBindingEventSetValueFn = () => {
    console.error(
      `'${this.fieldElement}' did not specify form binding set value function.`
    );
  };

  protected validator: FieldValidator = () => true;
  protected fieldElement!: FieldElement;
  protected isCustomFormBindingElement = false;
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
          detail[FormBindingEventName]
        ).subscribe((event) => {
          const value = detail[GetFormBindingEventValue](event);
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
    if (!this._isDefaultValueSet) {
      this._formBindingSetValueFn(this.fieldValue, this.fieldElement);
      this._isDefaultValueSet = true;
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
    this.isCustomFormBindingElement =
      CustomFormBindingElementTag in this.fieldElement &&
      GetFormBindingDetails in this.fieldElement &&
      SetFormBindingEventValue in this.fieldElement;

    if (this.isCustomFormBindingElement) {
      this._formBindingEventDetails = (
        this.fieldElement as CustomFormFieldElement
      )[GetFormBindingDetails]();
      this._formBindingSetValueFn = (
        this.fieldElement as CustomFormFieldElement
      )[SetFormBindingEventValue];
    } else {
      const formBindingEventDetailsFound =
        AbstractFieldDirective.fieldElementFormBindingEventMap.get(
          this.fieldElement.nodeName
        );
      if (formBindingEventDetailsFound) {
        this._formBindingEventDetails =
          formBindingEventDetailsFound[GetFormBindingDetails]();
        this._formBindingSetValueFn =
          formBindingEventDetailsFound[SetFormBindingEventValue];
      } else {
        console.error(`Cannot find corresponding form binding event details for '${this.fieldElement.nodeName}'. 
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
