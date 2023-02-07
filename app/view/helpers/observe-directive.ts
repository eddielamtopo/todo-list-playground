import {noChange} from 'lit';
import {AsyncDirective, directive} from 'lit/async-directive.js';
import {Observable, Subscription} from 'rxjs';

class ObserveDirective extends AsyncDirective {
    protected observable: Observable<unknown> | undefined;
    protected subscription: Subscription | undefined;
    // When the observable changes, unsubscribe to the old one and
    // subscribe to the new ones
    render(observable: Observable<unknown>) {
        if (this.observable !== observable) {
            this.subscription?.unsubscribe();
            this.observable = observable;
            if (this.isConnected) {
                this.subscribe(observable);
            }
        }
        return noChange;
    }
    // Subscribes to the observable, calling the directive's asynchronous
    // setValue API each time the value changes
    subscribe(observable?: Observable<unknown>) {
        this.subscription = observable?.subscribe((v: unknown) => {
            this.setValue(v);
        });
    }
    // When the directive is disconnected from the DOM, unsubscribe to ensure
    // the directive instance can be garbage collected
    override disconnected() {
        this.subscription?.unsubscribe();
    }
    // If the subtree the directive is in was disconnected and subsequently
    // re-connected, re-subscribe to make the directive operable again
    override reconnected() {
        this.subscribe(this.observable);
    }
}
export const observe = directive(ObserveDirective);