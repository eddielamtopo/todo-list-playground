import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import strictCustomEvent from '../../helpers/customevents/strict-custom-event';
import {createRef, Ref, ref} from 'lit/directives/ref.js';
import {
  CustomFormBindingElementTag,
  FormFieldBindingEventSetValueMethodName,
  FormFieldBindingMethodName,
  IFormBindingElement,
} from '../../helpers/interface/form-binding-element';

export type TCheckListItem = {
  id: string;
  name: string;
  crossedOff: boolean;
};
type TCheckListItems = TCheckListItem[];

// events
const ItemCrossedOffEventName = 'item-clicked';
const ItemAddEventName = 'item-added';

export type TAddItemToCheckListEventPayload = {
  readonly items: TCheckListItems;
  readonly newItem: TCheckListItem;
};
export type TCrossOffItemFromCheckListEventPayload = {
  readonly items: TCheckListItems;
  readonly removedItemId: string;
};

const MyCheckListName = 'my-checklist';
@customElement(MyCheckListName)
class MyCheckList
  extends LitElement
  implements IFormBindingElement<TCheckListItems>
{
  static override styles = css`
    .crossed-off {
      color: lightgray;
      text-decoration: line-through;
    }
  `;

  [FormFieldBindingMethodName]() {
    return [
      {
        name: ItemAddEventName,
        getValue: (event: CustomEvent<TAddItemToCheckListEventPayload>) => {
          return event.detail.items;
        },
      },
      {
        name: ItemCrossedOffEventName,
        getValue: (
          event: CustomEvent<TCrossOffItemFromCheckListEventPayload>
        ) => {
          return event.detail.items;
        },
      },
    ];
  }

  [CustomFormBindingElementTag] = true;

  [FormFieldBindingEventSetValueMethodName](newValue: TCheckListItems) {
    this.items = newValue;
  }

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
      strictCustomEvent(ItemCrossedOffEventName, {
        bubbles: true,
        detail: {items: this.items, removedItemId: id},
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
        strictCustomEvent(ItemAddEventName, {
          bubbles: true,
          detail: {
            items,
            newItem,
          },
        })
      );
      this.requestUpdate();

      this.inputRef.value.value = '';
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
    [ItemAddEventName]: CustomEvent<TAddItemToCheckListEventPayload>;
    [ItemCrossedOffEventName]: CustomEvent<TCrossOffItemFromCheckListEventPayload>;
  }
}
