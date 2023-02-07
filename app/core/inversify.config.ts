import {Container} from "inversify";
import 'reflect-metadata';
import {TodoStore} from "./module/todo/stores/todo.store";
import {TodoService} from "./module/todo/services/todo-service";

const container = new Container();
container.bind<TodoStore>(TodoStore).toSelf().inSingletonScope();
container.bind<TodoService>(TodoService).toSelf().inSingletonScope();

export { container };