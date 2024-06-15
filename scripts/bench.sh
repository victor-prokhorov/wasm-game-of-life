#!/bin/sh
cargo watch \
  -w src \
  -w tests \
  -w benches/bench.rs \
  -w www \
  -x check \
  -x test \
  -s 'wasm-pack test --headless --firefox \
    && cargo bench | tee ./benches/variable.txt \
    && cargo benchcmp ./benches/control.txt ./benches/variable.txt'
