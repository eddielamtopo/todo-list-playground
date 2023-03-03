import {ReactiveController, ReactiveControllerHost} from 'lit';
import {distinctUntilChanged, Subject} from 'rxjs';
import {FieldValidator} from './abstract-field-directive';
import {Indexable, TypeAtPath} from './deep/deep';
import {deepGetValue, deepSetAll, deepUpdate} from './deep/index';
import {FieldPath} from './types';

type FieldChangeSubject<T extends Indexable> = {
  oldFormModelData: T;
  newFormModelData: T;
  isDataValid: boolean;
  changedPath: FieldPath<T>;
};

type ErrorsState<T> = {[key in keyof T]: boolean | string};

export class FormModel<T extends Indexable = Indexable>
  implements ReactiveController
{
  private data: T;
  private errors: ErrorsState<T>;

  constructor(private host: ReactiveControllerHost, defaultValue: T) {
    this.data = defaultValue;
    this.errors = deepSetAll(defaultValue, false);
    this.host.addController(this);
  }

  getErrors() {
    return this.errors;
  }

  private validations = new Map<FieldPath<T>, FieldValidator>();
  setValidations(path: FieldPath<T>, validator: FieldValidator) {
    this.validations.set(path, validator);
  }

  getAllData() {
    return this.data;
  }

  getData<TFieldName extends FieldPath<T> = FieldPath<T>>(
    path: TFieldName
  ): TypeAtPath<T, TFieldName> {
    return deepGetValue(this.data, path);
  }

  /**
   * 'valid' check if every binded field is valid without updating the host
   * */
  get isDataValid() {
    let allValid = true;
    this.validations.forEach((validator, path) => {
      const validationResult = validator(deepGetValue(this.data, path));
      const valid =
        validationResult === true && typeof validationResult !== 'string';
      if (!valid) {
        allValid = false;
        return;
      }
    });

    return allValid;
  }

  private retrieveErrorValue(validator: FieldValidator, data: unknown) {
    const validationResult = validator(data);
    return typeof validationResult === 'string'
      ? validationResult
      : !validationResult;
  }

  /**
   * 'validateAllFields' will trigger validation on all the binded fields
   * and update the host to display error message for invalid fields
   * */
  validateAllFields() {
    this.validations.forEach((validator, path) => {
      const data = deepGetValue(this.data, path);
      const errorValue = this.retrieveErrorValue(validator, data);
      this.errors = deepUpdate(this.errors, path, errorValue) as ErrorsState<T>;
    });
    this.host.requestUpdate();
  }

  hostConnected(): void {}

  updateData(path: FieldPath<T>, value: unknown) {
    const oldFormModelData = JSON.parse(JSON.stringify(this.data));
    const newFormModelData = deepUpdate(this.data, path, value);
    this.data = newFormModelData as T;

    this.emitFormModelDataChange(
      oldFormModelData,
      newFormModelData as T,
      this.isDataValid,
      path
    );
    // trigger validation on the path
    this.triggerValidationOnPath(path, value);
  }

  /* error handling */
  private triggerValidationOnPath(path: FieldPath<T>, value: unknown) {
    const validator = this.validations.get(path);

    if (validator) {
      const errorValue = this.retrieveErrorValue(validator, value);
      this.updateErrors(
        deepUpdate(this.errors, path, errorValue) as ErrorsState<T>
      );
    }
  }

  private fieldChangeSubject = new Subject<FieldChangeSubject<T>>();
  private emitFormModelDataChange(
    oldFormModelData: T,
    newFormModelData: T,
    isDataValid: boolean,
    changedPath: FieldPath<T>
  ) {
    this.fieldChangeSubject.next({
      oldFormModelData,
      newFormModelData,
      isDataValid,
      changedPath,
    });
  }
  /* for the host to subscribe to state change in the controller */
  watch(observer: (value: FieldChangeSubject<T>) => void) {
    return this.fieldChangeSubject.asObservable().subscribe(observer);
  }

  private _errorSubject = new Subject<ErrorsState<T>>();
  private _errorSubscription = this._errorSubject
    .asObservable()
    .pipe(
      distinctUntilChanged(
        (a, b) =>
          JSON.stringify(a).split('').sort().join('') ===
          JSON.stringify(b).split('').sort().join('')
      )
    )
    .subscribe(() => {
      this.host.requestUpdate();
    });
  private _updateErrorSubject(newErrors: ErrorsState<T>) {
    this._errorSubject.next(newErrors);
  }

  private updateErrors(errors: ErrorsState<T>) {
    this.errors = errors;
    this._updateErrorSubject(errors);
  }

  hostDisconnected() {
    this._errorSubscription.unsubscribe();
  }
}
