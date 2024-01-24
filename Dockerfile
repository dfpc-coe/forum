FROM ubuntu:22.04

EXPOSE 4567

ENV VERSION=3.6.4
ENV HOME=/home/forum
WORKDIR $HOME

WORKDIR $HOME

RUN apt-get update \
    && apt-get install -y curl

RUN export NODEV='20.11.0' \
    && curl "https://nodejs.org/dist/v${NODEV}/node-v${NODEV}-linux-x64.tar.gz" | tar -xzv \
    && cp ./node-v${NODEV}-linux-x64/bin/node /usr/bin/ \
    && ./node-v${NODEV}-linux-x64/bin/npm install -g npm 


RUN curl -L https://github.com/NodeBB/NodeBB/archive/refs/tags/v${VERSION}.tar.gz > /tmp/nodebb.tar.gz \
    && tar -xf /tmp/nodebb.tar.gz -C $HOME

WORKDIR $HOME/NodeBB-${VERSION}

RUN cp ./install/package* . \
    && npm install

ENV NODE_ENV=production \
    CONFIG_DIR='./install' \
    NODEBB_INIT_VERB=install \
    daemon=false \
    silent=false

CMD ./nodebb start

