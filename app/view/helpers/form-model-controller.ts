import {ReactiveController, ReactiveControllerHost} from 'lit';
import {distinctUntilChanged, Observable, skip, Subject} from 'rxjs';

export class FormModel<T = {[key: string]: unknown}>
  implements ReactiveController
{
  private host: ReactiveControllerHost;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: {[key: string]: unknown};
  errors: {[key: string]: unknown};

  constructor(
    host: ReactiveControllerHost,
    defaultValue: {[Property in keyof T]: unknown}
  ) {
    this.data = defaultValue;
    // FIXME: deepUpdate all values to false
    this.errors = Object.keys(defaultValue).reduce((defaultErrors, key) => {
      return {...defaultErrors, [key]: false};
    }, this.data);
    this.host = host;
    this.host.addController(this);
  }

  errorsObservable: Observable<{[key: string]: unknown}> | null = null;
  hostConnected(): void {}

  updateData(data: {[key: string]: unknown}) {
    this.data = data;
  }

  // error handling
  private _errorSubject = new Subject<string>();
  private _errorSubject$ = this._errorSubject.asObservable();
  private _errorSubscription = this._errorSubject$
    .pipe(distinctUntilChanged(), skip(1))
    .subscribe(() => {
      this.host.requestUpdate();
    });
  private _updateErrorSubject(newErrors: string) {
    this._errorSubject.next(newErrors);
  }
  updateErrors(errors: {[key: string]: unknown}) {
    this.errors = errors;
    this._updateErrorSubject(JSON.stringify(errors));
  }

  hostDisconnected() {
    this._errorSubscription.unsubscribe();
  }
}
