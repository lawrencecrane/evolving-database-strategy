# Evolving Database Strategy

This is design pattern for implementing database changes over time.

In this template

- SQL is used for defining schema, evolutions, and devolutions
- PostgreSQL for database
- Node.js (TypeScript) is used for executing these changes

Any and all of these could be implemented with another language or technology. The important aspect here is the design pattern how this is implemented, not with what this is implemented.

## Design Pattern

Main problems to solve here are as follows:

- How can multiple developers work on the same database schema in multiple feature branches?
- How can we deploy iterative changes to our schema?
- How can developer rollback their feature branch from development and other testing environments?

The first and second problem are solved by creating incremental evolutions by naming files: `0001_<...>.sql`, `0002_<...>.sql`, ... `xxxx_<...>.sql`. Thus, if multiple developers working on different features all need to change the database schema, they need to create evolutions file that will have prefix of the next available number. This will cause merge conflict after one of them merges their feature to master. This in return, will require the other developers to adjust their evolutions accordingly.

The third problem is solved with the creation of devolutions and backups in evolutions. Devolutions are one-off mutations used for rollbacks, thus `master` -branch should not contain any devolutions. Developer can create devolution to rollback their changes from an environment, if, for example, another feature needs to be deployed before it. After devolution has been run, developer can remove that from their feature branch and "start over" with their evolutions.

All the schema changes should also be added to `schema.sql` that creates the whole schema from scratch.

For example, if our old schema.sql is:

```sql
create table if not exists users (
    id integer
)
```

and we want to evolve it to include name column, we would change the schema.sql to:

```sql
create table if not exists users (
      id integer
    , name varchar
)
```

and create corresponding evolution sql:

```sql
alter table users add column if not exists name varchar
```

### Evolution file example

```sql
-- 0001_my_feature.sql

-- Adds:
alter table users add column if not exists email varchar;

-- Backups (before drops):
create table if not exists users_backup_for_my_feature as
  select id, name from users;

--- Drops:
alter table users drop column if exists name;
```

### Devolution file example

```sql
--- 0001_rolling_back_my_feature.sql

alter table users add column if not exists name varchar;
alter table users drop column if exists email;

update users set
  name = b.name
from users_backup_for_my_feature b
where users.id = b.id;

drop table if exists users_backup_for_my_feature;
```

Evolutions and devolutions must be sequential, i.e. increment/decrement by one and only one.

### Executor

The executor that runs these evolution changes, needs to keep track of at what evolution we are in this specific database and only run evolutions once. Thus it needs to take account the need to run multiple evolutions sequentially, and running devolutions to decrease the current evolution version.

This can be quite easily achived by using simple table:

```sql
create table evolution_version (
    id integer
)
```

#### Evolutions

Evolutions are run by increasing order: 1, 2, 3...

#### Devolutions

Devolutions are run by decreasing order: ..., 3, 2, 1.

#### Incremental changes

1. If id in `evolution_version` is less than max evolution sql number, evolutions will be run from the `evolution_version` + 1.
2. If the new `evolution_version` (max evolution sql number) is the same as max devolution sql number, devolution sql will be run.
3. Step 2. will be repeated until the clause is not true.

#### Initialisation

If `evolution_version` table does not exist, we can run schema.sql and update evolution_version to the latest evolution number.

## Practice

As it's probably apparent at this point, making these evolutions and devolutions is manual process. Thus, this requires developers to define their schema changes twice: in schema.sql and in xxxx_evolution.sql. Not only does this increase work, but it also increases human error, because if these two files do not produce the same schema or create necessary backups to make rollbacks possible, this pattern fails.

Thus code reviews, integration tests, or making this process semi-automatic with the use of schema comparing tools (like `pgdiff`) are options.

### Integration testing

We can use a tool to export the schema of database (for example, `pg_dump` for PostgreSQL), and then compare this exported schema to another one. This means that we can run just schema.sql and run all the evolution sqls in two different (empty) databases, and compare these -- they should produce the same schemas if our schema and evolutions are not diverged.

## Setup for example

Build Docker image in root of this repository:

```
docker build -t evolving-database-nature .
```
