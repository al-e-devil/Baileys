#!/bin/bash

npx pbjs -t static-module -o proto/database.js proto/database.proto
npx pbts -o proto/database.d.ts proto/database.js