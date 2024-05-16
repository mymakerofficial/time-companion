# Database

## Database Connection

### Creating an Adapter Instance

```ts
const database = createDatabase(indexedDBAdapter())
// or
const database = createDatabase(pgliteDBAdapter())
```

## Tables

You can define a table schema using `defineTable` and use the resulting value to access the table, build where clauses and other things.

```ts
const usersTable = defineTable<UserEntityDto>('users', {
  id: string().primaryKey(),
  name: string().indexed().unique(),
  age: number(),
  favouriteColor: string().nullable(),
})
```

Note: Passing a generic type to `defineTable` is optional and if not given the row type will automatically be infered.
```ts
const petsTable = defineTable('pets', {
  id: string().primaryKey(),
  name: string().indexed().unique(),
  age: number(),
  favouriteFood: string().nullable(),
})

assertTypeOf(petsTable).toBe<TableSchema<{
  id: string
  name: string
  age: number
  favouriteFood: string | null
}>>()
```

## CRUD

### Table Operations

A table can be accessed using the `table` method on the database or any transaction
by either passing the table schema or the table name.

```ts
// passing the table schema will infer all types
database.table(usersTable)
// note: the generic type is optional and only for IDE autocompletion
database.table<UserEntityDto>('users')
```

### Transactions

All operations on the database are done inside a transaction.

```ts
await database.withTransaction(async (transaction) => {
  // we can insert data into a table
  const res = await transaction.table(usersTable).insert({
    data: {
      id: uuid(),
      name: 'John Doe',
    }
  })
  
  // we can execute multiple operations in a single transaction
  await transaction.table(usersTable).update({
    data: {
      name: 'Jane Doe',
    }
    where: usersTable.id.equals(res.id)
  })
})
```
```ts
// transactions can return any value
const res = await database.withTransaction(async (transaction) => {
  return await transaction.table(usersTable).findMany({
    where: usersTable.name.contains('Doe'),
  })
})

assertTypeOf(res).toBe<UserEntityDto[]>()
```

### Odering and Limiting

You can order, limit and offset the results of a query.
**It is currently only possible to order by an indexed field.**

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
    usersTable.age.gte(18)
      .and(usersTable.age.lte(30))
  )
  .and(
    usersTable.favouriteColor.equals('red')
      .or(usersTable.favouriteColor.equals('blue'))
  )
```

### Create

#### insert
Inserts the given row and inserts the inserted value.
```ts
table.insert({
  data: { /* ... */ }
})
```

####
Inserts many rows and returns the inserted values.
```ts
table.insertMany({
  data: [{ /* ... */ }, { /* ... */ }]
})
```

### Read

#### findMany
Returns all rows that match the `where` clause or all if no `where` is given.
The result can be ordered using the `orderBy` property. The result will be ordered arbitrarily when no `orderBy` is given.
```ts
table.findMany({
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
table.find({
  where?: tableSchema.column.equals('value'),
  orderBy?: tableSchema.column.direction('asc' | 'desc'),
  offset?: 10,
})
```

### Update

#### updates
Patches all rows that match the `where` clause with the given values. Not all values are required.
Returns the updated values.
```ts
table.update({
  data: { /* ... */ },
  where?: tableSchema.column.equals('value'),
})
```

### Delete

#### delete
Deletes all rows that match the `where` clause or deletes all `when` no where is given.
```ts
table.delete({
  where?: tableSchema.column.equals('value'),
})
```

#### deleteAll
deleteAll truncates a table when using Postgres or deletes every row one by one when using IndexedDB.
```ts
table.deleteAll()
```

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
