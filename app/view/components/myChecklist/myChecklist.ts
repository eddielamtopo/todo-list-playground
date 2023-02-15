import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {FormBindingEventPayload} from '../../helpers/decorators/FormBindingEventPayload';
import {classMap} from 'lit/directives/class-map.js';
import strictCustomEvent from '../../helpers/customevents/strict-custom-event';
import {createRef, Ref, ref} from 'lit/directives/ref.js';

type TCheckListItem = {
  id: string;
  name: string;
  crossedOff: boolean;
};
type TCheckListItems = TCheckListItem[];

// events
export const ItemCrossedOffEvent = 'item-clicked';
export const AddItemEvent = 'add-item';
export type TUnifiedCheckListFormBindingEventPayload = {
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

  @FormBindingEventPayload(ItemCrossedOffEvent)
  getValue(e: CustomEvent<TUnifiedCheckListFormBindingEventPayload>) {
    return e.detail.items;
  }

  @FormBindingEventPayload(AddItemEvent)
  getAnotherEventValue(
    e: CustomEvent<TUnifiedCheckListFormBindingEventPayload>
  ) {
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
    this.requestUpdate();
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
        strictCustomEvent(AddItemEvent, {
          bubbles: true,
          detail: {
            items,
          },
        })
      );

      this.inputRef.value.value = '';
      this.requestUpdate();
    }
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
    [ItemCrossedOffEvent]: CustomEvent<TUnifiedCheckListFormBindingEventPayload>;
    [AddItemEvent]: CustomEvent<TUnifiedCheckListFormBindingEventPayload>;
  }
}
