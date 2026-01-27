/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createForm,
  type CreateFormOptions,
  type Form,
  type FormErrors,
  FormEvent,
  type Path,
  type PathValue,
} from 'flemme';
import { computed, MaybeRefOrGetter, readonly, Ref, ref, toValue, watchEffect } from 'vue';

type Options<T, Output> = {
  initialValues?: MaybeRefOrGetter<T | undefined>;
  submit: MaybeRefOrGetter<CreateFormOptions<T, Output>['submit']>;
  validationTriggers?: MaybeRefOrGetter<CreateFormOptions<T, Output>['validationTriggers']>;
}
export type UseForm<T, Output> = (options: Options<T, Output>) => {
  readonly values: Readonly<Ref<T>>
  readonly errors: Readonly<Ref<FormErrors<T>>>
  readonly submit: Form<T>['submit'];
  readonly validate: Form<T>['validate'];
  readonly reset: Form<T>['reset'];
}

export type UseField<T> = <P extends Path<T>>(path: MaybeRefOrGetter<P>) => FieldState<T, P>

type FormDefaults<T, Output> = {
  defaultInitialValues: T;
  validationTriggers: CreateFormOptions<T, Output>['validationTriggers'];
  schema: CreateFormOptions<T, Output>['schema'];
}

const createVueForm = <T, Output>(
  defaults: FormDefaults<T, Output>,
): [UseForm<T, Output>, UseField<T>] => {
  let form: Ref<Form<T>>
  const useForm: UseForm<T, Output> = (options) => {
    form = computed(() => createForm({
      initialValues: toValue(options.initialValues) ?? defaults.defaultInitialValues,
      schema: defaults.schema,
      validationTriggers: toValue(options.validationTriggers) ?? defaults.validationTriggers,
      submit: toValue(options.submit),
    }))
    return {
      get values() {
        return useFormValues(form);
      },
      get errors() {
        return useFormErrors(form)
      },
      validate: () => form.value.validate(),
      reset: (initialValues) => form.value.reset(initialValues),
      submit: () => form.value.submit(),
    }
  }

  const useField: UseField<T> = (path) => {
    if (!form) throw new Error('you must call `useXxForm` before `useXxField` (see …)')
    return useFormField(form, path)
  }

  return [useForm, useField]
}

export { createVueForm as createForm };

const useFormErrors: <T>(form: Ref<Form<T>>) => Ref<FormErrors<T>> =
  makeComposable(['validated'], (form) => form.errors)
const useFormValues: <T>(form: Ref<Form<T>>) => Ref<Readonly<T>> =
  makeComposable(['change'], (form) => form.values)

type UseTouched = <T, P extends Path<T>>(form: Ref<Form<T>>, path?: MaybeRefOrGetter<P>) => Readonly<Ref<boolean>>
const useTouched: UseTouched = makeComposable(['focus', 'reset', 'validated'], (form, path) =>
  form.isTouchedAt(path as never),
) as any

type UseDirty = <T, P extends Path<T>>(form: Ref<Form<T>>, path?: MaybeRefOrGetter<P>) => Readonly<Ref<boolean>>
const useDirty: UseDirty = makeComposable(['change', 'reset'], (form, path) =>
  path ? form.isDirty : form.isDirtyAt(path as never),
) as any

type UseValue = <T, P extends Path<T>>(form: Ref<Form<T>>, path: MaybeRefOrGetter<P>) => Ref<PathValue<T, P>>
const useValue: UseValue = makeComposable(['change', 'reset'], (form, path) => form.get(path as never)) as any

type UseInitial = <T, P extends Path<T>>(form: Ref<Form<T>>, path: MaybeRefOrGetter<P>) => Readonly<Ref<PathValue<T, P>>>
const useInitial: UseInitial = makeComposable(['change', 'reset'], (form, path) => form.getInitial(path as never)) as any

type FieldState<T, P extends Path<T>> = ReturnType<typeof useFormField<T, P>>
const useFormField = <T, P extends Path<T>>(form: Ref<Form<T>>, path: MaybeRefOrGetter<P>) => {
  return {
    path: computed(() => toValue(path)),
    get value(): Ref<PathValue<T, P>> {
      const value = useValue(form, path);
      return computed({
        get: () => value.value,
        set: (newValue) => form.value.set(toValue(path), newValue),
      })
    },
    get initial(): Ref<PathValue<T, P>> {
      return useInitial(form, path)
    },
    get errors(): Ref<FormErrors<T>> {
      const errors = useFormErrors(form)
      return computed(() => errors.value?.filter((error) => error.path === toValue(path)))
    },
    get isDirty(): Ref<boolean> {
      return useDirty(form, path)
    },
    get isTouched(): Ref<boolean> {
      watchEffect((onCleanup) => {
        const thePath = toValue(path)
        console.debug('run effect for', thePath);
        const unsubscribe = form.value.on('validated', () => {
          console.debug('checking touched for', thePath)
          form.value.focus(thePath)
          form.value.blur(thePath)
        })
        onCleanup(unsubscribe)
      })
      return useTouched(form, path)
    },
    blur: () => form.value.blur(toValue(path)),
    focus: () => form.value.focus(toValue(path)),
  }
}

function makeComposable<U>(events: FormEvent[], getter: (form: Form<any>, path?: string) => U) {
  return (form: Ref<Form<any>>, path?: MaybeRefOrGetter<string>): Ref<any> => {
    const state = ref(getter(form.value, toValue(path)))

    watchEffect(() => {
      const listener = () => {
        state.value = getter(form.value, toValue(path))
      }
      const subscribers = events.map((event) => {
        const p = toValue(path)
        return p ? form.value.on(event as any, p as never, listener) : form.value.on(event as any, listener)
      })
      return () => {
        subscribers.forEach((unsubscribe) => unsubscribe())
      }
    })

    return readonly(state)
  }
}
