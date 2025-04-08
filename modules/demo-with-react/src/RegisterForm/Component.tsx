/* eslint-disable @typescript-eslint/no-explicit-any */
import { addItem, removeItem, type Form } from 'flemme'
import { UseField, useValue, useVisited } from 'flemme-react'
import { ComponentProps, FC, FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Paths } from 'type-fest'
import { createRegistrationForm, type FormValues, type ValidationError } from './form'

type Props = {
  initialValues?: FormValues
  onRegister: (values: FormValues) => Promise<void>
}
enum SubmitState {
  NotAsked = 'NotAsked',
  Pending = 'Pending',
  Failure = 'Failure',
  Success = 'Success',
}
export const RegisterForm: FC<Props> = ({ initialValues, onRegister }) => {
  const [submitState, setSubmitState] = useState(SubmitState.NotAsked)

  const register = useCallback(
    (values: FormValues) => {
      setSubmitState(SubmitState.Pending)
      return onRegister(values)
        .then(() => setSubmitState(SubmitState.Success))
        .catch(() => setSubmitState(SubmitState.Failure))
    },
    [onRegister],
  )

  const form = useMemo(() => createRegistrationForm({ initialValues, submit: register }), [initialValues])

  const [errors, setErrors] = useState(form.errors)
  useEffect(() => {
    const off = form.on('validated', ({ errors }) => setErrors(errors))
    return off
  }, [form])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    console.info('form errors', errors)
    form.submit()
  }

  return (
    <>
      <form onSubmit={submit} className="form">
        <label>
          Submission state: {submitState}
          <br />
          Form validity: {errors ? 'Invalid' : 'Valid'}
        </label>

        {submitState === SubmitState.Pending && <div className="dimmer" />}

        <label>
          {'Name'}
          <TextInput form={form} path={'username'} />
          <small className="feedback-info">Between 4 and 233 characters</small>
          <Errors form={form} path={'username'} errors={errors ?? []} />
        </label>

        <label>
          {'Password'}
          <UseField form={form} path={'password'} watch={['value']}>
            {({ path, value, change, focus, blur }) => (
              <input
                type="password"
                name={path}
                value={value ?? ''}
                onChange={(event) => {
                  change((event.target.value as any) || undefined)
                }}
                onFocus={focus}
                onBlur={blur}
              />
            )}
          </UseField>
          <small className="feedback-info">Between 4 and 233 characters</small>
          <Errors form={form} path={'password'} errors={errors ?? []} />
        </label>

        <label>
          {'Confirm password'}
          <TextInput type="password" form={form} path={'confirmation'} />
          <small className="feedback-info">Between 4 and 233 characters</small>
          <Errors form={form} path={'confirmation'} errors={errors ?? []} />
        </label>

        <UseField form={form} path={'requirements'}>
          {({ path, value, change }) => (
            <fieldset>
              <legend>
                {'Requirements '}
                <button type="button" onClick={() => change(addItem(value ?? [], '') as string[])}>
                  {'+'}
                </button>
              </legend>
              {value?.map((_, index) => (
                <label key={index}>
                  {`#${index + 1} `}
                  <div style={{ display: 'flex' }}>
                    <TextInput form={form} path={`${path}.${index}`} />
                    &nbsp;
                    <button style={{ flex: 1 }} type="button" onClick={() => change(removeItem(value, index))}>
                      {'×'}
                    </button>
                  </div>
                  <small className="feedback-info">Between 3 and 20 characters</small>
                  <Errors form={form} path={`${path}.${index}`} errors={errors ?? []} />
                </label>
              ))}
            </fieldset>
          )}
        </UseField>

        <div style={{ textAlign: 'center' }}>
          <button type="submit">{'Submit'}</button>
        </div>
      </form>
      <h4>Last successful submitted result:</h4>
      <pre>
        <code>{submitState === SubmitState.Success && JSON.stringify(form.values, null, 2)}</code>
      </pre>
    </>
  )
}

type ErrorsProps = {
  form: Form<FormValues>
  path: Paths<FormValues>
  errors: ValidationError[]
}
const Errors: FC<ErrorsProps> = ({ form, path, errors }) => {
  const filtered = useMemo(() => errors.filter((error) => error.path === path), [errors, path])
  const visited = useVisited(form, path)

  // if (path === 'confirmation') console.info({ errors, modified, visited })
  if (filtered.length === 0 || !!visited) return null

  return <small className="feedback-error">Errors: {filtered.map((error) => `"${error.message}"`).join(', ')}</small>
}

type TextInputProps<T, P extends Paths<T>> = Omit<ComponentProps<'input'>, 'form' | 'value' | 'onChange'> & {
  type?: ComponentProps<'input'>['type']
  form: Form<T>
  path: P
}
const TextInput = <T, P extends Paths<T> & string>({ type = 'text', form, path, ...props }: TextInputProps<T, P>) => {
  const value: any = useValue(form, path)
  return (
    <input
      {...props}
      type={type}
      value={value ?? ''}
      onChange={(event) => {
        form.set(path, (event.target.value as any) || undefined)
        console.info('change', { path, value: (event.target.value as any) || undefined, form: form.values })
      }}
      onFocus={() => form.focus(path)}
      onBlur={() => form.blur(path)}
    />
  )
}
