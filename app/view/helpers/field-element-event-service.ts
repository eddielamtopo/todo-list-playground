import {injectable} from 'inversify';
import {fromEvent, Observable} from 'rxjs';

export interface ISubscribeChangeEventService {
  dataUpdate$: Observable<Event>;
}

@injectable()
export class FieldElementChangeEventService
  implements ISubscribeChangeEventService
{
  // TODO: how do we pass in the config?
  private static FieldElementDataUpdateEventConfig: {
    nodeName: string;
    eventName: string;
  }[] = [];

  private static FieldElementDataUpdateEventMap: Map<string, string> =
    FieldElementChangeEventService.FieldElementDataUpdateEventConfig.reduce(
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
      FieldElementChangeEventService.FieldElementDataUpdateEventMap.get(
        element.nodeName
      ) ?? FieldElementChangeEventService.defaultDataUpdateEventName;
  }

  get dataUpdate$() {
    return fromEvent(this.element, this.elementDataUpdateEventName);
  }
}
