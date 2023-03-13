import './form-with-form-field-directive'; // import this to have the element built
import {FormWithFormFieldDirective} from './form-with-form-field-directive'; // import the type definition of the element
import '../../../../../main.js';
import {assert, litFixture} from '@open-wc/testing';
import {html} from 'lit/static-html.js';

suite('field-directive', async () => {
  function simulateChangeEvent(
    element: HTMLInputElement | HTMLSelectElement,
    value: string | number
  ) {
    element.value = String(value);
    element.dispatchEvent(new Event('change', {composed: true}));
  }

  /**
   * define el's type here so you can access properties on it safely
   * el.form <-- ts let this pass
   * */
  const el: FormWithFormFieldDirective = await litFixture(
    html`<form-with-form-field-directive></form-with-form-field-directive>`
  );

  const textInput = el.shadowRoot!.querySelector(
    'input[type="text"]'
  ) as HTMLInputElement;
  const numberInput = el.shadowRoot!.querySelector(
    'input[type="number"]'
  ) as HTMLInputElement;
  const dateInput = el.shadowRoot!.querySelector(
    'input[type="date"]'
  ) as HTMLInputElement;
  const checkboxInputs = el.shadowRoot!.querySelectorAll(
    'input[type="checkbox"]'
  ) as NodeListOf<HTMLInputElement>;
  const radioInputs = el.shadowRoot!.querySelectorAll(
    'input[type="radio"]'
  ) as NodeListOf<HTMLInputElement>;

  test('default set properly', () => {
    assert.equal(textInput.value, el.form.getData('textField'));
    assert.equal(numberInput.value, String(el.form.getData('numberField')));
    assert.equal(dateInput.value, el.form.getData('dateField'));
    assert(
      Array.from(checkboxInputs).reduce((_, checkbox, index) => {
        const isCorrectlyChecked =
          checkbox.value === el.form.getData(`checkboxesField.${index}`)
            ? checkbox.checked
            : !checkbox.checked;
        return isCorrectlyChecked;
      }, true)
    );
    assert(
      Array.from(radioInputs).reduce((_, radio) => {
        const isCorrectlyChecked =
          radio.value === el.form.getData('radioField')
            ? radio.checked
            : !radio.checked;
        return isCorrectlyChecked;
      }, true)
    );
  });

  test('works with input[type="text"]', () => {
    simulateChangeEvent(textInput, 'Hello');
    assert.strictEqual('Hello', el.form.getData('textField'));
  });

  test('validate input on change', () => {
    simulateChangeEvent(textInput, '');
    assert(
      typeof el.form.getErrors().textField === 'string',
      "Required input with error message should return value of type 'string'"
    );
  });

  test('works with input[type="number"]', () => {
    simulateChangeEvent(numberInput, 123);
    assert.equal(123, el.form.getData('numberField'));
  });

  test('works with input[type="date"]', () => {
    const today = new Date();
    const day = `0${today.getDate()}`.slice(-2);
    const month = `0${today.getMonth() + 1}`.slice(-2);
    const dateValue = `${today.getFullYear()}-${month}-${day}`;
    simulateChangeEvent(dateInput, dateValue);
    assert.strictEqual(el.form.getData('dateField'), dateValue);
  });

  test('works with input[type="checkbox"]', () => {
    Array.from(checkboxInputs).forEach((checkBox, index) => {
      if (index !== 1) {
        checkBox.click();
        checkBox.dispatchEvent(new Event('change'));
      }
    });
    assert(() => {
      return (
        // unchecking returns null
        el.form.getData('checkboxesField.0') === null &&
        el.form.getData('checkboxesField.1') === 'unchecked' &&
        el.form.getData('checkboxesField.2') === 'checked'
      );
    }, 'Wrong checkbox values');
  });

  test('correctly validate checkbox value', async () => {
    const mustBeCheckedCheckbox = checkboxInputs[1];
    mustBeCheckedCheckbox.click();
    mustBeCheckedCheckbox.dispatchEvent(new Event('change'));
    mustBeCheckedCheckbox.click();
    mustBeCheckedCheckbox.dispatchEvent(new Event('change'));
    assert(
      typeof el.form.getErrors().checkboxesField[1] === 'string',
      `Expected typeof string but got ${el.form.getErrors().checkboxesField}`
    );
  });

  test('works with input[type="radio"]', () => {
    Array.from(radioInputs).forEach((radio) => {
      radio.click();
      radio.dispatchEvent(new Event('change'));
    });
    assert.deepEqual(el.form.getData('radioField'), 'Louie');
  });

  test('works with select', () => {
    const select = el.shadowRoot!.querySelector('select') as HTMLSelectElement;
    simulateChangeEvent(select, 'option-2');

    assert.strictEqual(el.form.getData('selectField'), 'option-2');
  });

  test('Updating form property did not trigger re-render', () => {
    assert.equal(el.renderCount, 1);
  });
});
