import {ElementPart, nothing} from 'lit';
import {directive, DirectiveClass} from 'lit/async-directive.js';
import {
  AbstractFieldDirective,
  FieldElement,
  FieldOptions,
} from './field-directive-base';
import {deepGetValue, deepUpdate} from '../deep/index';
import {FieldPath, FieldValues} from '../form-binding/types';

export class FieldDirective extends AbstractFieldDirective {
  protected model!: FieldValues;
  protected get fieldValue(): unknown {
    return deepGetValue(this.model, this.path);
  }

  protected updateModelData(value: unknown) {
    const newModel = deepUpdate(this.model, this.path, value);
    Object.assign(this.model, newModel);
  }

  override update(
    part: ElementPart,
    [model, path, options]: Parameters<this['render']>
  ) {
    if (this.isConnected) {
      this.model = model;
      this.bind(part.element as FieldElement, path, options);
    }

    return this.render(this.model, this.path, this.options);
  }

  override render(_model: FieldValues, _path: string, _options?: FieldOptions) {
    return nothing;
  }
}

// helper function to create type safe field directive
const createFieldDirective = (CustomDirectiveClass: DirectiveClass) => {
  const _fieldDirective = directive(CustomDirectiveClass);

  return <
    TFieldValues extends FieldValues = FieldValues,
    TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
  >(
    formModel: TFieldValues,
    path: TFieldName,
    options?: FieldOptions
  ) => {
    return _fieldDirective(formModel, path, options);
  };
};

export const field = createFieldDirective(FieldDirective);
