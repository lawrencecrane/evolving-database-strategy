-- # create and add mutations here:
-- alter table users add column if not exists name varchar;

-- # drop mutations here:
-- alter table users drop column if exists email;

-- # restore data here:
-- update users set name = b.name from users_backup_for_name b where users.id = b.id;

-- # remove backup data here:
-- drop table if exists users_backup_for_name;