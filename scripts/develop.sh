#!/bin/sh
cargo watch \
  -w src \
  -w tests \
  -w benches \
  -x check \
  -x test \
  -s 'wasm-pack build' \
  & p1=$! 
cargo watch \
  -w src \
  -w tests \
  -w benches \
  -x check \
  -x test \
  -s 'wasm-pack test --headless --firefox' \
  & p2=$! 
sleep 1 \
  && npm --prefix www/ start \
  & p3=$! 
wait $p1 $p2 $p3
