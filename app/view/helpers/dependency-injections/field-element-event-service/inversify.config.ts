import {Container} from 'inversify';
import {FieldDataUpdateEventService} from './field-element-event-service';
import {VaadinFieldUpdateEventBindingConfig} from './field-event-details-injectables';
import {FIELD_DATA_UPDATE_EVENT_SERVICE_TYPES} from './inversify.types';

const myContainer = new Container();

myContainer
  .bind(FIELD_DATA_UPDATE_EVENT_SERVICE_TYPES.FieldDataUpdateService)
  .to(FieldDataUpdateEventService)
  .inSingletonScope();

// binding injectables depended by the service above
myContainer
  .bind(
    FIELD_DATA_UPDATE_EVENT_SERVICE_TYPES.VaadinFieldUpdateEventBindingConfig
  )
  .to(VaadinFieldUpdateEventBindingConfig)
  .inSingletonScope();

export {myContainer};
