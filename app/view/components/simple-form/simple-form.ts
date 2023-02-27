import {css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {map} from 'lit/directives/map.js';
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

  @state()
  numberOfChildrenOptions = ['', '0 - 2', '3 - 5 or more'];

  @state()
  formModel = {
    firstName: '',
    lastName: '',
    age: 0,
    dob: '',
    profileImg: '',
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

  // conditionals that control the view
  @state()
  showNumberOfChildren = false;
  @state()
  checkedNumberOfChildren = this.formModel.numberOfChildren;

  @state()
  renderCount = 0;

  _handleSubmit(e: Event) {
    e.preventDefault();
    console.log(this.formModel);
  }

  @state()
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
              isValidFn: (value) =>
                (value as string).length > 0 ? true : 'First name is required',
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
              isValidFn: (value) =>
                (value as number) > 18 || 'Must be older than 18',
            })}
          />
        </div>

        <!-- DEMO: input:file -->
        <div>
          <label>Profile Image:<sub>*</sub></label>
          <input
            type="file"
            ${field(this.formModel, 'profileImg', {
              isValidFn: (value) => Boolean(value),
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
              isValidFn: (value) => Boolean(value),
            })}
          />
        </div>

        <!-- DEMO: select options -->
        <div>
          <label>Marital status:</label>
          <select
            ${field(this.formModel, 'maritalStatus')}
            @change=${(e: Event) => {
              // trigger state change for re-render
              this.showNumberOfChildren =
                (e.target as HTMLInputElement).value === 'married';

              // reset number of children checkbox value
              if (this.formModel.maritalStatus !== 'married') {
                this.formModel.numberOfChildren = '-1';
              }
            }}
          >
            <option value="">-- Select one --</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>

        <!-- DEMO: checkbox that only allow 1 checked checkbox -->
        <!-- for something that needs this level of control, make it a controlled component instead of field -->
        <div>
          ${when(this.showNumberOfChildren, () =>
            map(this.numberOfChildrenOptions, (value) => {
              return html`
                <label
                  ><input
                    type="checkbox"
                    value=${value}
                    ${field(this.formModel, 'numberOfChildren')}
                    @change=${(e: Event) => {
                      this.checkedNumberOfChildren = (
                        e.target as HTMLInputElement
                      ).value;
                    }}
                    .checked=${this.checkedNumberOfChildren === value}
                  />
                  ${value ? `Has ${value} kids` : 'No kids'}
                </label>
              `;
            })
          )}
        </div>

        <!-- DEMO: input:date -->
        <div>
          <label> Date of birth:<sub>*</sub></label>
          <input
            type="date"
            placeholder="Required"
            ${field(this.formModel, 'dob', {
              isValidFn: (value) => {
                const valid = Boolean(
                  new Date(value as string).getTime() < new Date().getTime()
                );
                return valid ? true : 'Age must be older than today';
              },
            })}
          />
        </div>

        <!-- DEMO: pattern validation -->
        <div>
          <label> Phone number (personal):</label>
          <input
            placeholder="Must be 8 digit long"
            ${field(this.formModel, 'phoneNumber.personal', {
              isValidFn: (v) => {
                if (typeof v === 'string') {
                  const valid = /^\d{8}$/.test(v);
                  return !valid ? 'Must be 8 digit' : true;
                }
                return true;
              },
            })}
          />
        </div>

        <div>
          <label> Phone number (work):</label>
          <input
            placeholder="Must be 8 digits long"
            ${field(this.formModel, 'phoneNumber.work.0', {
              isValidFn: (v) => {
                if (typeof v === 'string') {
                  const valid = /^\d{8}$/.test(v);
                  return valid ? true : 'Must be 8 digit long';
                }
                return true;
              },
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
            isValidFn: (items) => {
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
