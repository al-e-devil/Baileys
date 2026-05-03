#!/bin/bash

npx pbjs -t static-module -w es6 --es6 -o Example/proto/database.js Example/proto/database.proto
npx pbts -o Example/proto/database.d.ts Example/proto/database.js
node Example/proto/fix-imports.js

