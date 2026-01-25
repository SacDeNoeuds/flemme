/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Form, type FormEvent, type FlemmeGet as Get, type FlemmePaths as Paths } from 'flemme'
import { Component, type ReactNode } from 'react'

export type FieldState<FormValues, Path extends Paths<FormValues>> = {
  path: Path
  value: Get<FormValues, Path & string>
  initial: Get<FormValues, Path & string>
  isDirty: boolean
  isTouched: boolean
  change: (value: Get<FormValues, Path & string> | undefined) => void
  blur: () => void
  focus: () => void
  reset: (nextInitial?: Get<FormValues, Path & string>) => void
}
export type Watchable = Exclude<keyof FieldState<any, never>, 'path' | 'change' | 'blur' | 'focus' | 'reset'> | 'errors'
const formEventsByWatchable: Record<Watchable, Exclude<FormEvent, 'submit' | 'submitted'>[]> = {
  initial: ['reset'],
  value: ['change', 'reset'],
  isDirty: ['change', 'reset'],
  isTouched: ['focus', 'reset'],
  errors: ['validated'],
}
const formEvents: Exclude<FormEvent, 'submit' | 'submitted'>[] = ['reset', 'validated', 'change', 'blur', 'focus']

type Props<FormValues, Path extends Paths<FormValues>> = {
  form: Form<FormValues>
  path: Path
  watch?: Watchable[]
  children: (state: FieldState<FormValues, Path>) => ReactNode
}

export class UseField<FormValues, Path extends Paths<FormValues>, ValidationErrors> extends Component<
  Props<FormValues, Path>,
  FieldState<FormValues, Path>
> {
  private watchers = this.props.watch
    ? [...new Set(this.props.watch.flatMap((watcher) => formEventsByWatchable[watcher]))]
    : formEvents
  private subscribers: Array<() => void> = [] // unsubscribe functions.
  state = this.getFieldState()

  private getFieldState(): FieldState<FormValues, Path> {
    const { form, path } = this.props
    return {
      path,
      value: form.get(path),
      initial: form.getInitial(path),
      isDirty: form.isDirtyAt(path),
      isTouched: form.isTouchedAt(path),
      change: (value) => form.set(path, value),
      blur: () => form.blur(path),
      focus: () => form.focus(path),
      reset: (nextInitial?: any) => form.resetAt(path, nextInitial),
    }
  }

  private setFieldState = (): void => {
    this.setState(this.getFieldState())
  }

  componentDidMount() {
    const { form, path } = this.props
    this.subscribers = this.watchers.map((formEvent) => form.on(formEvent as any, path, this.setFieldState))
  }

  componentWillUnmount() {
    this.subscribers.forEach((unsubscribe) => unsubscribe())
  }

  render() {
    return this.props.children(this.state)
  }
}
