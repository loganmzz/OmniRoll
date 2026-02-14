import {
  Component,
  input,
  model,
  signal,
} from '@angular/core';
import {
  FormField,
  form,
} from '@angular/forms/signals';

export type CompactFormValue = number;
export type CompactFormValues = Record<string, CompactFormValue>;
export type CompactFormFields = CompactFormField[];
export type CompactFormField = CompactFormFieldInteger;
export interface CompactFormFieldInteger {
  key: string;
  type: 'integer';
  label: string;
  min: number;
  max: number;
}

@Component({
  selector: 'app-compact-form',
  imports: [
    FormField,
  ],
  templateUrl: './compact-form.html',
  styleUrl: './compact-form.css',
})
export class CompactForm {
  fields = input.required<CompactFormFields>();
  values = model<CompactFormValues>({});
  formValues = form(this.values);
  compact = signal(true);

  expand() {
    this.compact.set(false);
  }
  collapse() {
    this.compact.set(true);
  }
}
