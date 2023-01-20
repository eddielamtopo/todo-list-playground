import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {createRef, Ref, ref} from 'lit/directives/ref.js';
import ObserveController from '../../helpers/observe-controller';
import {container} from '../../../core/inversify.config';
import {TodoService} from '../../../core/module/todo/services/todo-service';
import {TodoListRemoveItemEvent} from './todo-list';

const TodoListContainerName = 'todo-list-container';
@customElement(TodoListContainerName)
export class TodoListContainer extends LitElement {

  private readonly _todoService: TodoService = container.get(TodoService);
  
  private readonly _inputRef: Ref<HTMLInputElement> = createRef();
  private readonly _todoItems$ = new ObserveController(this, this._todoService.getEntityEvent());

  constructor() {
    super();
    this.addEventListener(TodoListRemoveItemEvent, (e) => this._todoService.removeItem(e.detail.itemId));
  }

  private _onAddClick() {
    if(this._inputRef.value?.value) {
      this._todoService.addItem(this._inputRef.value.value);
      this._inputRef.value.value = '';
    }
  }

  override render() {
    return html`
      <h1>My Todo List</h1>
      
      <input ${ref(this._inputRef)} />
      <button @click=${this._onAddClick} part="button">
        Add
      </button>
      
      <todo-list .items=${this._todoItems$.value} />
      
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    TodoListContainerName: TodoListContainer;
  }
}