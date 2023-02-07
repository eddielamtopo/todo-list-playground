import {ReactiveController, ReactiveControllerHost} from 'lit';
import {DirectiveResult} from 'lit/async-directive';
import {createRef, Ref, ref, RefDirective} from 'lit/directives/ref.js';
import {fromEvent} from 'rxjs';

abstract class AbstractFormController<T> implements ReactiveController {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  // private host: ReactiveControllerHost;
  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }
  hostConnected(): void {}

  abstract registerField<K extends keyof T>(
    field: K
  ): DirectiveResult<typeof RefDirective>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract getFormData(): any;
}

// This model is for "my form" 's use only
export class MyFormController<T> implements AbstractFormController<T> {
  private host: ReactiveControllerHost;
  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this);
  }
  hostConnected(): void {}

  _formRefs: {[Property in keyof T]: Ref<Element>} | {} = {};

  registerField<K extends keyof T>(field: K) {
    const newRef = createRef();
    this._formRefs = {...this._formRefs, [field]: newRef};
    const _ref = ref(newRef);
    return _ref;
  }

  getFormData() {
    return Object.entries<Ref<Element>>(this._formRefs).reduce(
      (prev, [key, ref]) => {
        return {...prev, [key]: (ref.value as HTMLInputElement).value};
      },
      {}
    );
  }
}
