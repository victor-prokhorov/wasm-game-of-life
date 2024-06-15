#![no_main]
use libfuzzer_sys::fuzz_target;
use wasm_game_of_life::{Seed, Universe};

fuzz_target!(|data: &[u8]| {
    let mut universe = Universe::init(64, 64, Seed::Empty);
    universe.set_cells(data);
    let cells_ptr = universe.cells_ptr();
    let capacity = universe.capacity;
    unsafe {
        let mut dst: Vec<u8> = vec![0; capacity];
        std::ptr::copy(cells_ptr, dst.as_mut_ptr(), capacity);
        assert!(dst.iter().zip(data).all(|(&l, &r)| l == r));
    }
});
