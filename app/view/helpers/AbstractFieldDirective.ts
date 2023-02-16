import {ElementPart, nothing} from 'lit';
import {
  AsyncDirective,
  directive,
  DirectiveClass,
} from 'lit/async-directive.js';
import {fromEvent, Subscription} from 'rxjs';
import {
  formBindingCustomEventsName,
  getFormBindingEventsPayloadFnName,
} from './decorators/withFormBindingEvents';
import {FormModel} from './form-model-controller';
import {FieldValues, FieldPath} from './types';

export type TFieldOptions = Partial<
  | {
      isValid: (value: string) => boolean;
      errorMessage: string;
      pattern: never;
    }
  | {
      isValid: never;
      errorMessage: string;
      pattern: RegExp;
    }
>;

type TFieldELement = HTMLElement & {
  [getFormBindingEventsPayloadFnName]?: (type: string, event: Event) => unknown;
  [formBindingCustomEventsName]?: string[];
};
type TModel = FormModel | object;
export abstract class AbstractFieldDirective extends AsyncDirective {
  _subscription: Subscription | undefined;
  _customEventSubscriptions: Subscription[] = [];

  abstract _fieldElement: TFieldELement;
  abstract _model: TModel;
  abstract _path: string;
  abstract _options: TFieldOptions | undefined;

  override render(
    _model: object | FormModel,
    _path: string,
    _options?: TFieldOptions
  ) {
    return nothing;
  }

  /**
   * Override to implement lower-level input event handling detail
   * */
  abstract handleInputEvent(event: Event): void;
  /**
   * Override to implement lower-level custom event handling detail
   * */
  abstract handleCustomEvent(eventPayload: unknown): void;

  protected ensureInputSubscribed() {
    if (this._subscription === undefined) {
      this._subscription = fromEvent(this._fieldElement, 'input').subscribe(
        (event) => {
          this.handleInputEvent(event);
        }
      );
    }
  }

  protected ensureCustomEventSubscribed() {
    const getValue = this._fieldElement[getFormBindingEventsPayloadFnName]!;
    const customEvents = this._fieldElement[formBindingCustomEventsName]!;

    customEvents.forEach((eventName) => {
      const newSub = fromEvent(this._fieldElement, eventName).subscribe((e) => {
        const value = getValue(eventName, e);
        this.handleCustomEvent(value);
      });

      this._customEventSubscriptions.push(newSub);
    });
  }

  override update(
    part: ElementPart,
    [model, path, options]: Parameters<this['render']>
  ) {
    if (this.isConnected) {
      this._fieldElement = part.element as TFieldELement;
      this._model = model;
      this._path = path;
      this._options = options;

      if (
        formBindingCustomEventsName in this._fieldElement &&
        getFormBindingEventsPayloadFnName in this._fieldElement
      ) {
        this.ensureCustomEventSubscribed();
      } else {
        this.ensureInputSubscribed();
      }
    }

    return this.render(model, path, options);
  }

  override disconnected(): void {
    this._subscription?.unsubscribe();
    this._subscription = undefined;
    this._customEventSubscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
    this._customEventSubscriptions = [];
  }

  override reconnected(): void {
    this.ensureInputSubscribed();
    this.ensureCustomEventSubscribed();
  }
}

export const createFieldDirective = (CustomDirectiveClass: DirectiveClass) => {
  const _fieldDirective = directive(CustomDirectiveClass);

  return <
    TFieldValues extends FieldValues = FieldValues,
    TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
  >(
    formModel: FormModel<TFieldValues> | TFieldValues,
    path: TFieldName,
    options?: TFieldOptions
  ) => {
    return _fieldDirective(formModel, path, options);
  };
};
