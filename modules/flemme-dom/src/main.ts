import type { Form, FlemmeGet as Get, FlemmePaths as Paths } from 'flemme'

export function registerInput<
  T,
  Path extends Paths<T>,
  Input extends HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
>(options: { input: Input; form: Form<T>; path: Path; mapValue: (input: Input) => Get<T, Path & string> }) {
  const { form, input, mapValue, path } = options
  input.name = String(path)
  input.addEventListener('input', () => form.set(path, mapValue(input)))
  input.addEventListener('focus', () => form.focus(path))
  input.addEventListener('blur', () => form.blur(path))
}
