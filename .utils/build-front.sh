#!/bin/bash

BASEDIR=$(dirname $0)
echo "Building both front apps\n"

echo "Building landing app : "
npm --prefix $BASEDIR/../client/landing run build
echo "Building main app : "
npm --prefix $BASEDIR/../client/main-app run build
