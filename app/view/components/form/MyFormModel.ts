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
import {
  distinctUntilChanged,
  fromEvent,
  Observable,
  skip,
  Subject,
  Subscription,
} from 'rxjs';

type TFieldOptions = Partial<
  | {
      isValid: (value: string) => boolean;
      errorMessage: string;
      pattern: never;
    }
  | {
      isValid: never;
      errorMessage: string;
      pattern: string;
    }
>;

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
    field: K,
    options?: TFieldOptions
  ): DirectiveResult<typeof FieldDirective>;
}

// Custom field directive to bind form model to input value
export class FieldDirective extends AsyncDirective {
  _subscriptions: Subscription[] = [];

  render(path: string, model: FormModel, options?: TFieldOptions) {
    return nothing;
  }

  override update(
    _part: ElementPart,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: [string, FormModel, TFieldOptions | undefined]
  ) {
    const [path, model, options] = props;

    const newSub = fromEvent(_part.element, 'input').subscribe((event) => {
      const inputValue = (event.target as HTMLInputElement).value;
      // validate validity on change
      const validator = options?.isValid ? options.isValid : () => true;
      const valid = validator(inputValue);
      const errorValue = valid ? false : options?.errorMessage ?? !valid;
      model.updateErrors({...model.errors, [path]: errorValue});
      // update data value
      model.updateData({...model.data, [path]: inputValue});
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
  data: {[Property in keyof T]: unknown} | {[key: string]: unknown};
  errors: {[Property in keyof T]: unknown} | {[key: string]: unknown};

  constructor(
    host: ReactiveControllerHost,
    defaultValue: {[Property in keyof T]: unknown}
  ) {
    this.data = defaultValue;
    this.errors = Object.keys(defaultValue).reduce((defaultErrors, key) => {
      return {...defaultErrors, [key]: false};
    }, this.data);
    this.host = host;
    this.host.addController(this);
  }

  errorsObservable: Observable<{[key: string]: unknown}> | null = null;
  hostConnected(): void {}

  // this is like hilla's field directive but does not modify element attributes
  registerField<K extends keyof T>(
    inputField: K,
    options?: TFieldOptions
  ): DirectiveResult<typeof FieldDirective> {
    return field(inputField as string, this, options);
  }

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
