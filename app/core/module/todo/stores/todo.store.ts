import {injectable} from "inversify";
import {createStore} from "@ngneat/elf";
import {addEntities, deleteEntities, selectAllEntities, withEntities} from '@ngneat/elf-entities';
import {localStorageStrategy, persistState} from '@ngneat/elf-persist-state';
import { shareReplay } from 'rxjs/operators';
import {TodoItem} from "../models/todo-item.model";

const todoStore = createStore(
    { name: 'todo' },
    withEntities<TodoItem>()
);

persistState(todoStore, {
    key: 'todo',
    storage: localStorageStrategy,
});

@injectable()
export class TodoStore {
    todoList$ = todoStore.pipe(
        selectAllEntities(),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    addItem(item: TodoItem) {
        todoStore.update(addEntities(item));
    }
    
    removeItem(itemId: string) {
        todoStore.update(deleteEntities(itemId));
    }
}