#!/usr/bin/env bash

set -a
[ -f .env.development ] && . .env.development
set +a

flywayBaseline() {
    docker run --rm --network host \
        -v "$(pwd)/flyway:/flyway/sql" \
        -v "$(pwd)/$VITE_DB_NAME:/flyway/$VITE_DB_NAME:rw" \
        flyway/flyway:8.5.0-alpine -url=jdbc:sqlite:/flyway/$VITE_DB_NAME baseline
}

flywayMigrate() {
    docker run --rm --network host \
        -v "$(pwd)/flyway:/flyway/sql" \
        -v "$(pwd)/$VITE_DB_NAME:/flyway/$VITE_DB_NAME:rw" \
        flyway/flyway:8.5.0-alpine -url=jdbc:sqlite:/flyway/$VITE_DB_NAME migrate
}

flywayInfo() {
    docker run --rm --network host \
        -v "$(pwd)/flyway:/flyway/sql" \
        -v "$(pwd)/$VITE_DB_NAME:/flyway/$VITE_DB_NAME:rw" \
        flyway/flyway:8.5.0-alpine -url=jdbc:sqlite:/flyway/$VITE_DB_NAME info
}

if [[ $# -eq 0 ]] ; then
    echo 'Please provide one of the arguments (e.g., bash flyway-migrate.sh info):
    1 > info
    2 > baseline
    3 > migrate'

elif [[ $1 == info ]]; then
    flywayInfo

elif [[ $1 == baseline ]]; then
    flywayBaseline

elif [[ $1 == migrate ]]; then
    flywayMigrate

fi

# Clean the env variables
unset $(grep -v '^#' .env.development | sed -E 's/(.*)=.*/\1/' | xargs)
