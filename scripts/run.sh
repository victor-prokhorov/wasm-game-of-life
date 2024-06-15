#!/bin/sh
docker build --tag wasm-game-of-life-image . \
  && docker run --rm --name wasm-game-of-life-container -d -p 8080:80/tcp wasm-game-of-life-image \
  && echo 'http://localhost:8080'
