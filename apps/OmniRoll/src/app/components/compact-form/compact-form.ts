import {
  Component,
  DestroyableInjector,
  Injector,
  OnChanges,
  OnDestroy,
  SimpleChange,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  FieldTree,
  FormField,
  SchemaPath,
  form,
  minLength,
  pattern,
  required,
} from '@angular/forms/signals';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { InplaceModule } from 'primeng/inplace';
import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';

export type CompactFormValue = boolean|number|string;
export type CompactFormValues = Record<string, CompactFormValue>;
export type CompactFormFields = CompactFormField[];
export type CompactFormField = CompactFormFieldRange|CompactFormFieldText|CompactFormFieldUrl|CompactFormFieldBoolean;
export interface CompactFormFieldRange {
  key: string;
  type: 'range';
  label: string;
  min: number;
  max: number;
}
export interface CompactFormFieldText {
  key: string;
  type: 'text';
  label: string;
  required?: boolean;
}
export interface CompactFormFieldUrl {
  key: string;
  type: 'url';
  label: string;
}
export interface CompactFormFieldBoolean {
  key: string;
  type: 'boolean';
  label: string;
}

@Component({
  selector: 'app-compact-form',
  imports: [
    FormField,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    ChipModule,
    InplaceModule,
    InputTextModule,
    SliderModule,
  ],
  templateUrl: './compact-form.html',
  styleUrl: './compact-form.css',
})
export class CompactForm implements OnChanges, OnDestroy {
  injector = inject(Injector);

  fields = input.required<CompactFormFields>();
  values = model<CompactFormValues>({});
  expanded = input<boolean>(false);

  // Signal form
  form$!: FieldTree<CompactFormValues>;


  formInjector: DestroyableInjector | undefined;

  saved = output<CompactFormValues>();
  cancelled = output<void>();
  closed = output<void>();

  ngOnChanges({fields}: {fields?: SimpleChange<CompactFormFields|undefined>}): void {
    if (fields) {
      const currentFields = fields.currentValue;
      if (this.formInjector !== undefined) {
        this.formInjector.destroy();
      }
      this.formInjector = Injector.create({
        providers: [],
        parent: this.injector,
      });
      // Signal form
      this.form$ = form(
        this.values,
        (p) => {
          for (const field of currentFields ?? []) {
            switch (field.type) {
              case 'text': {
                const text = p[field.key] as SchemaPath<string>;
                if (field.required) {
                  required(text, {
                    message: `${field.label} is required`,
                  });
                  minLength(text, 1, {
                    message: `${field.label} can't be empty`,
                  });
                }
              }
              break;
              case 'url': {
                const url = p[field.key] as SchemaPath<string>;
                required(url, {
                  message: `${field.label} is required`,
                });
                pattern(url, /^(https?|ftp):\/\/.+$/, {
                  message: `${field.label} must be a valid URL`,
                });
              }
              break;
            }
          }
        },
        { injector: this.formInjector },
      );
    }
  }

  ngOnDestroy(): void {
    if (this.formInjector !== undefined) {
      this.formInjector.destroy();
    }
  }

  booleanField(form: FieldTree<CompactFormValues>, key: string) {
    return form[key] as FieldTree<boolean, string>;
  }
  integerField(form: FieldTree<CompactFormValues>, key: string) {
    return form[key] as FieldTree<number, string>;
  }
  stringField(form: FieldTree<CompactFormValues>, key: string) {
    return form[key] as FieldTree<string, string>;
  }

  save() {
    this.saved.emit(this.values());
  }
  cancel() {
    this.cancelled.emit();
  }
  close() {
    this.closed.emit();
  }
}
