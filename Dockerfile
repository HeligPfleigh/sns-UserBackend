FROM node:8.9.3-alpine
MAINTAINER Hoang Nam "particle4dev@gmail.com"

ENV DEBIAN_FRONTEND noninteractive

#install python 2.7
RUN apk add --no-cache python && \
    python -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip install --upgrade pip setuptools && \
    rm -r /root/.cache
# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD package.json yarn.lock /tmp/
RUN cd /tmp && yarn install --frozen-lockfile

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./ /usr/src/app/
RUN cp -a /tmp/node_modules /usr/src/app/

EXPOSE 8081

CMD [ "yarn", "start:prod" ]
