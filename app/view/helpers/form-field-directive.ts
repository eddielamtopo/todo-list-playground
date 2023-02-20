import {FormModel} from './form-model-controller';
import {deepUpdate} from './deep/index';
import {
  AbstractFieldDirective,
  createFieldDirective,
  TFieldELement,
  TFieldOptions,
} from './abstract-field-directive';
import {ElementPart} from 'lit';

// Custom field directive to bind form model to input value
export class FormFieldDirective extends AbstractFieldDirective {
  fieldElement!: TFieldELement;
  model!: FormModel;
  options!: TFieldOptions;
  path!: string;

  override update(
    part: ElementPart,
    params: Parameters<this['render']>
  ): symbol {
    const returnValue = super.update(part, params);
    // create binding between the model and its fields
    // so we can access binded fields' properties and methods
    if (this.isConnected) {
      this.model._bindedFields.push(new Proxy(this, {}));
    }
    return returnValue;
  }

  private _updateModelData(value: unknown) {
    const newData = deepUpdate(this.model.data, this.path, value);
    this.model.updateData(newData);
  }

  handleCustomEvent(data: unknown) {
    this._updateModelData(data);
    this.validateFieldValue();
  }

  handleInputEvent(event: Event): void {
    // update data value
    this._updateModelData((event.target as HTMLInputElement).value);
    // validate validity on change
    this.validateFieldValue();
  }

  validateFieldValue() {
    const valid = this.validator(this.fieldValue);
    const errorValue = valid ? false : this.options?.errorMessage ?? !valid;
    const newErrors = deepUpdate(this.model.errors, this.path, errorValue);
    this.model.updateErrors(newErrors);
  }
}

export const formField = createFieldDirective(FormFieldDirective);
