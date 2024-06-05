import { entriesOf, objectFromEntries } from '@shared/lib/utils/object'
import { z } from 'zod'
import { isDefined } from '@shared/lib/utils/checks'

/***
 * Get the default values of a zod schema
 * @see https://github.com/colinhacks/zod/discussions/1953#discussioncomment-4811588
 */
export function getSchemaDefaults<Schema extends z.AnyZodObject>(
  schema: Schema,
): z.infer<Schema> {
  return objectFromEntries(
    entriesOf(schema.shape).map(([key, value]) => {
      if (isDefined(value._def?.defaultValue)) {
        return [key, value._def.defaultValue()]
      }

      return [key, undefined]
    }),
  )
}
