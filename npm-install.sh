#!/bin/bash
cp package.json package.json.bak
BASEDIR=$(dirname "$0")
node $BASEDIR/scripts/merge-build-tools-deps.js
npm install --unsafe-perm
mv package.json.bak package.json