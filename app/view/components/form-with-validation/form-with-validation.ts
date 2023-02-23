import {css, html, LitElement, nothing} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import {customElement, property, state} from 'lit/decorators.js';
// form model and form field directive
import {FormModel} from '../../helpers/form-model-controller';
import {formField} from '../../helpers/form-field-directive';
import {TCheckListItem} from '../my-checklist/my-checklist';
import '../my-checklist/my-checklist';
import {deepCheckAny} from '../../helpers/deep/index';

type TMyForm = {
  firstName: string;
  lastName: string;
  age: number;
  dob: string;
  profileImg: string;
  annualIncome: number;
  maritalStatus: string;
  numberOfChildren: string;
  phoneNumber: {
    personal: string;
    work: string[];
  };
  checkList: {
    id: string;
    name: string;
    crossedOff: boolean;
  }[];
};
const FormWithValidationName = 'form-with-validation';
@customElement(FormWithValidationName)
export class FormWithValidation extends LitElement {
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

    .check-list-invalid-message {
      opacity: 0;
    }

    .check-list-invalid-message.has-error {
      opacity: 1;
    }

    form *[invalid] {
      border: 2px solid red;
    }
  `;

  @state()
  formModel = new FormModel<TMyForm>(this, {
    firstName: '',
    lastName: '',
    age: 0,
    dob: `${new Date().getFullYear()}-${
      (new Date().getMonth() + 1).toString().length === 1 ? '0' : ''
    }${new Date().getUTCMonth() + 1}-${new Date().getDate()}`,
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
  });

  // conditionals (useful for triggering element(this) update)
  @state()
  showNumberOfChildrenCheckBox = false;
  @state()
  checkedNumberOfChildren = this.formModel.data.numberOfChildren;
  @state()
  submitDisabled = this.formModel.isDataValid;

  @state()
  formModelDataChangeSubscriptio = this.formModel.watch(
    ({newFormModelData, isDataValid}) => {
      // update conditions
      this.showNumberOfChildrenCheckBox =
        newFormModelData.maritalStatus === 'married';
      this.checkedNumberOfChildren = newFormModelData.numberOfChildren;
      this.submitDisabled = !isDataValid;
    }
  );

  @state()
  renderCount = 0;

  @state()
  numberOfChildrenOptions = ['', '0 - 2', '3 - 5 or more'];

  _handleSubmit(e: Event) {
    e.preventDefault();
    console.log('trigger submit');
    console.log(this.formModel.data);
    console.log(this.formModel.errors);
    this.formModel.validateAllFields();
    console.log(`Form is valid: ${this.formModel.isDataValid}`);
  }

  @property()
  additionalWorkNumberCount = 0;

  _handleAddAdditional(e: Event) {
    e.preventDefault();
    this.additionalWorkNumberCount += 1;
    this.formModel.data.phoneNumber.work[this.additionalWorkNumberCount] = '';
  }

  override render() {
    this.renderCount += 1;

    return html`
      <p>Render count: ${this.renderCount}</p>
      <form @submit=${this._handleSubmit}>
        <h1>My Form With Validation:</h1>

        <div>
          <label> First name: <sub>*</sub></label>
          <input
            placeholder="This is required!"
            ${formField(this.formModel, 'firstName', {
              isValid: (value) => (value as string).length > 0,
              errorMessage: 'First name is required!',
            })}
          />
          ${
            this.formModel.errors.firstName
              ? html`<span class="error-message"
                  >${this.formModel.errors.firstName}</span
                >`
              : nothing
          }
        </div>

        <div>
          <label> Age: <sub>*</sub></label>
          <input
            type="number"
            placeholder="Enter your age"
            ${formField(this.formModel, 'age', {
              isValid: (value) => (value as number) > 18,
              errorMessage: 'Must be older than 18',
            })}
          />
          ${
            this.formModel.errors.age
              ? html`<span class="error-message"
                  >${this.formModel.errors.age}</span
                >`
              : nothing
          }
        </div>

        <div>
          <label>Profile Image: <sub>*</sub></label>
          <input
            type="file"
            ${formField(this.formModel, 'profileImg', {
              isValid: (value) => Boolean(value),
              errorMessage: 'Must include an image',
            })}
          />
          ${
            this.formModel.errors.profileImg
              ? html`<span class="error-message">
                  ${this.formModel.errors.profileImg}</span
                >`
              : nothing
          }
        </div>

        <div>
          <label>Marital status:</label>
          <select
            ${formField(this.formModel, 'maritalStatus')}
            @change=${() => {
              if (this.formModel.data.maritalStatus !== 'married') {
                // reset number of children checkbox value
                this.formModel.data.numberOfChildren = '-1';
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

        <div>
          ${
            this.showNumberOfChildrenCheckBox
              ? this.numberOfChildrenOptions.map((value) => {
                  return html`
                    <label
                      ><input
                        type="checkbox"
                        value=${value}
                        ${formField(this.formModel, 'numberOfChildren')}
                        .checked=${this.checkedNumberOfChildren === value}
                      />
                      ${value ? `Has ${value} kids` : 'No kids'}
                    </label>
                  `;
                })
              : nothing
          }
        </div>

        <!-- DEMO: input:date -->
        <div>
          <label> Date of birth:<sub>*</sub></label>
          <input
            type="date"
            .defaultValue=${new Date().toLocaleDateString()}
            placeholder="Required"
            ${formField(this.formModel, 'dob', {
              isValid: (value) => {
                return Boolean(
                  new Date(value as string).getTime() < new Date().getTime()
                );
              },
              errorMessage: 'Age must be older than today!',
            })}
          />
        </div>

        <div>
          <label> Phone number (personal):</label>
          <input
            placeholder="Must be 8 digit long"
            ${formField(this.formModel, 'phoneNumber.personal', {
              pattern: /^\d{8}$/,
            })}
          />
        </div>

        <div>
          <label> Phone number (work):</label>
          <input
            placeholder="Must be 8 digits long"
            ${formField(this.formModel, 'phoneNumber.work.0', {
              pattern: /^\d{8}$/,
            })}
          />
        </div>

        <div class="additional-work-phone-container">
          <button @click=${this._handleAddAdditional}>Add another</button>
          ${Array.from(
            Array(this.additionalWorkNumberCount),
            (_, i) => i + 1
          ).map((i) => {
            return html`
              <div>
                <label for="nested.b.${i}">
                  Additional work phone (${i}):</label
                >
                <input ${formField(this.formModel, `phoneNumber.work.${i}`)} />
              </div>
            `;
          })}
        </div>

        <div class=${classMap({
          'check-list-invalid-message': true,
          'has-error': deepCheckAny(this.formModel.errors.checkList, true),
        })}>
          ⚠️ Not everything on the list is crossed-off!
        </div>
        </div>
        <my-checklist
          .items=${this.formModel.data.checkList}
          ${formField(this.formModel, 'checkList', {
            isValid: (items) => {
              return (items as TCheckListItem[]).every((item) => {
                return item.crossedOff;
              });
            },
          })}
        ></my-checklist>

        <input type="submit" .disabled=${this.submitDisabled} />
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [FormWithValidationName]: FormWithValidation;
  }
}
