import {LitElement} from 'lit';

export const formBindingCustomEventsName = 'formBindingCustomEvents';
export const getFormBindingEventsPayloadFnName = 'getFormBindingEventsPayload';

export function withFormBindingEvents<
  EVENT_NAMES_ENUM,
  TPayloadType,
  TReturnType
>({
  formBindingEvents,
  getFormBindingEventsPayload,
}: {
  formBindingEvents: EVENT_NAMES_ENUM[];
  getFormBindingEventsPayload: (
    type: EVENT_NAMES_ENUM,
    event: CustomEvent<TPayloadType>
  ) => TReturnType;
}) {
  return function <
    TClsDecorator extends {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (...args: any[]): LitElement;
    }
  >(constructor: TClsDecorator): TClsDecorator {
    return class extends constructor {
      [formBindingCustomEventsName] = formBindingEvents;
      [getFormBindingEventsPayloadFnName] = getFormBindingEventsPayload;
    };
  };
}
