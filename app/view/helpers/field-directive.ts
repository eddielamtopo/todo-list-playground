import {ElementPart, nothing} from 'lit';
import {directive, DirectiveResult} from 'lit/async-directive';
import {
  AbstractFieldDirective,
  FieldElement,
  FieldOptions,
} from './abstract-field-directive';
import {deepGetValue, deepUpdate} from './deep/index';
import {FieldPath, FieldValues} from './types';

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

// type safe field directive
declare function FieldFn<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  formModel: TFieldValues,
  path: TFieldName,
  options?: FieldOptions
): DirectiveResult<typeof FieldDirective>;

export const field: typeof FieldFn = () => directive(FieldDirective);
