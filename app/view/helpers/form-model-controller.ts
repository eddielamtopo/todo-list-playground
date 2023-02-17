import {ReactiveController, ReactiveControllerHost} from 'lit';
import {distinctUntilChanged, Observable, Subject} from 'rxjs';
import {deepSetDefault} from './deep/index';
import {FormFieldDirective} from './form-field-directive';
import {FieldValues} from './types';

export class FormModel<T extends FieldValues = FieldValues>
  implements ReactiveController
{
  host: ReactiveControllerHost;
  data: T;
  errors: T;

  constructor(host: ReactiveControllerHost, defaultValue: T) {
    this.data = defaultValue;
    this.errors = deepSetDefault(defaultValue, false);
    this.host = host;
    this.host.addController(this);
  }

  // _bindedFields contain all the fields that is binded to this model
  public _bindedFields: FormFieldDirective[] = [];

  /**
   * 'valid' check if every binded field is valid without updating the host
   * */
  get dataValid() {
    return this._bindedFields.every((field) => field.isValid);
  }

  /**
   * 'validateAllFields' will trigger validation on all the binded fields
   * and update the host to display error message for invalid fields
   * */
  validateAllFields() {
    this._bindedFields.forEach((field) => {
      field.validateFieldValue();
    });
    this.host.requestUpdate();
  }

  errorsObservable: Observable<{[key: string]: unknown}> | null = null;
  hostConnected(): void {}

  updateData(data: T) {
    Object.assign(this.data, data);
  }

  // error handling
  private _errorSubject = new Subject<string>();
  private _errorSubject$ = this._errorSubject.asObservable();
  private _errorSubscription = this._errorSubject$
    .pipe(distinctUntilChanged())
    .subscribe(() => {
      this.host.requestUpdate();
    });
  private _updateErrorSubject(newErrors: string) {
    this._errorSubject.next(newErrors);
  }

  updateErrors(errors: T) {
    this.errors = errors;
    this._updateErrorSubject(JSON.stringify(errors));
  }

  hostDisconnected() {
    this._errorSubscription.unsubscribe();
  }
}
