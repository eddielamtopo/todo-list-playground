import {FormModel} from './form-model-controller';
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

    this.model.validations.push({
      path: this.path,
      validator: this.validator,
    });
    return returnValue;
  }

  private _updateModelData(value: unknown) {
    this.model.updateData(this.path, value);
  }

  handleCustomEvent(data: unknown) {
    this._updateModelData(data);
  }

  handleChangeEvent(event: Event): void {
    // update data value
    this._updateModelData((event.target as HTMLInputElement).value);
  }
}

export const formField = createFieldDirective(FormFieldDirective);
