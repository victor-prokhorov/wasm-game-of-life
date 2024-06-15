FROM rust:1.74.0-buster AS wasm-pack-build
COPY . /usr/local/wasm-game-of-life/
WORKDIR /usr/local/wasm-game-of-life/
RUN cargo check
RUN cargo install wasm-pack
RUN wasm-pack build

FROM wasm-pack-build as test
RUN DEBIAN_FRONTEND=noninteractive apt install -y firefox-esr
COPY . .
RUN cargo test
RUN wasm-pack test --headless --firefox

FROM node:18 AS webpack-build
COPY --from=wasm-pack-build /usr/local/wasm-game-of-life /usr/local/wasm-game-of-life/
WORKDIR /usr/local/wasm-game-of-life/www/
RUN npm i
RUN npm run build

FROM nginx
COPY --from=webpack-build /usr/local/wasm-game-of-life/www/dist/ /usr/share/nginx/html/
EXPOSE 80/tcp
