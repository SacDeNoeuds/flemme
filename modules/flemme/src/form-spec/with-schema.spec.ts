import { StandardSchemaV1 } from '@standard-schema/spec'
import { x } from 'unhoax'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createForm, FormError } from '../form'

type FormValues = {
  test: string
  ok: boolean
  nested: Array<{ of: Array<{ item: number }> }>
}
const zSchema = z.object({
  test: z.string(),
  ok: z.boolean(),
  nested: z.array(z.object({ of: z.array(z.object({ item: z.number().min(5) })) })),
})
const xSchema = x.typed<FormValues>().object({
  test: x.string,
  ok: x.boolean,
  nested: x.array(x.object({ of: x.array(x.object({ item: x.number.min(5) })) })),
})
const schemas: StandardSchemaV1<FormValues, FormValues>[] = [zSchema, xSchema as any]

for (const schema of schemas) {
  describe(`validates form with vendor ${schema['~standard'].vendor}`, () => {
    it('reports form errors upon submit', () => {
      const form = createForm({
        initialValues: { test: 'abc', ok: true, nested: [{ of: [{ item: 1 }] }] },
        submit: async (_) => {},
        schema,
      })
      form.validate()
      const expectedIssue: FormError<typeof form.values> = {
        path: 'nested.0.of.0.item',
        message: expect.any(String),
      }
      expect(form.errors).toMatchObject([expectedIssue])
    })

    it('reports no form error', () => {
      const form = createForm({
        initialValues: { test: '', ok: true, nested: [{ of: [{ item: 1 }] }] },
        submit: async (_) => {},
        schema,
      })
      form.validate()
      expect(form.errors).toHaveLength(1)
      form.set('nested.0.of.0.item', 6)
      form.validate()
      expect(form.errors).toBe(undefined)
    })
  })
}
