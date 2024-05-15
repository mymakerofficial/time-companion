# Database

## Database Connection

### Creating an Adapter Instance

```ts
const database = createDatabase(indexedDBAdapter())
// or
const database = createDatabase(inMemoryDBAdapter())
```

### Opening a Database

**wip**

```ts
await database.open('my-database', 1, async (transaction, newVersion) => {
  // lets ignore migrations for now...
  
  // the code inside this callback will be called when the database is out of date
  //  or when the database is created for the first time.
  // the transaction we get here is called a versionchange transaction and is unique to this callback
})
```

## Tables

**wip**

```ts
// define a table schema
const usersTable = defineTable<UserEntityDto>('users', {
  id: string().primaryKey(),
  name: string(),
  age: number(),
  favouriteColor: string().nullable(),
})

await database.open('my-database', 1, async (transaction, newVersion) => {
  // we can create a table
  //  this can only be done inside a versionchange transaction
  await transaction.createTable(usersTable)
  
  // we can create an index on a table
  //  this can only be done inside a versionchange transaction
  await transaction.table(usersTable).createIndex({
    keyPath: 'name',
    unique: true,
  })
  
  // we can perform any other operation on the database just like a normal transaction
})
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
  await transaction.table(usersTable).insert({
    data: {
      id: uuid(),
      name: 'John Doe',
    }
  })
  
  // we can execute multiple operations in a single transaction
  await transaction.table(usersTable).insert({
    data: {
      id: uuid(),
      name: 'Jane Doe',
    }
  })
})

// transactions can return any value
const res = await database.withTransaction(async (transaction) => {
  return await transaction.table(usersTable).findMany({
    // we can use where to filter the results
    where: usersTable.name.contains('Doe'),
  })
})
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

```ts
table.insert({
  data: { /* ... */ }
})
```
```ts
table.insertMany({
  data: [{ /* ... */ }, { /* ... */ }]
})
```

### Read

```ts
table.find({
  where: tableSchema.column.equals('value'),
  orderBy: tableSchema.column.direction('asc' | 'desc'),
  offset: 10,
})
```
```ts
table.findMany({
  where: tableSchema.column.equals('value'),
  orderBy: tableSchema.column.direction('asc' | 'desc'),
  offset: 10,
  limit: 10,
})
```

### Update

```ts
table.update({
  data: { /* ... */ },
  where: tableSchema.column.equals('value'),
  orderBy: tableSchema.column.direction('asc' | 'desc'),
  offset: 10,
})
```
```ts
table.updateMany({
  data: { /* ... */ },
  where: tableSchema.column.equals('value'),
  orderBy: tableSchema.column.direction('asc' | 'desc'),
  offset: 10,
  limit: 10,
})
```

### Delete

```ts
table.delete({
  where: tableSchema.column.equals('value'),
  orderBy: tableSchema.column.direction('asc' | 'desc'),
  offset: 10,
})
```
```ts
table.deleteMany({
  where: tableSchema.column.equals('value'),
  orderBy: tableSchema.column.direction('asc' | 'desc'),
  offset: 10,
  limit: 10,
})
```
```ts
// the fastest way to lose all your data
table.deleteAll()
```