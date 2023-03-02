import {directive, DirectiveClass} from 'lit/async-directive.js';
import {FormModel} from './form-model-controller';
import {
  AbstractFieldDirective,
  FieldElement,
  FieldOptions,
  supportedStandardFormFieldElementsNodeNames,
} from './abstract-field-directive';
import {ElementPart, nothing} from 'lit';
import {Subject, Subscription} from 'rxjs';
import {
  FormFieldBindingEventSetValueMethodName,
  IFormBindingElement,
} from './interface/form-binding-element';
import {CustomFormBindingElementTag} from './decorators/support-form-binding';
import {deepGetValue} from './deep';
import {FieldPath, FieldValues} from './types';

// Custom field directive to bind form model to input value
export class FormFieldDirective extends AbstractFieldDirective {
  protected model!: FormModel;
  protected get fieldValue(): unknown {
    return deepGetValue(this.model.getAllData(), this.path);
  }

  private fieldChangeSubject = new Subject<{path: string; newValue: unknown}>();
  private fieldChangeSubscription?: Subscription;

  override update(
    part: ElementPart,
    [model, path, options]: Parameters<this['render']>
  ): symbol {
    if (this.isConnected) {
      this.model = model;

      this.bind(part.element as FieldElement, path, options);

      // forwarding validations to be handled by the form model
      this.model.setValidations(this.path, this.validator);
      // forwarding a subject for the model
      // to listen to emits of new change on the field the element part is binding to
      this.fieldChangeSubject.asObservable().subscribe(({newValue}) => {
        if (
          supportedStandardFormFieldElementsNodeNames.find(
            (nodeName) => nodeName === this.fieldElement.nodeName
          )
        ) {
          (this.fieldElement as HTMLInputElement).value = String(newValue);
        }

        if (CustomFormBindingElementTag in this.fieldElement) {
          const element = this.fieldElement as IFormBindingElement<unknown>;
          element[FormFieldBindingEventSetValueMethodName](newValue);
        }
      });
      this.model.setFormFieldSubjects(this.path, this.fieldChangeSubject);
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
    this.fieldChangeSubscription?.unsubscribe();
    this.fieldChangeSubscription = undefined;
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
