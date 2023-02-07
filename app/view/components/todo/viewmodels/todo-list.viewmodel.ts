import {ReactiveController, ReactiveControllerHost} from 'lit';
import {Subscription} from 'rxjs';
import {container} from '../../../../core/inversify.config';
import {TodoItem} from '../../../../core/module/todo/models/todo-item.model';
import {TodoService} from '../../../../core/module/todo/services/todo-service';

export default class TodoListViewModel implements ReactiveController {
    private readonly _todoService: TodoService = container.get(TodoService);
    private _subscription: Subscription | undefined;
    private _items: TodoItem[] = [];
    
    get items() {
        return this._items;
    };

    constructor(private host: ReactiveControllerHost) {
        this.host.addController(this);
    }
    
    removeItem(itemId: string) {
        this._todoService.removeItem(itemId);
    }
    
    addItem(value: string) {
        this._todoService.addItem(value);
    }

    hostConnected() {
        this._subscription = this._todoService.getEntityEvent().subscribe(value => {
            this._items = value;
            this.host.requestUpdate();
        });
    }

    hostDisconnected() {
        this._subscription?.unsubscribe();
    }
}