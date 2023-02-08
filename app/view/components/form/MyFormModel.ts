import {
  ElementPart,
  nothing,
  ReactiveController,
  ReactiveControllerHost,
} from 'lit';
import {
  AsyncDirective,
  directive,
  DirectiveResult,
} from 'lit/async-directive.js';
import {Ref} from 'lit/directives/ref.js';
import {fromEvent, Subscription} from 'rxjs';

// an abstract class to enforce consistent api
abstract class AbstractFormController<T = unknown>
  implements ReactiveController
{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }
  hostConnected(): void {}

  /**
   * implement return custom field directive
   * */
  abstract registerField<K extends keyof T>(
    field: K
  ): DirectiveResult<typeof FieldDirective>;
}

// Custom field directive to bind form model to input value
export class FieldDirective extends AsyncDirective {
  _subscriptions: Subscription[] = [];

  render(path: string, model: unknown) {
    return nothing;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override update(_part: ElementPart, props: [string, any]) {
    const [path, model] = props;
    const newSub = fromEvent(_part.element, 'input').subscribe((event) => {
      // update model value
      model[path] = (event.target as HTMLInputElement).value;
    });
    this._subscriptions = [...this._subscriptions, newSub];
    return nothing;
  }

  override disconnected(): void {
    this._subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}

const field = directive(FieldDirective);

// A form model that holds the form data
export class FormModel<T = unknown> implements AbstractFormController<T> {
  private host: ReactiveControllerHost;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: {[Property in keyof T]: unknown} | {[key: string]: unknown};
  errors: {[Property in keyof T]: boolean} | {[key: string]: boolean} = {};

  constructor(
    host: ReactiveControllerHost,
    Model: {[Property in keyof T]: unknown}
  ) {
    this.model = Model;
    (this.host = host).addController(this);
  }
  hostConnected(): void {}

  formRefs: {[key: string]: Ref<Element>} = {};
  subscriptions: Subscription[] = [];

  registerField<K extends keyof T>(inputField: K) {
    return field(inputField as string, this.model);
  }
}
