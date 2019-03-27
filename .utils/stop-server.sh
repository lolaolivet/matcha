#!/bin/bash

export MATCHA_SERVER_URL=${MATCHA_SERVER_URL:-"http://localhost:9000"};
docker-compose down;