/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-unresolved */
import { ComponentProps, FC, FormEvent, useMemo, useState } from 'react'
import { type Form } from 'flemme'
// import { useValue, useModified, useVisited, useDirty, useErrors } from '../lib/flemme.react'
import { UseField, UseFieldArray, useDirty, useErrors, useVisited, useModified, useValue } from 'flemme-react'
import { registerForm, register, type FormValues, type ValidationError } from './form'
import { type PartialDeep } from 'type-fest'

type Props = {
  initialValue?: PartialDeep<FormValues>
  onRegister?: typeof register
}
enum SubmitState {
  NotAsked = 'NotAsked',
  Pending = 'Pending',
  Failure = 'Failure',
  Success = 'Success',
}
export const RegisterForm: FC<Props> = ({ initialValue, onRegister = register }) => {
  const form = useMemo(() => registerForm(initialValue), [initialValue])
  const [submitState, setSubmitState] = useState(SubmitState.NotAsked)

  const isFormDirty = useDirty(form)
  const errors = useErrors(form) ?? []

  const submit = (event: FormEvent) => {
    event.preventDefault()
    form.submit((values) => {
      setSubmitState(SubmitState.Pending)
      return onRegister(values)
        .then(() => setSubmitState(SubmitState.Success))
        .catch(() => setSubmitState(SubmitState.Failure))
    })
  }

  return (
    <form onSubmit={submit} className="form">
      <label>
        Submission state: {submitState}
        <br />
        Form validity: {errors.length > 0 ? 'Invalid' : 'Valid'}
      </label>

      <label>Dirty: {JSON.stringify(isFormDirty)}</label>

      {submitState === SubmitState.Pending && <div className="dimmer" />}

      <label>
        {'Name'}
        <TextInput form={form} path={'username'} />
        <Errors form={form} path={'username'} errors={errors} />
      </label>

      <label>
        {'Password'}
        {/* <TextInput type="password" form={form} path={'password'} /> */}
        <UseField form={form} path={'password'} watch={['value']}>
          {({ path, value, change, focus, blur }) => (
            <input
              data-test={console.info({ path, value })}
              type="password"
              value={value ?? ''}
              onChange={(event) => {
                change((event.target.value as any) || undefined)
              }}
              onFocus={focus}
              onBlur={blur}
            />
          )}
        </UseField>
        <Errors form={form} path={'password'} errors={errors} />
      </label>

      <label>
        {'Confirm password'}
        <TextInput type="password" form={form} path={'confirmation'} />
        <Errors form={form} path={'confirmation'} errors={errors} />
      </label>

      <UseFieldArray form={form} path={'requirements'}>
        {({ path, value, add, remove }) => (
          <fieldset>
            <legend>
              {'Requirements '}
              <button type="button" onClick={() => add('')}>
                {'+'}
              </button>
            </legend>
            {value?.map((_, index) => (
              <label key={index}>
                {`#${index + 1} `}
                <div style={{ display: 'flex' }}>
                  <TextInput form={form} path={`${path}.${index}`} />
                  &nbsp;
                  <button style={{ flex: 1 }} type="button" onClick={() => remove(index)}>
                    {'×'}
                  </button>
                </div>
                <Errors form={form} path={`${path}.${index}`} errors={errors} />
              </label>
            ))}
          </fieldset>
        )}
      </UseFieldArray>

      <div style={{ textAlign: 'center' }}>
        <button type="submit">{'Submit'}</button>
      </div>
    </form>
  )
}

type ErrorsProps = {
  form: Form<FormValues>
  path: string
  errors: ValidationError[]
}
const Errors: FC<ErrorsProps> = ({ form, path, errors }) => {
  const filtered = useMemo(() => errors.filter((error) => error.path === path), [errors, path])
  const modified = useModified(form, path)
  const visited = useVisited(form, path)

  // if (path === 'confirmation') console.info({ errors, modified, visited })
  if (filtered.length === 0 || (!modified && !visited)) return null

  return <small className="feedback-error">Errors: {filtered.map((error) => `"${error.code}"`).join(', ')}</small>
}

type TextInputProps<T, P extends string> = Omit<ComponentProps<'input'>, 'form' | 'value' | 'onChange'> & {
  type?: ComponentProps<'input'>['type']
  form: Form<T>
  path: P
}
const TextInput = <T, P extends string>({ type = 'text', form, path, ...props }: TextInputProps<T, P>) => {
  const value: any = useValue(form, path)
  return (
    <input
      {...props}
      type={type}
      value={value ?? ''}
      onChange={(event) => {
        form.change(path, (event.target.value as any) || undefined)
        console.info('change', { path, value: (event.target.value as any) || undefined, form: form.value() })
      }}
      onFocus={() => form.focus(path)}
      onBlur={() => form.blur(path)}
    />
  )
}
