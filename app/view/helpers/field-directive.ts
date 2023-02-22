import {Observable, Subject} from 'rxjs';
import {
  AbstractFieldDirective,
  createFieldDirective,
  TFieldELement,
  TFieldOptions,
} from './abstract-field-directive';
import {deepUpdate} from './deep/index';
import {FieldValues} from './types';

type TPayload<T extends FieldValues = FieldValues> = {
  newFormModel: T;
  oldFormModel: T;
};

const fieldValueSubject = new Subject<TPayload>();
const fieldValueSubject$ = fieldValueSubject.asObservable();

export function watchModelChange<TFormModel extends FieldValues>(
  observer: (value: TPayload<TFormModel>) => void
) {
  return (fieldValueSubject$ as Observable<TPayload<TFormModel>>).subscribe(
    observer
  );
}

export class FieldDirective extends AbstractFieldDirective {
  fieldElement!: TFieldELement;
  model!: FieldValues;
  options!: TFieldOptions;
  path!: string;

  private _updateModelData(value: unknown) {
    const oldModel = Array.isArray(this.model)
      ? [...this.model]
      : {...this.model};
    const newModel = deepUpdate(this.model, this.path, value);
    Object.assign(this.model, newModel);
    // emit changed value
    fieldValueSubject.next({
      oldFormModel: oldModel,
      newFormModel: newModel,
    });
    // publishing new value
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
