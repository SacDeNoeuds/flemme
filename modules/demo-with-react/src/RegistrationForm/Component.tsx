import type { FlemmePaths } from 'flemme'
import { FormEvent, useState } from 'react'
import { type FormParsedValues, type FormValues, useRegistrationForm, useRegistrationFormField } from './form'

enum SubmitState {
  NotAsked = 'NotAsked',
  Pending = 'Pending',
  Failure = 'Failure',
  Success = 'Success',
}

const defaultInitialValues: FormValues = {
  username: '',
  password: '',
  confirmation: '',
}

type Props = {
  initialValues?: FormValues
  onRegister: (values: FormParsedValues) => Promise<unknown>
}
export const RegistrationForm = (props: Props) => {
  const [submitState, setSubmitState] = useState(SubmitState.NotAsked)
  const [submittedValues, setSubmittedValues] = useState<FormValues | undefined>(undefined)

  const { form, errors } = useRegistrationForm({
    initialValues: props.initialValues ?? defaultInitialValues,
    submit: props.onRegister,
  })
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitState(SubmitState.Pending)
    form
      .submit()
      .then(() => setSubmitState(SubmitState.Success))
      .catch(() => setSubmitState(SubmitState.Failure))
    console.info('form errors', form.errors)
    // setErrors(form.errors)
    setSubmittedValues({ ...form.values })
  }

  return (
    <form className="form" onSubmit={submit}>
      <label>
        Submission state: {submitState}
        <br />
        {/* Form validity: {errors ? 'Invalid' : 'Valid'} */}
      </label>

      {submitState === SubmitState.Pending && <div className="dimmer" />}
      <UsernameField />
      <PasswordField path="password" label="Password" />
      <PasswordField path="confirmation" label="Confirm password" />

      <small className="feedback-error">
        {errors?.map((error) => {
          if (error.path) return null
          return error.message
        })}
      </small>

      <hr />

      <div style={{ textAlign: 'center' }}>
        <button type="submit">{'Submit'}</button>
      </div>

      <h4>Last successful submitted result:</h4>
      <pre>
        <code>{submitState === SubmitState.Success && JSON.stringify(submittedValues, null, 2)}</code>
      </pre>
    </form>
  )
}

type ErrorsProps = {
  path: FlemmePaths<FormValues>
}
const Errors = ({ path }: ErrorsProps) => {
  const { errors = [], isTouched } = useRegistrationFormField(path)

  if (errors.length === 0 || !isTouched) return null

  return <small className="feedback-error">Errors: {errors.map((error) => `"${error.message}"`).join(', ')}</small>
}

const UsernameField = () => {
  const { value, change, focus, blur, path } = useRegistrationFormField('username')
  return (
    <label>
      Username
      <input
        type="text"
        id={path}
        name={path}
        value={value}
        onChange={(event) => change(event.target.value)}
        onFocus={focus}
        onBlur={blur}
      />
      <Errors path={path} />
    </label>
  )
}

type PasswordFieldProps = {
  path: 'password' | 'confirmation'
  label: string
}
const PasswordField = (props: PasswordFieldProps) => {
  const { path, value, change, focus, blur } = useRegistrationFormField(props.path)
  return (
    <div className="v-stacker">
      <label htmlFor={path}>{props.label}</label>
      <input
        type="password"
        id={path}
        name={path}
        value={value}
        onChange={(event) => change(event.target.value)}
        onFocus={focus}
        onBlur={blur}
      />
      <Errors path={path} />
    </div>
  )
}
