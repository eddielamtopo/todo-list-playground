import {
  AbstractFieldDirective,
  createFieldDirective,
} from './abstract-field-directive';
import {deepUpdate} from './deep/index';
import {FieldValues} from './types';

export class FieldDirective extends AbstractFieldDirective {
  protected model!: FieldValues;

  protected updateModelData(value: unknown) {
    const newModel = deepUpdate(this.model, this.path, value);
    Object.assign(this.model, newModel);
  }
}

export const field = createFieldDirective(FieldDirective);
