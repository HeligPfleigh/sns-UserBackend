#!/bin/bash

mimport ()
{
  if [ -e $DPATH/data/$1.json ] ; then
    mongoimport --host localhost:27017 --db sns_test --collection $1 --drop --file $DPATH/data/$1.json
  else
    echo 'not found ' + $DPATH/data/$1.json
  fi
}

for collection in $COLLECTIONS
  # All collections on same line.
do
  mimport $collection
done