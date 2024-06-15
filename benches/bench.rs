#![allow(unused_variables)]
#![feature(test)]

use wasm_game_of_life::Seed;

extern crate test;
extern crate wasm_game_of_life;

#[bench]
fn tick(b: &mut test::Bencher) {
    let mut universe = wasm_game_of_life::Universe::init(128, 128, Seed::Random);

    b.iter(|| {
        universe.tick();
    });
}
