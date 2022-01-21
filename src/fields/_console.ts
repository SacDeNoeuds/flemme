/* eslint-disable @typescript-eslint/no-explicit-any */
let _canLog = false
export const log = (...args: any[]) => _canLog && console.info(...args)
export const canLog = (value: boolean) => {
  _canLog = value
}
