import {directive, DirectiveClass} from 'lit/async-directive.js';
import {FormModel} from './form-model-controller';
import {
  AbstractFieldDirective,
  FieldElement,
  FieldOptions,
} from './field-directive-base';
import {ElementPart, nothing} from 'lit';
import {deepGetValue} from '../deep';
import {FieldPath, FieldValues} from '../form-binding/types';
import {Subscription} from 'rxjs';

// Custom field directive to bind form model to input value
export class FormFieldDirective extends AbstractFieldDirective {
  protected model!: FormModel;
  protected get fieldValue(): unknown {
    return deepGetValue(this.model.getAllData(), this.path);
  }

  private subscriptions: Subscription[] = [];

  override update(
    part: ElementPart,
    [model, path, options]: Parameters<this['render']>
  ): symbol {
    if (this.isConnected) {
      this.model = model;

      this.bind(part.element as FieldElement, path, options);

      // forwarding validations to be handled by the form model
      this.model.setValidations(this.path, this.validator);

      this.subscriptions.push(
        this.model.watch(
          ({oldFormModelData, newFormModelData, changedPath}) => {
            const changed =
              deepGetValue(oldFormModelData, this.path) !==
              deepGetValue(newFormModelData, this.path);

            if (!changed || changedPath !== this.path) return;

            const newValue = deepGetValue(newFormModelData, this.path);

            this._formBindingSetValueFn(newValue);
          }
        )
      );
    }

    return this.render(this.model, this.path, this.options);
  }

  override render(_model: FormModel, _path: string, _options?: FieldOptions) {
    return nothing;
  }

  protected updateModelData(value: unknown) {
    this.model.updateData(this.path, value);
  }

  override disconnected(): void {
    super.disconnected();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }
}

// helper function to create type safe field directive
const createFormFieldDirective = (CustomDirectiveClass: DirectiveClass) => {
  const _fieldDirective = directive(CustomDirectiveClass);

  return <
    TFieldValues extends FieldValues = FieldValues,
    TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
  >(
    formModel: FormModel<TFieldValues>,
    path: TFieldName,
    options?: FieldOptions
  ) => {
    return _fieldDirective(formModel, path, options);
  };
};

export const formField = createFormFieldDirective(FormFieldDirective);
