import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {createRef, Ref, ref} from 'lit/directives/ref.js';
import {TodoListRemoveItemEvent} from './todo-list';
import TodoListViewModel from './viewmodels/todo-list.viewmodel';

const TodoListContainerName = 'todo-list-container';
@customElement(TodoListContainerName)
export class TodoListContainer extends LitElement {
  
  private readonly _inputRef: Ref<HTMLInputElement> = createRef();
  private readonly _viewModel = new TodoListViewModel(this);

  constructor() {
    super();
    this.addEventListener(TodoListRemoveItemEvent, (e) => this._viewModel.removeItem(e.detail.itemId));
  }

  private _onAddClick() {
    if(this._inputRef.value?.value) {
      this._viewModel.addItem(this._inputRef.value.value);
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
      
      <todo-list .items=${this._viewModel.items} />
      
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    TodoListContainerName: TodoListContainer;
  }
}