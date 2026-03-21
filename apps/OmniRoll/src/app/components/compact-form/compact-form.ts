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
  signal,
} from '@angular/core';
import {
  FieldTree,
  FormField,
  SchemaPath,
  form,
  minLength,
  pattern,
  required,
} from '@angular/forms/signals';

export type CompactFormValue = number|string;
export type CompactFormValues = Record<string, CompactFormValue>;
export type CompactFormFields = CompactFormField[];
export type CompactFormField = CompactFormFieldRange|CompactFormFieldText|CompactFormFieldUrl;
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

@Component({
  selector: 'app-compact-form',
  imports: [
    FormField,
  ],
  templateUrl: './compact-form.html',
  styleUrl: './compact-form.css',
})
export class CompactForm implements OnChanges, OnDestroy {
  injector = inject(Injector);
  fields = input.required<CompactFormFields>();
  expanded = input<boolean>(false);

  values = model<CompactFormValues>({});
  form$!: FieldTree<CompactFormValues>;
  formInjector: DestroyableInjector | undefined;

  compact = signal(true);

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

  stringField(form: FieldTree<CompactFormValues>, key: string) {
    return form[key] as FieldTree<string, string>;
  }
  integerField(form: FieldTree<CompactFormValues>, key: string) {
    return form[key] as FieldTree<number, number>;
  }

  expand() {
    this.compact.set(false);
  }
  collapse() {
    this.compact.set(true);
  }

  save() {
    this.saved.emit(this.values());
  }
  cancel() {
    this.cancelled.emit();
  }
  close() {
    this.closed.emit();
    this.collapse();
  }
}
