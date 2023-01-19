import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {createRef, Ref, ref} from 'lit/directives/ref.js';
import {repeat} from 'lit/directives/repeat.js';
import {ObserveController} from '../../helpers/observe-controller';
import {container} from '../../../core/inversify.config';
import {TodoService} from '../../../core/module/todo/services/todo-service';

@customElement('todo-list')
export class TodoList extends LitElement {

  private readonly _todoService: TodoService = container.get(TodoService);
  
  private readonly _inputRef: Ref<HTMLInputElement> = createRef();
  private readonly _todoItems$ = new ObserveController(this, this._todoService.getEntityEvent());

  private _onAddClick() {
    if(this._inputRef.value?.value) {
      this._todoService.addItem(this._inputRef.value.value);
      this._inputRef.value.value = '';
    }
  }
  
  private _onRemoveClick(itemId: string) {
    this._todoService.removeItem(itemId);
  }

  override render() {
    return html`
      <h1>My Todo List</h1>
      
      <input ${ref(this._inputRef)} />
      <button @click=${this._onAddClick} part="button">
        Add
      </button>
      
      <ul>
        ${repeat(this._todoItems$.value ?? [], (item) => item.id, (item, index) => html`
        <li>${index}: ${item.content} - ${new Date(item.timestamp)} <button @click=${() => this._onRemoveClick(item.id)} part="button">X</button></li>
      `)}
      </ul>
      
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'todo-list': TodoList;
  }
}