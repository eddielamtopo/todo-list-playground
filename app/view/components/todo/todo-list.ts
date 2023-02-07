import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import {TodoItem} from '../../../core/module/todo/models/todo-item.model';
import strictCustomEvent from '../../helpers/customevents/strict-custom-event';

export const TodoListRemoveItemEvent = 'todo-list_remove-item-click';
export type TodoListRemoveItemEvent = {
  readonly itemId: string;
}

const TodoListName = 'todo-list';
@customElement(TodoListName)
export class TodoList extends LitElement {

  @property()
  public items: TodoItem[] = [];
  
  private _onRemoveClick(itemId: string) {
    this.dispatchEvent(strictCustomEvent(TodoListRemoveItemEvent, {composed: true, detail: {itemId}}));
  }

  override render() {
    return html`
      <ul>
        ${repeat(this.items ?? [], (item) => item.id, (item, index) => html`
        <li>${index}: ${item.content} - ${new Date(item.timestamp)} <button @click=${() => this._onRemoveClick(item.id)} part="button">X</button></li>
      `)}
      </ul>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    TodoListName: TodoList;
  }
  interface HTMLElementEventMap {
    [TodoListRemoveItemEvent]: CustomEvent<TodoListRemoveItemEvent>
  }
}