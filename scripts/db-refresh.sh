#!/bin/bash
export PGPASSWORD=mysecretpassword
psql --host=localhost --port 5432 --username=postgres --dbname postgres --command="drop schema if exists bot cascade"
psql --host=localhost --port 5432 --username=postgres --dbname postgres --file=/home/sharad/personal/telegram/src/configs/db.sql