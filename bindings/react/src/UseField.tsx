/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Get, PartialDeep } from 'type-fest'
import { type Form, type FormEvent } from 'flemme'
import { Component, type ReactNode } from 'react'

export type FieldState<FormValues, Path extends string> = {
  path: Path
  value: PartialDeep<Get<FormValues, Path>>
  initial: PartialDeep<Get<FormValues, Path>>
  isDirty: boolean
  isModified: boolean
  isVisited: boolean
  isActive: boolean
  change: (value: PartialDeep<Get<FormValues, Path>> | undefined) => void
  blur: () => void
  focus: () => void
  reset: (nextInitial?: PartialDeep<Get<FormValues, Path>>) => void
}
export type Watchable = Exclude<keyof FieldState<any, any>, 'path' | 'change' | 'blur' | 'focus' | 'reset'> | 'errors'
const formEventsByWatchable: Record<Watchable, FormEvent[]> = {
  initial: ['reset'],
  value: ['change', 'reset'],
  isActive: ['focus', 'blur'],
  isDirty: ['change', 'reset'],
  isModified: ['change', 'reset'],
  isVisited: ['focus', 'reset'],
  errors: ['validated'],
}
const formEvents: FormEvent[] = ['reset', 'validated', 'change', 'blur', 'focus']

type Props<FormValues, Path extends string, ValidationErrors> = {
  form: Form<FormValues, ValidationErrors>
  path: Path
  watch?: Watchable[]
  children: (state: FieldState<FormValues, Path>) => ReactNode
}

export class UseField<FormValues, Path extends string, ValidationErrors> extends Component<Props<FormValues, Path, ValidationErrors>, FieldState<FormValues, Path>> {
  private watchers = this.props.watch ? [...new Set(this.props.watch.flatMap((watcher) => formEventsByWatchable[watcher]))] : formEvents
  state = this.getFieldState()

  private getFieldState(): FieldState<FormValues, Path> {
    const { form, path } = this.props
    return {
      path,
      value: form.value(path),
      initial: form.initial(path),
      isDirty: form.isDirty(path),
      isModified: form.isModified(path),
      isVisited: form.isVisited(path),
      isActive: form.isActive(path),
      change: (value) => form.change(path, value),
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
    this.watchers.forEach((formEvent) => form.on(path, formEvent, this.setFieldState))
  }

  componentWillUnmount() {
    const { form } = this.props
    this.watchers.forEach((formEvent) => form.off(formEvent, this.setFieldState))
  }

  render() {
    return this.props.children(this.state)
  }
}
