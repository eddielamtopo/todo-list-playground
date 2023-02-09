import {ReactiveController, ReactiveControllerHost} from 'lit';
import {createRef, ref} from 'lit/directives/ref.js';
import {fromEvent, Observable} from 'rxjs';

export class ReactiveFormController<T> implements ReactiveController {
  private host: ReactiveControllerHost;
  private _formState: T;

  constructor(host: ReactiveControllerHost, formState: T) {
    this.host = host;
    this._formState = formState;
    this.host.addController(this);
  }

  get formState(): T {
    return this._formState;
  }

  hostConnected(): void {}

  observables: {[key: string]: Observable<InputEvent>} = {};

  registerInputObservable<K extends keyof T>(field: K) {
    const eleRef = createRef();
    const inputEle = eleRef.value as HTMLInputElement;
    this.observables = {
      ...this.observables,
      [field]: fromEvent<InputEvent>(inputEle, 'input'),
    };
    return ref(eleRef);
  }
}
