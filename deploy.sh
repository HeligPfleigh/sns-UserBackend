#!/bin/bash

deploy() {

  mode=$1
  shift;

  echo "git pull"
  echo "source updating..."
  git pull

  echo "node_modules installing..."
  npm i

  echo "webpack bundling..."
  npm run build "$@"


  echo "server container is starting..."
  if [ "$mode" == "dev" ]
    then
      echo "Build Development Mode"
      docker-compose -f docker-compose.yml stop server
      docker-compose -f docker-compose.yml rm server -f
      docker-compose -f docker-compose.yml up -d --build server
  else
    echo "Build Production Mode"
    docker-compose -f docker-compose.pro.yml stop server
    docker-compose -f docker-compose.pro.yml rm server -f
    docker-compose -f docker-compose.pro.yml up -d --build server
  fi
}

c=$1
shift;

# run mongo
MONGODB=$(docker-compose ps -q mongo)

if [ "$MONGODB" == "" ]; then
  if [ "$c" == "production" ]; then
    echo "mongo container does not exist"
    echo "mongo container is starting..."
    docker-compose -f docker-compose.pro.yml up -d mongo
  else
    echo "mongo container is exist..."
    docker-compose -f docker-compose.yml up -d mongo
  fi
fi

case "$c" in
    development)
      deploy dev
    ;;

    production)
      deploy prod -- --release
    ;;

    remove)
      docker-compose -f docker-compose.yml stop
      docker-compose -f docker-compose.yml rm -f
    ;;

    *)
    echo $"Usage: $0 { development | production | remove }"
    exit 1

esac
