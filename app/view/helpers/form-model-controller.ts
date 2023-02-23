import {ReactiveController, ReactiveControllerHost} from 'lit';
import {distinctUntilChanged, Observable, Subject} from 'rxjs';
import {TFieldDirectiveValidator} from './abstract-field-directive';
import {deepGetValue, deepSetAll, deepUpdate} from './deep/index';
import {FieldValues} from './types';

type TFieldChangeSubject<T extends FieldValues> = {
  oldFormModelData: T;
  newFormModelData: T;
  isDataValid: boolean;
};

export class FormModel<T extends FieldValues = FieldValues>
  implements ReactiveController
{
  host: ReactiveControllerHost;
  data: T;
  errors: T;
  validations: {
    path: string;
    validator: TFieldDirectiveValidator;
  }[] = [];

  constructor(host: ReactiveControllerHost, defaultValue: T) {
    this.data = defaultValue;
    this.errors = deepSetAll(defaultValue, false);
    this.host = host;
    this.host.addController(this);
  }

  /**
   * 'valid' check if every binded field is valid without updating the host
   * */
  get isDataValid() {
    let allValid = true;
    for (let i = 0; i < this.validations.length; i++) {
      const {path, validator} = this.validations[i];
      const validationResult = validator(deepGetValue(this.data, path));
      const valid =
        validationResult === true && typeof validationResult !== 'string';
      if (!valid) {
        allValid = false;
        break;
      }
    }
    return allValid;
  }

  /**
   * 'validateAllFields' will trigger validation on all the binded fields
   * and update the host to display error message for invalid fields
   * */
  validateAllFields() {
    this.validations.forEach((validation) => {
      const data = deepGetValue(this.data, validation.path);

      const errorValue =
        typeof validation.validator(data) === 'string'
          ? validation.validator(data)
          : !validation.validator(data);

      this.errors = deepUpdate(this.errors, validation.path, errorValue);
    });
    this.host.requestUpdate();
  }

  errorsObservable: Observable<{[key: string]: unknown}> | null = null;
  hostConnected(): void {}

  updateData(path: string, value: unknown) {
    const oldFormModelData = {...this.data};
    const newFormModelData = {...deepUpdate(this.data, path, value)};
    this.data = {...oldFormModelData, ...newFormModelData};
    this.emitFormModelDataChange(
      oldFormModelData,
      newFormModelData,
      this.isDataValid
    );
    // trigger validation on the path
    this.triggerValidationOnPath(path, value);
  }

  /* error handling */
  triggerValidationOnPath(path: string, value: unknown) {
    const {path: foundPath, validator} =
      this.validations.find((validation) => validation.path === path) ?? {};

    if (foundPath && validator) {
      const errorValue =
        typeof validator(value) === 'string'
          ? validator(value)
          : !validator(value);

      this.updateErrors(deepUpdate(this.errors, foundPath, errorValue));
    }
  }

  private fieldChangeSubject = new Subject<TFieldChangeSubject<T>>();
  private fieldChangeSubject$ = this.fieldChangeSubject.asObservable();
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
  watch(observer: (value: TFieldChangeSubject<T>) => void) {
    return this.fieldChangeSubject$.subscribe(observer);
  }

  private _errorSubject = new Subject<T>();
  private _errorSubject$ = this._errorSubject.asObservable();
  private _errorSubscription = this._errorSubject$
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

  updateErrors(errors: T) {
    this.errors = errors;
    this._updateErrorSubject(errors);
  }

  hostDisconnected() {
    this._errorSubscription.unsubscribe();
  }
}
