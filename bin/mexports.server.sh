#!/bin/bash

mexport ()
{
  mongoexport --host ds133290.mlab.com:33290 --username admin --password admin123 --db sns --collection $1 --out $DPATH/data/$1.json
}

for collection in $COLLECTIONS
  # All collections on same line.
do
  mexport $collection
done
