# Database

We use a custom build database interface to reuse the same code for accessing SQL databases like PostgreSQL and IndexedDB in the browser.

Its build to make IndexedDB behave more like a traditional relational database, make migrations work across environments and query building easy.

## Database Connection

### Creating an Adapter Instance

```ts
const database = createDatabase(indexedDBAdapter('database-name'), config)
// or
const database = createDatabase(pgliteDBAdapter('memory://database-name'), config)
```
see [pglite documentation](https://github.com/electric-sql/pglite?tab=readme-ov-file#datadir) for more information on the `dataDir` string.

### Opening the Database

Opening the database will create the database if it does not exist and run all required [migrations](#migrations).

```ts
await database.open()
```

### Closing the Database

If you are using an in memory database, all data will be lost when the database is closed.

```ts
await database.close()
```

## Config

To create a database instance you need to pass a config object.
You can just pass the config object directly or in a separate file.

The config object has the following properties:

#### schema
An object with table names as keys and [table schemas](#table-schema) as values.

#### migrations
An array of either dynamic imports (`import()`) or the [migration](#migrations-1) functions themselves.

It is recommended to use dynamic imports to make sure the migrations are only loaded when needed.

```ts
// database.config.ts

export default defineConfig({
  schema: {
    'users': usersTable,
    'pets': petsTable,
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

**Note:** The table schema will not be used to create the table in the database, see [defineTable vs createTable](#definetable-vs-createtable).
```ts
export const usersTable = defineTable<UserEntityDto>('users', {
  id: c.uuid().primaryKey(),
  name: c.string().indexed().unique(),
  age: c.integer(),
  favouriteColor: c.string().nullable(),
})
```

Passing a generic type to `defineTable` is optional and if not given the row type will automatically be infered.
```ts
const petsTable = defineTable('pets', {
  id: c.uuid().primaryKey(),
  name: c.string().indexed().unique(),
  age: c.integer(),
  favouriteFood: c.string().nullable(),
})

expectTypeOf(petsTable).toBe<TableSchema<{
  id: string
  name: string
  age: number
  favouriteFood: string | null
}>>()
```

## Column building

We provide a fluent API to build columns using the `c` object.

The `c` object can be used to define columns in a [table schema](#table-schema)
or to reference columns if you can't use a [table schema](#table-schema) directly (e.g. in a [migration](#migrations-1)).

```ts
const myTableSchema = defineTable('myTable', {
  myColumn: c.string().nullable()
})

myTableSchema.myColumn

// is the same as

const myColumn = c('myColumn').string().nullable()
```
```ts
database.table(myTableSchema).findMany({
  where: myTableSchema.myColumn.equals('value')
})

// is the same as

database.table('myTable').findMany({
  where: c('myColumn').equals('value')
  // you can also use c('myColumn').string().equals('value') to specify the type
})
```
*learn more about how .equals works in the [filtering section](#filtering)*

### Column Types

| Method        | JS Type | PostgreSQL Type  | Notes                |
|---------------|---------|------------------|----------------------|
| `c.string()`  | string  | text             |                      |
| `c.number()`  | number  | double precision | alias for `double()` |
| `c.boolean()` | boolean | boolean          |                      |
| `c.uuid()`    | string  | uuid             |                      |
| `c.double()`  | number  | double precision |                      |
| `c.integer()` | number  | integer          |                      |
| `c.json()`    | object  | json             |                      |

### Column Modifiers

| Method                  | Description                               |
|-------------------------|-------------------------------------------|
| `c.type().primaryKey()` | sets the column as the primary key        |
| `c.type().indexed()`    | creates an index on the column            |
| `c.type().unique()`     | creates a unique constraint on the column |
| `c.type().nullable()`   | allows the column to be null              |

## Table Operations

A table can be accessed using the `table` method on the [database](#creating-an-adapter-instance) or any [transaction](#transactions)
by either passing the [table schema](#table-schema) or the table name.

```ts
// passing the table schema will infer all types
database.table(usersTable)
// note: the generic type is optional and only for IDE autocompletion
database.table<UserEntityDto>('users')
```

### Create

#### insert
Inserts the given row and returns the inserted value.
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
  where: tableSchema.column.equals('value'),
  orderBy: tableSchema.column.direction('asc' | 'desc'),
  offset: 10,
  limit: 10,
})
```

#### find
Alias for `findMany` with `limit: 1`.
Returns an `object` or `null` when nothing was found.
```ts
database.table(tableSchema).find({
  where: tableSchema.column.equals('value'),
  orderBy: tableSchema.column.direction('asc' | 'desc'),
  offset: 10,
})
```

### Update

#### updates
Patches all rows that match the [where](#filtering) clause with the given values. Not all values are required.
Returns the updated values.
```ts
database.table(tableSchema).update({
  data: { /* ... */ },
  where: tableSchema.column.equals('value'),
})
```

### Delete

#### delete
Deletes all rows that match the [where](#filtering) clause or deletes all `when` no where is given.
```ts
database.table(tableSchema).delete({
  where: tableSchema.column.equals('value'),
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

You use a [column definition](#column-building) to specify the column to order by.

```ts
  const res = await database.table(usersTable).findMany({
  orderBy: usersTable.name.asc(),
  limit: 10,
  offset: 10,
})
```


### Filtering

You can define complex filters using a [column definition](#column-building) and the available filter methods.

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

| Method                | Shorthand | Description            |
|-----------------------|-----------|------------------------|
| `equals`              | eq        | equals                 |
| `notEquals`           | neq       | not equals             |
| `greaterThan`         | gt        | greater than           |
| `greaterThanOrEquals` | gte       | greater than or equals |
| `lessThan`            | lt        | less than              |
| `lessThanOrEquals`    | lte       | less than or equals    |
| `inArray`             | in        | in array               |
| `notInArray`          | notIn     | not in array           |
| `contains`            |           | contains               |
| `notContains`         |           | not contains           |
| `isNull`              |           | is null                |
| `isNotNull`           |           | is not null            |

## Transactions

All operations on the database are done inside a transaction
though you don't have to wrap everything in `withTransaction`, instead you can just use the `table` method on the database instance.

You can not perform any schema alterations inside a normal transaction, use [migrations](#migrations-1) for that.

### Transactions auto rollback

If an error is thrown inside a transaction the transaction will be rolled back and the error will be rethrown.

### Transactions auto commit

If no error is thrown inside a transaction the transaction will be committed automatically after the transaction block has finished.

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

All schema alterations are done inside a migration. 
When the database is [opened](#opening-the-database) all new migrations will be executed in the order they are in the [config](#config).
All migrations are executed in a single transaction, 
so if one migration fails the whole database will be [rolled back](#transactions-auto-rollback) to the previous state.

You can [create tables](#create-table), [alter tables](#alter-table), [drop tables](#drop-table) and [rename tables](#rename-table).

**Note:** You should not use a [table schema](#table-schema) to access tables inside a migration
as the schema represents the database state **after** the migrations have been executed.
Instead, use table names as strings and creating [column definitions](#column-building) inline.

**Note:** There is no manual way to run migrations, they are run automatically when the database is opened.

```ts
// migrations/001-create-users-table.ts

export default defineMigration(async (transaction) => {
  await transaction.createTable('users', {
    id: c.uuid().primaryKey(),
    name: c.string().indexed().unique(),
    age: c.integer(),
    favouriteColor: c.string().nullable(),
  })
})
```

You can perform any operation inside a migration that you can perform in a transaction.
```ts
export default defineMigration(async (transaction) => {
  const users = await transaction.table('users').findMany()
  
  for (const user of users) {
    await transaction.table('users').update({
      data: {
        name: user.name.toUpperCase(),
      },
      where: c('id').equals(user.id),
    })
  }
})
```

### Create Table

The `createTable` syntax is **identical** to [defineTable](#table-schema).
To understand the difference see [defineTable vs createTable](#definetable-vs-createtable). 

```ts
export default defineMigration(async (transaction) => {
  await transaction.createTable('users', {
    id: c.uuid().primaryKey(),
    name: c.string().indexed().unique(),
    age: c.integer(),
    favouriteColor: c.string().nullable(),
  })
})
```

### Drop Table

```ts
export default defineMigration(async (transaction) => {
  await transaction.dropTable('users')
})
```

### Alter Table

All table alterations are done inside an `alterTable` block.
You can perform any amount of alterations inside the block.

**You should not execute any other operations inside the `alterTable` block.**

```ts
export default defineMigration(async (transaction) => {
  await transaction.alterTable('table', (table) => {
    // ...
  })
})
```

#### Rename Table

Renames the table.
This alteration will automatically be applied last.

**You should only call `renameTo` once inside an `alterTable` block.**

```ts
export default defineMigration(async (transaction) => {
  await transaction.alterTable('table', (table) => {
    table.renameTo('newTable')
  })
})
```

#### Add Column

Adds a column to the table.
The `addColumn` syntax is similar to defining columns in [defineTable](#table-schema).

```ts
export default defineMigration(async (transaction) => {
  await transaction.alterTable('table', (table) => {
    table.addColumn('newColumn').string().nullable()
    table.addColumn('anotherColumn').integer()
  })
})
```

#### Drop Column

Drops a column from the table.

```ts
export default defineMigration(async (transaction) => {
  await transaction.alterTable('table', (table) => {
    table.dropColumn('oldColumn')
  })
})
```

#### Rename Column

Renames a column on the table.

```ts
export default defineMigration(async (transaction) => {
  await transaction.alterTable('table', (table) => {
    table.renameColumn('email', 'emailAddress')
  })
})
```

## `defineTable` vs `createTable`

`defineTable` and `createTable` look the same but have different purposes.

`defineTable` is used to define a [table schema](#table-schema) and is used to [access the table](#table-operations) in the database.
**The table schema represents the database state **after** all migrations have been executed.**

`createTable` is used inside a [migration](#migrations-1) to create a table in the database.

You need to both define the [table schema](#table-schema) **and** [create the table](#create-table) in a [migration](#migrations-1).

## Joins

Joins are not supported. You can use multiple queries to achieve the same result.

```ts
const personsWithPets = await db.withTransaction(async (tx) => {
  const persons = await tx.table(personsTable).findMany()
  
  const personIds = persons.map((person) => person.id)
  
  const pets = await tx.table(petsTable).findMany({
    where: petsTable.ownerId.inArray(personIds),
  })
  
  const petsByOwner: Map<string, PetEntity> = groupBy(pets, 'ownerId')
  
  return persons.map((person) => ({
    ...person,
    pets: petsByOwner.get(person.id) ?? [],
  }))
})
```
