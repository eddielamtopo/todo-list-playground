import {
  AbstractFieldDirective,
  createFieldDirective,
  TFieldELement,
  TFieldOptions,
} from './abstract-field-directive';
import {deepUpdate} from './deep/index';

export class FieldDirective extends AbstractFieldDirective {
  fieldElement!: TFieldELement;
  model!: {[key: string]: unknown};
  options!: TFieldOptions;
  path!: string;

  private _updateModelData(value: unknown) {
    const newModel = deepUpdate(this.model, this.path, value);
    Object.assign(this.model, newModel);
  }

  handleCustomEvent(newData: {[key: string]: unknown}) {
    this._updateModelData(newData);
  }

  handleChangeEvent(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    this._updateModelData(inputValue);
  }
}

export const field = createFieldDirective(FieldDirective);
