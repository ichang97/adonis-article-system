#!/bin/sh
node ace migration:run --force
node build/server.js