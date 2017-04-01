#!/bin/bash

mimport ()
{
  if [ -e $DPATH/data/$1.json ] ; then
    mongoimport --host ds133290.mlab.com:33290 --username admin --password admin123 --db sns --collection $1 --drop --file $DPATH/data/$1.json
  else
    echo 'not found ' + $DPATH/data/$1.json
  fi
}

for collection in $COLLECTIONS
  # All collections on same line.
do
  mimport $collection
done
