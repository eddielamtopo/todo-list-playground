import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {FormBindingEvent} from '../../helpers/decorators/FormBindingEvent';
import {classMap} from 'lit/directives/class-map.js';
import strictCustomEvent from '../../helpers/customevents/strict-custom-event';

type TCheckListItems = {
  id: string;
  name: string;
  crossedOff: boolean;
}[];
export const ItemCrossedOffEvent = 'item-clicked';
export type TodoListItemClickEvent = {
  readonly items: TCheckListItems;
};

const MyCheckListName = 'my-checklist';
@customElement(MyCheckListName)
class MyCheckList extends LitElement {
  static override styles = css`
    .crossed-off {
      color: lightgray;
      text-decoration: line-through;
    }
  `;

  @property()
  items: TCheckListItems = [];

  @FormBindingEvent(ItemCrossedOffEvent)
  getValue(e: CustomEvent<TodoListItemClickEvent>) {
    return e.detail.items;
  }

  itemClicked(id: string) {
    const result = this.items.map((item) => {
      if (item.id === id) {
        return {...item, crossedOff: !item.crossedOff};
      }
      return item;
    });
    this.items = result;
    this.dispatchEvent(
      strictCustomEvent(ItemCrossedOffEvent, {
        bubbles: true,
        detail: {items: this.items},
      })
    );
  }

  override render() {
    return html`
      <ul>
        ${this.items.map((item) => {
          return html`<li
            @click=${() => this.itemClicked(item.id)}
            class=${classMap({
              'crossed-off': item.crossedOff,
            })}
          >
            ${item.name}
          </li>`;
        })}
      </ul>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [MyCheckListName]: MyCheckList;
  }
  interface HTMLElementEventMap {
    [ItemCrossedOffEvent]: CustomEvent<TodoListItemClickEvent>;
  }
}
