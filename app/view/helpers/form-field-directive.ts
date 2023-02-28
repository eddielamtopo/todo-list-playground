import {FormModel} from './form-model-controller';
import {
  AbstractFieldDirective,
  createFieldDirective,
  supportedStandardFormFieldElementsNodeNames,
} from './abstract-field-directive';
import {ElementPart} from 'lit';
import {Subject, Subscription} from 'rxjs';
import {
  FormFieldBindingEventSetValueMethodName,
  IFormBindingElement,
} from './interface/form-binding-element';
import {CustomFormBindingElementTag} from './decorators/support-form-binding';
import {deepGetValue} from './deep';

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
    params: Parameters<this['render']>
  ): symbol {
    const returnValue = super.update(part, params);
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

    return returnValue;
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

export const formField = createFieldDirective(FormFieldDirective);
