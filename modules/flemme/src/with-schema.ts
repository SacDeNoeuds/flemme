import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { Validate } from './make-form'

/**
 * Utility to create a validation function based on a standard-schema spec.
 * The returned validator will call `schema.validate` and return an
 * object of errors if validation fails, otherwise undefined.
 */
export function withSchema<T>(schema: StandardSchemaV1<T, any>): Validate<StandardSchemaV1.Issue[], T> {
  return (value) => {
    const result = schema['~standard'].validate(value)
    if (result instanceof Promise) throw new Error('async validation is not supported')
    return result.issues && [...result.issues]
  }
}
