import {AsyncDirective} from 'lit/async-directive.js';
import {fromEvent, Subscription} from 'rxjs';
import {
  CustomFormBindingElementTag,
  supportFormBinding,
} from './decorators/support-form-binding';
import {
  IFormBindingElement,
  FormFieldBindingMethodName,
  FormFieldBindingEventSetValueMethodName,
} from './interface/form-binding-element';

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
  'VAADIN-TEXT-FIELD',
] as const;

export type FieldElement = SupportedFormFieldElements;

export const FIELD_DIRECTIVE_PATH_ATTRIBUTE =
  'data-field-directive-path' as const;

export type FieldValidator = (value: unknown) => boolean | string;
export abstract class AbstractFieldDirective extends AsyncDirective {
  static errorStylingAttributeNames = {
    invalid: 'invalid',
  };
  protected abstract get fieldValue(): unknown;

  private _defaultSet = false;
  private _subscription: Subscription | undefined;
  private _customEventSubscriptions: Subscription[] = [];
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

  private appendNameAttribute() {
    const secondLastPathPart =
      this.path.split('.').find((_e, i, arr) => i === arr.length - 1) ?? '';
    const name = secondLastPathPart;
    this.fieldElement.setAttribute('name', name);
  }

  private appendPathAttribute() {
    this.fieldElement.setAttribute(FIELD_DIRECTIVE_PATH_ATTRIBUTE, this.path);
  }

  private appendDefaultValueAttribute() {
    // setting default value for standard html elements
    if (!this._defaultSet) {
      // retrieve the default value for this field element
      const defaultValue = this.fieldValue;
      const isStandardFormElements =
        supportedStandardFormFieldElementsNodeNames.find(
          (nodeName) => nodeName === this.fieldElement?.nodeName
        ) !== undefined;

      if (isStandardFormElements) {
        const isInputElement = this.fieldElement.nodeName === 'INPUT';
        const elementTypeAttr = this.fieldElement.getAttribute('type');
        const isCheckbox =
          isInputElement && elementTypeAttr && elementTypeAttr === 'checkbox';
        const isRadio =
          isInputElement && elementTypeAttr && elementTypeAttr === 'radio';
        const isFile =
          isInputElement && elementTypeAttr && elementTypeAttr === 'file';

        if (isCheckbox || isRadio) {
          const checkValue = this.fieldElement.getAttribute('value');
          if (!checkValue && checkValue !== '') {
            console.error(`Misconfigured default value on field directive with path '${
              this.path
            }'. 
            ${this.fieldElement.nodeName.toLowerCase()} must have the 'value' attribute for proper setting of default value.`);
          }

          if (checkValue === defaultValue) {
            this.fieldElement.setAttribute('checked', '');
          }
          return;
        }

        // You should not set 'value' to input[type="file"] for security reason
        if (isFile) return;

        if (isStandardFormElements && 'value' in this.fieldElement) {
          if (
            typeof defaultValue === 'string' ||
            typeof defaultValue === 'number'
          ) {
            this.fieldElement.value = defaultValue.toString();
          } else {
            console.error(
              `Misconfigured field directive with path '${this.path}'. 
              Default value for input, select, and textarea elements can only be of type string or number.`
            );
          }
          return;
        }

        if (CustomFormBindingElementTag in this.fieldElement) {
          (this.fieldElement as CustomFormFieldElement)[
            FormFieldBindingEventSetValueMethodName
          ](defaultValue);
          return;
        }

        console.error(`Failed to set default value on ${this.fieldElement.nodeName.toLowerCase()}. Element is not a supported form binding element.
        If you are trying to bind to a custom form binding element. Make sure you have decorated it with the 'supportFormBindng' decorator.
        `);
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

    this.configureValidator(options);
    this.appendNameAttribute();
    this.appendDefaultValueAttribute();
    this.appendPathAttribute();

    if (FormFieldBindingMethodName in this.fieldElement) {
      this.ensureCustomEventSubscribed();
    } else if (
      supportedStandardFormFieldElementsNodeNames.find(
        (nodeName) => nodeName === this.fieldElement.nodeName
      )
    ) {
      this.ensureChangeEventSubscribed();
    } else {
      console.error(`Field element '${this.fieldElement.nodeName.toLowerCase()}' is not a supported form binding element.
      Make sure you field element is one of: ${supportedStandardFormFieldElementsNodeNames
        .join(', ')
        .toLowerCase()};
      Or, if the field element is a custom form binding element, make sure you decorate it with '${
        supportFormBinding.name
      }' and implements the form binding element interface.
      `);
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
