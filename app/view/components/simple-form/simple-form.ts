import {css, html, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {TCheckListItem} from '../my-checklist/my-checklist';
import {field} from '../../helpers/field-directive';

const SimpleFormName = 'simple-form';
@customElement(SimpleFormName)
export class SimpleForm extends LitElement {
  static override styles = css`
    form > * {
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

  @property()
  formModel = {
    firstName: '',
    lastName: '',
    age: 0,
    profileImg: null,
    annualIncome: 200000,
    maritalStatus: '',
    numberOfChildren: '',
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

        <!-- text fields -->
        <div>
          <label> First name:<sub>*</sub></label>
          <input
            placeholder="Must give a name"
            ${field(this.formModel, 'firstName', {
              isValid: (value) => (value as string).length > 0,
              errorMessage: 'First name is required!',
            })}
          />
        </div>

        <!-- DEMO: input:number -->
        <div>
          <label> Age:<sub>*</sub></label>
          <input
            type="number"
            placeholder="Must disclose your age"
            ${field(this.formModel, 'age', {
              isValid: (value) => (value as number) > 18,
              errorMessage: 'Age validation!',
            })}
          />
        </div>

        <!-- DEMO: input:file -->
        <div>
          <label>Profile Image:<sub>*</sub></label>
          <input
            type="file"
            ${field(this.formModel, 'profileImg', {
              isValid: (value) => Boolean(value),
            })}
          />
        </div>

        <!-- DEMO: input:range -->
        <div>
          <label>Annual Income:<sub>*</sub></label>
          <input
            min=${0}
            step=${10000}
            max=${10000000}
            type="range"
            ${field(this.formModel, 'annualIncome', {
              isValid: (value) => Boolean(value),
            })}
          />
        </div>

        <!-- DEMO: select options -->
        <div>
          <label>Marital status:</label>
          <select
            ${field(this.formModel, 'maritalStatus')}
            @change=${() => this.requestUpdate()}
          >
            <option value="">-- Select one --</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>

        <!-- DEMO: reconnection to the dom works -->
        ${when(
          this.formModel.maritalStatus === 'married',
          () => html`
            <div>
              <p>Number of kids:</p>
              <!-- DEMO: checkbox -->
              <label
                ><input
                  type="checkbox"
                  value="0-2"
                  ${field(this.formModel, 'numberOfChildren')}
                  @change=${() => {
                    this.formModel.numberOfChildren = '0-2';
                    this.requestUpdate();
                  }}
                  .checked=${this.formModel.numberOfChildren === '0-2'}
                />
                Has less than or equal to 2 kids
              </label>
              <label
                ><input
                  type="checkbox"
                  value=">2 & <5"
                  ${field(this.formModel, 'numberOfChildren')}
                  @change=${() => {
                    this.formModel.numberOfChildren = '>2 & <5';
                    this.requestUpdate();
                  }}
                  .checked=${this.formModel.numberOfChildren === '>2 & <5'}
                />
                Has between 2 to 5 kids</label
              >

              <label
                ><input
                  type="checkbox"
                  value=">5"
                  ${field(this.formModel, 'numberOfChildren')}
                  @change=${() => {
                    this.formModel.numberOfChildren = '>5';
                    this.requestUpdate();
                  }}
                  .checked=${this.formModel.numberOfChildren === '>5'}
                />
                Has more than 5 kids</label
              >
            </div>
          `,
          () => nothing
        )}

        <!-- DEMO: input:date -->
        <div>
          <label> Date of birth:<sub>*</sub></label>
          <input
            type="date"
            placeholder="Required"
            ${field(this.formModel, 'firstName', {
              isValid: (value) => {
                console.log('date:', value);
                return Boolean(value);
              },
              errorMessage: 'Age validation!',
            })}
          />
        </div>

        <!-- DEMO: pattern validation -->
        <div>
          <label> Phone number (personal):</label>
          <input
            placeholder="Must be 8 digit long"
            ${field(this.formModel, 'phoneNumber.personal', {
              pattern: /^\d{8}$/,
            })}
          />
        </div>

        <div>
          <label> Phone number (work):</label>
          <input
            placeholder="Must be 8 digits long"
            ${field(this.formModel, 'phoneNumber.work.0', {
              pattern: /^\d{8}$/,
            })}
          />
        </div>

        <!-- DEMO: programatically insert fields -->
        <div class="additional-work-phone-container">
          <button @click=${this.handleAddWorkPhone}>
            Add another work phone
          </button>
          ${Array.from(
            Array(this.additionalWorkPhoneNumbers).fill(undefined),
            (_, i) => i + 1
          ).map((i) => {
            return html`
              <div>
                <label> Phone number (work additional ${i}):</label>
                <input ${field(this.formModel, `phoneNumber.work.${i}`)} />
              </div>
            `;
          })}
        </div>

        <!-- DEMO: custom components custom form binding events -->
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
