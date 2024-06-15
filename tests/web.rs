#![cfg(target_arch = "wasm32")]

use wasm_bindgen_test::*;
use wasm_game_of_life::{Seed, Universe};

wasm_bindgen_test_configure!(run_in_browser);

// TODO: -> utils return slice
fn assert_universe_cells_ptr(universe: &Universe, delta_byte: u8) -> bool {
    let cells_ptr = universe.cells_ptr();
    let capacity = universe.capacity;
    unsafe {
        let s: &[u8] = std::slice::from_raw_parts(cells_ptr, capacity);
        let mut clone: Vec<u8> = vec![0; capacity];
        clone.clone_from_slice(s);
        clone.iter().all(|&byte| byte == delta_byte)
    }
}

#[wasm_bindgen_test]
fn integration_test() {
    let width = 64;
    let height = 64;
    let seed = Seed::Empty;

    let universe = Universe::init(width, height, seed);

    assert_eq!(universe.get_index(1, 1), 65);
    assert_eq!(universe.get_index(123, 123), 7995);

    let ptr: *const u8 = universe.cells_ptr() as *const u8;
    unsafe {
        let s: &[u8] = std::slice::from_raw_parts(ptr, (width * height / 8) as usize);
        for i in 0..s.len() {
            let byte = *ptr.add(i);
            for j in 0..8 {
                let mask = 0b00000001 << j;
                let bit = byte & mask;
                match seed {
                    Seed::Empty => {
                        assert_eq!(bit, 0b00000000);
                    }
                    Seed::Full => {
                        assert_eq!(bit, mask);
                    }
                    _ => (),
                }
            }
        }
    }

    let mut universe = Universe::init(6, 6, Seed::Empty);
    assert!(assert_universe_cells_ptr(&universe, 0b00000000,));

    let cells = [0b01000001, 0b00010000, 0b00000100, 0b01000001, 0b00010000];
    universe.set_cells(&cells);
    for _ in 0..4 {
        universe.tick();
    }
    assert!(assert_universe_cells_ptr(&universe, 0b00000000,));

    let mut universe = Universe::init(1234, 1234, Seed::Random);
    let ptr: *const u8 = universe.cells_ptr();
    let capacity = universe.capacity;
    unsafe {
        let mut dst: Vec<u8> = vec![0; capacity];
        std::ptr::copy(ptr, dst.as_mut_ptr(), capacity);

        universe.set_cells(&dst);

        let mut delta_dst: Vec<u8> = vec![0; capacity];
        std::ptr::copy(ptr, delta_dst.as_mut_ptr(), capacity);

        assert!(dst.iter().zip(delta_dst).all(|(&l, r)| l == r));
    }
}
