create schema if not exists bot;
set schema 'bot';

create table if not exists telegram_users (
    id serial,
    telegram_id int,
    name text,
    primary key (id),
    unique (telegram_id)
);

create table if not exists websites  (
    id serial,
    web_name varchar(100),
    user_name varchar(100),
    email_id varchar(100),
    access_token text,
    meta json default '{}',
    telegram_id int,
    primary key (id),
    FOREIGN KEY(telegram_id) REFERENCES telegram_users(telegram_id) ON DELETE CASCADE
);
