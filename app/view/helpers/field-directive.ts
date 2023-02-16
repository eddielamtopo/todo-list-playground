import {
  AbstractFieldDirective,
  createFieldDirective,
  TFieldOptions,
} from './AbstractFieldDirective';
import {deepUpdate} from './deep/deep';

export class FieldDirective extends AbstractFieldDirective {
  _fieldElement!: HTMLInputElement | HTMLTextAreaElement;
  _model!: {[key: string]: unknown};
  _options!: TFieldOptions;
  _path!: string;

  private _updateModelData(value: unknown) {
    const newObject = deepUpdate(this._model, this._path, value);
    Object.assign(this._model, newObject);
  }

  handleCustomEvent(newData: {[key: string]: unknown}) {
    this._updateModelData(newData);
  }

  handleInputEvent(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    this._updateModelData(inputValue);
  }
}

export const field = createFieldDirective(FieldDirective);
