import {inject, injectable} from 'inversify';
import {fromEvent, Observable} from 'rxjs';
import {FIELD_DATA_UPDATE_EVENT_SERVICE_TYPES} from './inversify.types';
import {IFieldUpdateEventBindingDetails} from './field-event-details-injectables';

export interface IFieldDataUpdateEventService {
  getDataUpdate$: (element: Element) => Observable<Event>;
}

@injectable()
export class FieldDataUpdateEventService
  implements IFieldDataUpdateEventService
{
  private static defaultDataUpdateEventName = 'change';
  private fieldElementDataUpdateEventMap: Map<string, string> = new Map();

  constructor(
    @inject(
      FIELD_DATA_UPDATE_EVENT_SERVICE_TYPES.VaadinFieldUpdateEventBindingConfig
    )
    readonly vaadinFieldUpdateEventBindingConfig: IFieldUpdateEventBindingDetails
  ) {
    vaadinFieldUpdateEventBindingConfig.list.forEach(
      ({nodeName, eventName}) => {
        this.fieldElementDataUpdateEventMap.set(nodeName, eventName);
      }
    );
  }

  private element?: Element;
  private elementDataUpdateEventName?: string;

  getDataUpdate$(element: Element) {
    this.element = element;
    this.elementDataUpdateEventName =
      this.fieldElementDataUpdateEventMap.get(element.nodeName) ??
      FieldDataUpdateEventService.defaultDataUpdateEventName;

    return fromEvent(this.element, this.elementDataUpdateEventName);
  }
}
