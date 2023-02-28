import {FormModel} from './form-model-controller';
import {
  AbstractFieldDirective,
  createFieldDirective,
  supportedStandardFormFieldElementsNodeNames,
  TFieldELement,
  TFieldOptions,
} from './abstract-field-directive';
import {ElementPart} from 'lit';
import {Subject, Subscription} from 'rxjs';
import {
  FormFieldBindingEventSetValueMethodName,
  IFormBindingElement,
} from './interface/form-binding-element';
import {CustomFormBindingElementTag} from './decorators/support-form-binding';

// Custom field directive to bind form model to input value
export class FormFieldDirective extends AbstractFieldDirective {
  fieldElement!: TFieldELement;
  model!: FormModel;
  options!: TFieldOptions;
  path!: string;

  private fieldChangeSubject = new Subject<{path: string; newValue: unknown}>();
  private fieldChangeSubject$ = this.fieldChangeSubject.asObservable();
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
    this.fieldChangeSubject$.subscribe(({newValue}) => {
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

  private _updateModelData(value: unknown) {
    this.model.updateData(this.path, value);
  }

  handleCustomEvent(data: unknown) {
    this._updateModelData(data);
  }

  handleChangeEvent(event: Event): void {
    // update data value
    this._updateModelData((event.target as HTMLInputElement).value);
  }

  override disconnected(): void {
    super.disconnected();
    this.fieldChangeSubscription?.unsubscribe();
    this.fieldChangeSubscription = undefined;
  }
}

export const formField = createFieldDirective(FormFieldDirective);
