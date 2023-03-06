import {injectable} from 'inversify';
import {fromEvent, Observable} from 'rxjs';

export interface IFieldDataUpdateEventService {
  dataUpdate$: Observable<Event>;
}

@injectable()
export class FieldDataUpdateEventService
  implements IFieldDataUpdateEventService
{
  // TODO: how do we pass in the config?
  private static FieldElementDataUpdateEventConfig: {
    nodeName: string;
    eventName: string;
  }[] = [];

  private static FieldElementDataUpdateEventMap: Map<string, string> =
    FieldDataUpdateEventService.FieldElementDataUpdateEventConfig.reduce(
      (map, {nodeName, eventName}) => {
        return map.set(nodeName, eventName);
      },
      new Map()
    );
  private static defaultDataUpdateEventName = 'change';

  private element: Element;
  private elementDataUpdateEventName: string;

  constructor(element: Element) {
    this.element = element;
    this.elementDataUpdateEventName =
      FieldDataUpdateEventService.FieldElementDataUpdateEventMap.get(
        element.nodeName
      ) ?? FieldDataUpdateEventService.defaultDataUpdateEventName;
  }

  get dataUpdate$() {
    return fromEvent(this.element, this.elementDataUpdateEventName);
  }
}
