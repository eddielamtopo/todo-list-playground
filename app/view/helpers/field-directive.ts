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

  handleInputEvent(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    const newObject = deepUpdate(this._model, this._path, inputValue);
    Object.keys(this._model).forEach((key) => {
      this._model[key] = newObject[key];
    });
  }
}

export const field = createFieldDirective(FieldDirective);
