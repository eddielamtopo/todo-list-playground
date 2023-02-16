import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {FormBindingEventPayload} from '../../helpers/decorators/FormBindingEventPayload';
import {classMap} from 'lit/directives/class-map.js';
import strictCustomEvent from '../../helpers/customevents/strict-custom-event';
import {createRef, Ref, ref} from 'lit/directives/ref.js';

export type TCheckListItem = {
  id: string;
  name: string;
  crossedOff: boolean;
};
type TCheckListItems = TCheckListItem[];

// events
export enum CHECKLIST_EVENTS {
  ITEM_CROSSED_OFF = 'item-clicked',
  ITEM_ADDED = 'item-added',
}
export type TFormBindingEventType = {
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

  itemClicked(id: string) {
    const result = this.items.map((item) => {
      if (item.id === id) {
        return {...item, crossedOff: !item.crossedOff};
      }
      return item;
    });

    this.items = result;

    this.dispatchEvent(
      strictCustomEvent(CHECKLIST_EVENTS.ITEM_CROSSED_OFF, {
        bubbles: true,
        detail: {items: this.items},
      })
    );
  }

  inputRef: Ref<HTMLInputElement> = createRef();

  handleAddItemClicked() {
    if (this.inputRef.value) {
      const item = this.inputRef.value.value;
      const newItem = {
        id: Math.random().toString(16).slice(2),
        name: item,
        crossedOff: false,
      };

      const items = [...this.items, newItem];
      this.items = items;

      this.dispatchEvent(
        strictCustomEvent(CHECKLIST_EVENTS.ITEM_ADDED, {
          bubbles: true,
          detail: {
            items,
          },
        })
      );

      this.inputRef.value.value = '';
    }
  }

  @FormBindingEventPayload(Object.values(CHECKLIST_EVENTS))
  getValue(
    e: CustomEvent<TFormBindingEventType> & {type: CHECKLIST_EVENTS}
  ): TCheckListItems {
    if (e.type === CHECKLIST_EVENTS.ITEM_ADDED) {
      return e.detail.items;
    }
    if (e.type === CHECKLIST_EVENTS.ITEM_CROSSED_OFF) {
      return e.detail.items;
    }
    return [];
  }

  override render() {
    return html`
      <div>
        <input
          name="newCheckListItem"
          placeholder="Add new checklist item"
          ${ref(this.inputRef)}
        />
        <button @click=${this.handleAddItemClicked}>Add item</button>
      </div>
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
    [CHECKLIST_EVENTS.ITEM_ADDED]: CustomEvent<TFormBindingEventType>;
    [CHECKLIST_EVENTS.ITEM_CROSSED_OFF]: CustomEvent<TFormBindingEventType>;
  }
}
