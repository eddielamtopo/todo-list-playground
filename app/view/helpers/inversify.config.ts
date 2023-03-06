import {Container} from 'inversify';
import {FieldDataUpdateEventService} from './field-element-event-service';

const myContainer = new Container();

export const FIELD_DATA_UPDATE_EVENT_SERVICE_TYPES = {
  FieldDataUpdateService: Symbol.for('FieldDataUpdateService'),
} as const;

myContainer
  .bind(FIELD_DATA_UPDATE_EVENT_SERVICE_TYPES.FieldDataUpdateService)
  .to(FieldDataUpdateEventService)
  .inSingletonScope();

export {myContainer};
