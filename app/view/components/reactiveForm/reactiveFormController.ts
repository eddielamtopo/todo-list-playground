import {ReactiveController, ReactiveControllerHost} from 'lit';

export class ReactiveFormController<T> implements ReactiveController {
  private host: ReactiveControllerHost;
  private _formState: T;

  constructor(host: ReactiveControllerHost, formState: T) {
    this.host = host;
    this._formState = formState;
    host.addController(this);
  }

  get formState(): T {
    return this._formState;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setformState<K extends keyof T>(key: K, value: any) {
    this._formState = {...this._formState, [key]: value};
    // this.host.requestUpdate();
  }

  hostConnected(): void {}
}
