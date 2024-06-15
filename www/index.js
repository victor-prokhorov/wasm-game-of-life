import { Universe, Seed } from 'wasm-game-of-life';
import { memory } from 'wasm-game-of-life/wasm_game_of_life_bg';

const CELL_SIZE = 2;
const CELL_COLOR = 'white';
const OCTET = 8;
const WIDTH = 256;
const HEIGHT = 256;

let seed = 3;

let universe = Universe.init(WIDTH, HEIGHT, seed);
const { width, height } = universe;

const canvas = document.getElementById('wasm-game-of-life');

canvas.height = CELL_SIZE * height;
canvas.width = CELL_SIZE * width;

const context = canvas.getContext('2d');
context.fillStyle = CELL_COLOR;

const isEnabled = (index, array) => {
  const byte = Math.floor(index / OCTET);
  const mask = 1 << (index % OCTET);
  const bit = array[byte] & mask;
  return bit === mask;
};

const paint = () => {
  const cellsPtr = universe.cells_ptr();
  const cells = new Uint8Array(memory.buffer, cellsPtr, universe.capacity);

  context.beginPath();

  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      const index = universe.get_index(row, column);
      if (!isEnabled(index, cells)) continue;

      context.fillRect(
        column * CELL_SIZE,
        row * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE,
      );
    }
  }

  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      const index = universe.get_index(row, column);
      if (isEnabled(index, cells)) continue;
      context.clearRect(
        column * CELL_SIZE,
        row * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE,
      );
    }
  }

  context.stroke();
};

function getCellPosition(event) {
  const rect = canvas.getBoundingClientRect();
  let row = Math.floor((event.clientY - rect.top) / CELL_SIZE);
  let column = Math.floor((event.clientX - rect.left) / CELL_SIZE);

  if (column >= width) column = width - 1;
  if (column <= 0) column = 0;
  if (row >= height) row = height - 1;
  if (row <= 0) row = 0;

  return [row, column];
}

function handleSet(event) {
  const [row, column] = getCellPosition(event);
  universe.set_cell(row, column);
  paint();
}

function handleStart(event) {
  handleSet(event);
  document.addEventListener('mousemove', handleSet);
}

function handleStop() {
  document.removeEventListener('mousemove', handleSet);
}

canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mouseup', handleStop);
canvas.addEventListener('mouseout', handleStop);

let animationId = null;

const isPaused = () => animationId === null;

const renderLoop = () => {
  universe.tick();
  paint();
  animationId = requestAnimationFrame(renderLoop);
};

const playPauseButton = document.getElementById('play-pause');
const resetButton = document.getElementById('reset');

const handlePlay = () => {
  playPauseButton.textContent = 'pause';
  renderLoop();
};

const handlePause = () => {
  playPauseButton.textContent = 'play';
  cancelAnimationFrame(animationId);
  animationId = null;
};

const saveCells = () => {
  const cellsPtr = universe.cells_ptr();
  const buf = new ArrayBuffer(universe.capacity);
  new Uint8Array(buf).set(new Uint8Array(memory.buffer, cellsPtr, universe.capacity));
  return new Uint8Array(buf);
};

let initialCells = saveCells();

const tickButton = document.getElementById('tick');
tickButton.addEventListener('click', () => { universe.tick(); paint(); });

const handleNew = () => {
  universe = Universe.init(WIDTH, HEIGHT, seed);
  initialCells = saveCells();
  paint();
};
const newButton = document.getElementById('new');
newButton.addEventListener('click', handleNew);

const selectSeed = document.getElementById('seed');
const handleSelect = () => {
  seed = selectSeed.selectedIndex;
  handleNew();
};
selectSeed.addEventListener('change', handleSelect);

const handleReset = () => {
  if (isPaused()) {
    universe.set_cells(initialCells);
    paint();
  } else {
    handlePause();
    universe.set_cells(initialCells);
    paint();
    handlePlay();
  }
};
resetButton.addEventListener('click', () => {
  handleReset();
});

playPauseButton.addEventListener('click', () => {
  if (isPaused()) {
    handlePlay();
  } else {
    handlePause();
  }
});

const downloadURL = (data, fileName) => {
  const a = document.createElement('a');
  a.href = data;
  a.download = fileName;
  document.body.appendChild(a);
  a.style.display = 'none';
  a.click();
  a.remove();
};

const saveButton = document.getElementById('save');
const handleSave = () => {
  const downloadBlob = (data, fileName, mimeType) => {
    const blob = new Blob([data], {
      type: mimeType,
    });
    const url = window.URL.createObjectURL(blob);
    downloadURL(url, fileName);
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  };

  const uint8 = saveCells();
  downloadBlob(uint8, 'state.bin', 'application/octet-stream');
};
saveButton.addEventListener('click', handleSave);

const uploadButton = document.getElementById('upload');
const handleUpload = () => {
  const input = document.createElement('input');
  input.type = 'file';

  input.onchange = (e) => {
    const [file] = e.target.files;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = (readerEvent) => {
      const cells = new Uint8Array(readerEvent.target.result);
      universe.set_cells(cells);
      paint();
    };
  };

  input.click();
};
uploadButton.addEventListener('click', handleUpload);

handlePlay();
