#!/bin/bash

package=$1
if [ ! -d node_modules/$package ]; then
  yarn-retry -- add $package --ignore-engines
fi
