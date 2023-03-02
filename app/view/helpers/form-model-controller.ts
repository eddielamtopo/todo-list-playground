import {ReactiveController, ReactiveControllerHost} from 'lit';
import {distinctUntilChanged, Subject} from 'rxjs';
import {FieldValidator} from './abstract-field-directive';
import {TypeAtPath} from './deep/deep';
import {deepGetValue, deepSetAll, deepUpdate} from './deep/index';
import {FieldPath, FieldValues} from './types';

type FieldChangeSubject<T extends FieldValues> = {
  oldFormModelData: T;
  newFormModelData: T;
  isDataValid: boolean;
};

export class FormModel<T extends FieldValues = FieldValues>
  implements ReactiveController
{
  private data: T;
  private errors: T;

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

  private formFieldSubjects: Map<
    string,
    Subject<{path: string; newValue: unknown}>
  > = new Map();
  setFormFieldSubjects(
    path: string,
    newValue: Subject<{path: string; newValue: unknown}>
  ) {
    this.formFieldSubjects.set(path, newValue);
  }

  getAllData() {
    return this.data;
  }

  getData<TFieldName extends FieldPath<T> = FieldPath<T>>(
    path: TFieldName
  ): TypeAtPath<T, TFieldName> {
    return deepGetValue(this.data, path);
  }

  setData<TFieldName extends FieldPath<T> = FieldPath<T>>(
    path: TFieldName,
    newValue: unknown
  ) {
    // update the data in the form model
    this.data = deepUpdate(this.data, path, newValue);
    // tell the relevant field that the its data has changed,
    // so it can update the value in its element part
    this.formFieldSubjects.get(path)?.next({path, newValue});
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
      this.errors = deepUpdate<T>(this.errors, path, errorValue);
    });
    this.host.requestUpdate();
  }

  hostConnected(): void {}

  updateData(path: FieldPath<T>, value: unknown) {
    const oldFormModelData = JSON.parse(JSON.stringify(this.data));
    const newFormModelData = deepUpdate(this.data, path, value);
    this.data = newFormModelData;
    this.emitFormModelDataChange(
      oldFormModelData,
      newFormModelData,
      this.isDataValid
    );
    // trigger validation on the path
    this.triggerValidationOnPath(path, value);
  }

  /* error handling */
  private triggerValidationOnPath(path: FieldPath<T>, value: unknown) {
    const validator = this.validations.get(path);

    if (validator) {
      const errorValue = this.retrieveErrorValue(validator, value);
      this.updateErrors(deepUpdate(this.errors, path, errorValue));
    }
  }

  private fieldChangeSubject = new Subject<FieldChangeSubject<T>>();
  private emitFormModelDataChange(
    oldFormModelData: T,
    newFormModelData: T,
    isDataValid: boolean
  ) {
    this.fieldChangeSubject.next({
      oldFormModelData,
      newFormModelData,
      isDataValid,
    });
  }
  /* for the host to subscribe to state change in the controller */
  watch(observer: (value: FieldChangeSubject<T>) => void) {
    return this.fieldChangeSubject.asObservable().subscribe(observer);
  }

  private _errorSubject = new Subject<T>();
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
  private _updateErrorSubject(newErrors: T) {
    this._errorSubject.next(newErrors);
  }

  private updateErrors(errors: T) {
    this.errors = errors;
    this._updateErrorSubject(errors);
  }

  hostDisconnected() {
    this._errorSubscription.unsubscribe();
  }
}
