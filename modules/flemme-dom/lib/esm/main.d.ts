import type { Form } from 'flemme'
import { Paths } from 'type-fest'
export declare function registerTextInput<T>(
  input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  form: Form<T>,
  path: Paths<T>,
): void
export declare function registerCheckbox<T>(input: HTMLInputElement, form: Form<T>, path: Paths<T>): void
