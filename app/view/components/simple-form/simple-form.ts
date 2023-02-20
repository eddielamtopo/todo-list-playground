import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {TCheckListItem} from '../my-checklist/my-checklist';
import {field} from '../../helpers/field-directive';

const SimpleFormName = 'simple-form';
@customElement(SimpleFormName)
export class SimpleForm extends LitElement {
  static override styles = css`
    .input-container {
      display: flex;
      flex-direction: column;
      margin-bottom: 20px;
      align-items: flex-start;
    }

    label {
      margin-bottom: 10px;
    }

    label sub {
      vertical-align: text-top;
      color: red;
    }

    .error-message {
      color: red;
    }

    .additional-work-phone-container {
      padding-bottom: 20px;
    }

    .additional-work-phone-container > *:not(:last-child) {
      margin-bottom: 20px;
    }

    *[invalid]:not(my-checklist) {
      border: 2px solid red;
    }
  `;

  formModel = {
    firstName: '',
    lastName: '',
    phoneNumber: {
      personal: '',
      work: [''],
    },
    checkList: [
      {
        id: '1',
        name: 'Drink water',
        crossedOff: false,
      },
    ],
  };

  @property()
  renderCount = 0;

  _handleSubmit(e: Event) {
    e.preventDefault();
    console.log(this.formModel);
  }

  @property()
  additionalWorkPhoneNumbers = 0;
  handleAddWorkPhone() {
    this.additionalWorkPhoneNumbers += 1;
    this.formModel.phoneNumber.work[this.additionalWorkPhoneNumbers] = '';
  }

  override render() {
    this.renderCount += 1;

    return html`
      <p>Render count: ${this.renderCount}</p>
      <form @submit=${this._handleSubmit}>
        <h1>My Simple Form:</h1>

        <div class="input-container">
          <label> First name:<sub>*</sub></label>
          <input
            placeholder="Required"
            ${field(this.formModel, 'firstName', {
              isValid: (value) => (value as string).length > 0,
              errorMessage: 'First name is required!',
            })}
          />
        </div>

        <div class="input-container">
          <label for="right"> Last name:</label>
          <input ${field(this.formModel, 'lastName')} />
        </div>

        <div class="input-container">
          <label> Phone number (personal):</label>
          <input ${field(this.formModel, 'phoneNumber.personal')} />
        </div>

        <div class="input-container">
          <label> Phone number (work):</label>
          <input ${field(this.formModel, 'phoneNumber.work.0')} />
        </div>

        <div class="additional-work-phone-container">
          <button @click=${this.handleAddWorkPhone}>
            Add another work phone
          </button>
          ${Array.from(
            Array(this.additionalWorkPhoneNumbers).fill(undefined),
            (_, i) => i + 1
          ).map((i) => {
            return html`
              <div class="input-container">
                <label> Phone number (work additional ${i}):</label>
                <input ${field(this.formModel, `phoneNumber.work.${i}`)} />
              </div>
            `;
          })}
        </div>

        <my-checklist
          .items=${this.formModel.checkList}
          ${field(this.formModel, 'checkList', {
            isValid: (items) => {
              return (items as TCheckListItem[]).every((item) => {
                return item.crossedOff;
              });
            },
          })}
        ></my-checklist>

        <input type="submit" />
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [SimpleFormName]: SimpleForm;
  }
}