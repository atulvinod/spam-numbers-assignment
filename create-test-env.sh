#!/bin/bash
npx tsx ./run-migrations.ts --env test
npx tsx ./spec/support/seed_database.ts --env test
npm run test