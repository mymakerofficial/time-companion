# Database

## Database Connection

### Creating an Adapter Instance
```ts
const database = createIndexedDBAdapter()
// or
const database = createInMemoryDBAdapter()
```

### Opening a Database
```ts
database.open('my-database', 1, async (transaction) => {
  // lets ignore migrations for now...
  
  // the code inside this callback will be called when the database is out of date
  //  or when the database is created for the first time.
  // the transaction we get here is called a upgrade transaction and is unique to this callback
  

  // we can only create tables inside a upgrade transaction
  const usersTable = await transaction.createTable<UserEntityDto>({
    name: 'users',
    schema: {
      id: 'string',
      name: 'string',
    },
    primaryKey: 'id',
  })

  // we can create indexes on a table
  //  this can only be done with the return value of createTable
  //  inside a upgrade transaction
  await usersTable.createIndex({
    keyPath: 'name',
    unique: true,
  })
    
  // we can use the return value of createTable to execute any crud operation
  await usersTable.insert({
    data: {
      id: uuid(),
      name: 'John Doe',
    }
  })
  
  // we can also use `transaction.table()` like in any other transaction
})
```

## CRUD

### Transactions

All operations on the database are done inside a transaction.

```ts
await database.withTransaction(async (transaction) => {
  // we can insert data into a table
  // note: the generic type is optional and only for ide autocompletion
  await transaction.table<UserEntityDto>('users').insert({
    data: {
      id: uuid(),
      name: 'John Doe',
    }
  })
  
  // we can execute multiple operations in a single transaction
  await transaction.table<UserEntityDto>('users').insert({
    data: {
      id: uuid(),
      name: 'Jane Doe',
    }
  })
})

// transactions can return any value
const res = await database.withTransaction(async (transaction) => {
  return await transaction.table<UserEntityDto>('users').findMany({
    // we can use where to filter the results
    //  it is recommended to use this instead of filtering the result manually
    where: {
      name: { contains: 'Doe' }
    }
  })
})
```

### Odering and Limiting

You can order, limit and offset the results of a query.
**It is currently only possible to order by an indexed field.**

```ts
const res = await database.withTransaction(async (transaction) => {
  return await transaction.table<UserEntityDto>('users').findMany({
    // we can order the results
    orderBy: {
      name: 'asc'
    },
    // we can limit the results
    limit: 10,
    // we can offset the results
    offset: 10,
  })
})
```

### Filtering

You can define complex filters using the `where` property.

```ts
{
  AND: [
    {
      AND: [{ name: { contains: 'John' } }, { name: { contains: 'Doe' } }],
    },
    {
      OR: [
        { favouriteColor: { equals: 'red' } },
        { favouriteColor: { equals: 'blue' } },
      ],
    },
    {
      age: { gte: 18 },
    },
  ]
}
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
  where: { /* ... */ },
  orderBy: { key: 'asc' | 'desc' },
  offset: 10,
})
```
```ts
table.findMany({
  where: { /* ... */ },
  orderBy: { key: 'asc' | 'desc' },
  offset: 10,
  limit: 10,
})
```

### Update

```ts
table.update({
  data: { /* ... */ },
  where: { /* ... */ },
  orderBy: { key: 'asc' | 'desc' },
  offset: 10,
})
```
```ts
table.updateMany({
  data: { /* ... */ },
  where: { /* ... */ },
  orderBy: { key: 'asc' | 'desc' },
  offset: 10,
  limit: 10,
})
```

### Delete

```ts
table.delete({
  where: { /* ... */ },
  orderBy: { key: 'asc' | 'desc' },
  offset: 10,
})
```
```ts
table.deleteMany({
  where: { /* ... */ },
  orderBy: { key: 'asc' | 'desc' },
  offset: 10,
  limit: 10,
})
```
```ts
table.deleteAll()
```