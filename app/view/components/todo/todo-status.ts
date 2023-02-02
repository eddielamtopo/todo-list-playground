import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {map} from "rxjs";
import {container} from '../../../core/inversify.config';
import {TodoService} from '../../../core/module/todo/services/todo-service';
import {observe} from '../../helpers/observe-directive';

@customElement('todo-status')
export class TodoStatus extends LitElement {

  private readonly _todoCount$ = container.get(TodoService).getEntityEvent().pipe(map(items => items.length));

  override render() {
    return html`
      <p>Todo list has ${observe(this._todoCount$)} items.</p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'todo-status': TodoStatus;
  }
}