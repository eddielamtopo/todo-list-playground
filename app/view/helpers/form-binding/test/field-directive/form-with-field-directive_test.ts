import './form-with-field-directive'; // import this to have the element built
import {FormWithFieldDirective} from './form-with-field-directive'; // import the type definition of the element
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
  const el: FormWithFieldDirective = await litFixture(
    html`<form-with-field-directive></form-with-field-directive>`
  );

  test('works with input[type="text"]', () => {
    const textInput = el.shadowRoot!.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement;
    simulateChangeEvent(textInput, 'Hello');
    assert.strictEqual('Hello', el.form.textField);
  });

  test('works with input[type="number"]', () => {
    const numberInput = el.shadowRoot!.querySelector(
      'input[type="number"]'
    ) as HTMLInputElement;
    simulateChangeEvent(numberInput, 123);
    assert.equal(123, el.form.numberField);
  });

  test('works with input[type="date"]', () => {
    const dateInput = el.shadowRoot!.querySelector(
      'input[type="date"]'
    ) as HTMLInputElement;
    const today = new Date();
    const day = `0${today.getDate()}`.slice(-2);
    const month = `0${today.getMonth() + 1}`.slice(-2);
    const dateValue = `${today.getFullYear()}-${month}-${day}`;
    simulateChangeEvent(dateInput, dateValue);
    assert.strictEqual(el.form.dateField, dateValue);
  });

  test('works with input[type="checkbox"]', () => {
    const checkboxInputs = el.shadowRoot!.querySelectorAll(
      'input[type="checkbox"]'
    ) as NodeListOf<HTMLInputElement>;
    Array.from(checkboxInputs).forEach((checkBox, index) => {
      if (index !== 1) {
        checkBox.click();
        checkBox.dispatchEvent(new Event('change'));
      }
    });
    assert.deepEqual(el.form.checkboxesField, [
      'checked',
      'unchecked',
      'checked',
    ]);
  });

  test('works with input[type="radio"]', () => {
    const radioInputs = el.shadowRoot!.querySelectorAll(
      'input[type="radio"]'
    ) as NodeListOf<HTMLInputElement>;
    Array.from(radioInputs).forEach((radio) => {
      radio.click();
      radio.dispatchEvent(new Event('change'));
    });
    assert.deepEqual(el.form.radioField, 'Louie');
  });

  test('works with select', () => {
    const select = el.shadowRoot!.querySelector('select') as HTMLSelectElement;
    simulateChangeEvent(select, 'option-2');

    assert.strictEqual(el.form.selectField, 'option-2');
  });

  // test('works with standard html form elements', async () => {
  //   // const fileInput = el.shadowRoot!.querySelector(
  //   //   'input[type="file"]'
  //   // ) as HTMLInputElement;
});
