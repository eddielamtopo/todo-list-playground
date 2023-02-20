import {ReactiveController, ReactiveControllerHost} from 'lit';
import {distinctUntilChanged, Observable, Subject} from 'rxjs';
import {TDirectiveValidator} from './abstract-field-directive';
import {deepGetValue, deepSetAll, deepUpdate} from './deep/index';
import {FieldValues} from './types';

export class FormModel<T extends FieldValues = FieldValues>
  implements ReactiveController
{
  host: ReactiveControllerHost;
  data: T;
  errors: T;
  validations: {
    path: string;
    validator: TDirectiveValidator;
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
      const valid = validator(deepGetValue(this.data, path));
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
    this.data = deepUpdate(this.data, path, value);
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

  private _errorSubject = new Subject<T>();
  private _errorSubject$ = this._errorSubject.asObservable();
  private _errorSubscription = this._errorSubject$
    .pipe(distinctUntilChanged())
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
