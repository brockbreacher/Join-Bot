#!/bin/sh
set -e

mkdir -p /usr/src/app/guilds
chown -R node:node /usr/src/app/guilds
chmod -R 755 /usr/src/app/guilds

exec su-exec node "$@"
