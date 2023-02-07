import {injectable} from "inversify";
import {Observable} from "rxjs";
import {v4 as uuid} from "uuid";
import {TodoItem} from "../models/todo-item.model";
import {TodoStore} from "../stores/todo.store";

@injectable()
export class TodoService {
    constructor(
        private readonly todoStore: TodoStore
    ) {}
    
    getEntityEvent() : Observable<TodoItem[]> {
        return this.todoStore.todoList$;
    }
    
    addItem(content: string) {
        this.todoStore.addItem({
            id: uuid(),
            content: content,
            timestamp: new Date().getTime()
        })
    }
    
    removeItem(itemId: string) {
        this.todoStore.removeItem(itemId);
    }
}