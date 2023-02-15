import {ReactiveController, ReactiveControllerHost} from 'lit';
import {distinctUntilChanged, Observable, Subject} from 'rxjs';
import {deepSetDefault} from './deep/deep';
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
