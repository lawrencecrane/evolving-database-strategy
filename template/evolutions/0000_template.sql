-- # create and add mutations here:
-- alter table users add column if not exists email varchar;

-- # backup for drop mutations here:
-- create table users_backup_for_name as select id, name from users;

-- # drop mutations here:
-- alter table users drop column if exists name;