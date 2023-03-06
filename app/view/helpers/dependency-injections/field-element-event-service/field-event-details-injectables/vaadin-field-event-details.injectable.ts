import {injectable} from 'inversify';
import {IFieldUpdateEventBindingDetails} from './field-event-details-injectables.interface';

@injectable()
export class VaadinFieldUpdateEventBindingConfig
  implements IFieldUpdateEventBindingDetails
{
  public list = [{nodeName: 'VAADIN-TEXT-FIELD', eventName: 'change'}];
}
