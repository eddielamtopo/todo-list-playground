import { Container } from "inversify";
import 'reflect-metadata';
import { TodoStore } from "./stores/todo.store";
import { TodoService } from "./services/todo-service";
const container = new Container();
container.bind(TodoStore).toSelf().inSingletonScope();
container.bind(TodoService).toSelf().inSingletonScope();
export { container };
//# sourceMappingURL=inversify.config.js.map