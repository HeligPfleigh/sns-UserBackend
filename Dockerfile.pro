FROM node:6.9.5
MAINTAINER SNS-DEV TEAM "linh.le@mttjsc.com"

ENV DEBIAN_FRONTEND noninteractive

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY build/ /usr/src/app/

# Install yarn
RUN curl -o- -L https://yarnpkg.com/install.sh | bash
ENV PATH "$HOME/.yarn/bin:$PATH"

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
# Install app dependencies
RUN $HOME/.yarn/bin/yarn cache clean
RUN cd /usr/src/app &&  $HOME/.yarn/bin/yarn install --pure-lockfile

#############################################
# RUN cd /usr/src/app && npm i              #
# RUN cp -a /tmp/node_modules /usr/src/app/ #
#                                           #
# EXPOSE 3005                               #
# CMD [ "npm", "start" ]                    #
#############################################

EXPOSE 3005

CMD [ "npm", "start" ]

# Install PM2 process manager
# RUN npm install pm2 -g
# CMD ["pm2-docker", "process.yml"]
