#!/bin/bash

mexport ()
{
  mongoexport --host localhost:27017 --db sns_test --collection $1 --out $DPATH/data/$1.json
}

for collection in $COLLECTIONS
  # All collections on same line.
do
  mexport $collection
done