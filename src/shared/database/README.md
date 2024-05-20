# Database

## Database Connection

### Creating an Adapter Instance

```ts
const database = createDatabase(indexedDBAdapter('database-name'), config)
// or
const database = createDatabase(pgliteDBAdapter('memory://database-name'), config)
```
see [pglite documentation](https://github.com/electric-sql/pglite?tab=readme-ov-file#datadir) for more information on the `dataDir` string.

### Config

To create a database instance you need to pass a config object.
You can just pass the config object directly or in a separate file.

The config object has the following properties:

#### schema
An object with table names as keys and [table schemas](#table-schema) as values.

#### migrations
An array of either dynamic imports or the [migration](#migrations) functions themselves.

It is recommended to use dynamic imports to make sure the migrations are only loaded when needed.

```ts
// database.config.ts

export default defineConfig({
  schema: {
    users: usersTable,
    pets: petsTable,
  },
  migrations: [
    () => import('./migrations/001-create-users-table'),
    () => import('./migrations/002-create-pets-table'),
  ],
})
```

## Table Schema

You can define a table schema using `defineTable` and use the resulting value to [access the table](#table-operations), 
[build where clauses](#filtering) and [ordering](#odering-and-limiting) the result.
**Note: The table schema will not be used to create the table in the database, see [Migrations](#migrations) for that.**
```ts
export const usersTable = defineTable<UserEntityDto>('users', {
  id: uuid().primaryKey(),
  name: string().indexed().unique(),
  age: integer(),
  favouriteColor: string().nullable(),
})
```

Passing a generic type to `defineTable` is optional and if not given the row type will automatically be infered.
```ts
const petsTable = defineTable('pets', {
  id: uuid().primaryKey(),
  name: string().indexed().unique(),
  age: integer(),
  favouriteFood: string().nullable(),
})

expectTypeOf(petsTable).toBe<TableSchema<{
  id: string
  name: string
  age: number
  favouriteFood: string | null
}>>()
```

### Column Types

| Method  | JS Type | PostgreSQL Type  | Notes                  |
|---------|---------|------------------|------------------------|
| string  | string  | text             |                        |
| number  | number  | double precision | shorthand for `double` |
| boolean | boolean | boolean          |                        |
| uuid    | string  | uuid             |                        |
| double  | number  | double precision |                        |
| integer | number  | integer          |                        |
| json    | object  | json             |                        |

## Table Operations

A table can be accessed using the `table` method on the database or any [transaction](#transactions)
by either passing the [table schema](#table-schema) or the table name.

```ts
// passing the table schema will infer all types
database.table(usersTable)
// note: the generic type is optional and only for IDE autocompletion
database.table<UserEntityDto>('users')
```

### Create

#### insert
Inserts the given row and inserts the inserted value.
```ts
database.table(tableSchema).insert({
  data: { /* ... */ }
})
```

#### insertMany
Inserts many rows and returns the inserted values.
```ts
database.table(tableSchema).insertMany({
  data: [{ /* ... */ }, { /* ... */ }]
})
```

### Read

#### findMany
Returns all rows that match the [where](#filtering) clause or all if no `where` is given.
The result can be ordered using the [orderBy](#odering-and-limiting) property. The result will be ordered arbitrarily when no `orderBy` is given.
```ts
database.table(tableSchema).findMany({
  where?: tableSchema.column.equals('value'),
  orderBy?: tableSchema.column.direction('asc' | 'desc'),
  offset?: 10,
  limit?: 10,
})
```

#### find
Alias for `findMany` with `limit: 1`.
Returns an `object` or `null` when nothing was found.
```ts
database.table(tableSchema).find({
  where?: tableSchema.column.equals('value'),
  orderBy?: tableSchema.column.direction('asc' | 'desc'),
  offset?: 10,
})
```

### Update

#### updates
Patches all rows that match the [where](#filtering) clause with the given values. Not all values are required.
Returns the updated values.
```ts
database.table(tableSchema).update({
  data: { /* ... */ },
  where?: tableSchema.column.equals('value'),
})
```

### Delete

#### delete
Deletes all rows that match the [where](#filtering) clause or deletes all `when` no where is given.
```ts
database.table(tableSchema).delete({
  where?: tableSchema.column.equals('value'),
})
```

#### deleteAll
deleteAll truncates a table when using Postgres or deletes every row one by one when using IndexedDB.
```ts
database.table(tableSchema).deleteAll()
```

### Odering and Limiting

You can order, limit and offset the results of a query.
**It is currently only possible to order by an indexed column.**

```ts
const res = await database.table(usersTable).findMany({
  // we can order the results
  orderBy: usersTable.name.asc(),
  // we can limit the results
  limit: 10,
  // we can offset the results
  offset: 10,
})
```

### Filtering

You can define complex filters using the `where` property.

```ts
usersTable.name.contains('John')
  .or(usersTable.name.contains('Jane'))
  .and(
    usersTable.age.greaterThanOrEquals(18)
      .and(usersTable.age.lessThanOrEquals(30))
  )
  .and(
    usersTable.favouriteColor.equals('red')
      .or(usersTable.favouriteColor.equals('blue'))
  )
```

#### Available filter methods

| Method              | Shorthand | Description            |
|---------------------|-----------|------------------------|
| equals              | eq        | equals                 |
| notEquals           | neq       | not equals             |
| greaterThan         | gt        | greater than           |
| greaterThanOrEquals | gte       | greater than or equals |
| lessThan            | lt        | less than              |
| lessThanOrEquals    | lte       | less than or equals    |
| inArray             | in        | in array               |
| notInArray          | notIn     | not in array           |
| contains            |           | contains               |
| notContains         |           | not contains           |
| isNull              |           | is null                |
| isNotNull           |           | is not null            |

## Joins

Tables can be joined

### Left Join
```ts
database
  .table(personsTable)
  .leftJoin(petsTable, {
    on: personsTable.id.equals(petsTable.ownerId),
  })
  .findFirst({
    where: petsTable.name.equals('Hedwig'),
  })
```
will result in the following SQL statement (when using Postgres)
```sql
select "persons".* from "persons" left join "pets" on "persons"."id" = "pets"."ownerId" where ("pets"."name" = 'Hedwig') limit 1
```

## Transactions

All operations on the database are done inside a transaction
though you don't have to wrap everything in `withTransaction`, instead you can just use the `table` method on the database instance.

```ts
await database.withTransaction(async (transaction) => {
  const res = await transaction.table(usersTable).insert({
    data: {
      id: uuid(),
      name: 'John Doe',
    }
  })
  
  await transaction.table(usersTable).update({
    data: {
      name: 'Jane Doe',
    },
    where: usersTable.id.equals(res.id)
  })
})
```
Transactions can return any value
```ts
const res = await database.withTransaction(async (transaction) => {
  return await transaction.table(usersTable).findMany({
    where: usersTable.name.contains('Doe'),
  })
})

expectTypeOf(res).toBe<UserEntityDto[]>()
```

## Migrations

Migrations are defined in separate files and executed in order.
You can create tables, alter tables, drop tables, etc.

The syntax for `createTable` is identical to `defineTable`.

```ts
// migrations/001-create-users-table.ts

export default defineMigration(async () => {
  await database.createTable('users', {
    id: uuid().primaryKey(),
    name: string().indexed().unique(),
    age: integer(),
    favouriteColor: string().nullable(),
  })
})
```

You can perform any operation inside a migration that you can perform in a transaction.
**Note: You should not use a table schema in a migration, instead use table names and column names as a string.**
```ts
export default defineMigration(async () => {
  const users = await database.table('users').findMany()
  
  for (const user of users) {
    await database.table('users').update({
      data: {
        name: user.name.toUpperCase(),
      },
      where: c('users', 'id').equals(user.id),
    })
  }
})
```