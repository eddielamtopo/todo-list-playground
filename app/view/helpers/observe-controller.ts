import {ReactiveController, ReactiveControllerHost} from 'lit';
import {Observable, Subscription} from 'rxjs';

export default class ObserveController<T> implements ReactiveController {
  protected subscription: Subscription | undefined;

  constructor(
    private host: ReactiveControllerHost,
    private source: Observable<T>,
    public value?: T
  ) {
    this.host.addController(this);
  }

  hostConnected() {
    this.subscription = this.source.subscribe((value) => {
      this.value = value;
      this.host.requestUpdate();
    });
  }

  hostDisconnected() {
    this.subscription?.unsubscribe();
  }
}
