import { playSound, stopSound, audioBackEndInit } from '../src/soundLoader.js';

const assets_paths = {
  images: '/assets/images/',
  sounds: '/assets/sounds/',
};

const gameCardDificullty = {
  frenteCartasFacil: [
    'Mushroom',
    'Penguin',
    'Propeller_Mushroom',
    'Star',
    'Dead1',
  ],
  frenteCartasMedio: [
    'Ice_Flower',
    'Dead2',
    'Mushroom',
    'Penguin',
    'Propeller_Mushroom',
    'Star',
  ],
  frenteCartasdificil: [
    'Dead1',
    'Dead2',
    'Fire_Flower',
    'Ice_Flower',
    'Mushroom',
    'Penguin',
    'Propeller_Mushroom',
    'Star',
  ],
};

/**
 * @returns {HTMLDivElement}
 * @param {string} cardImgSrc
 */
function criarCarta(cardImgSrc) {
  const carta = document.createElement('div');
  carta.classList.add('carta');

  const front_face = document.createElement('div');
  front_face.classList.add('face');
  front_face.classList.add('frente');
  front_face.style.backgroundImage = `url(${
    assets_paths.images + cardImgSrc + '.png'
  })`;

  const back_face = document.createElement('div');
  back_face.classList.add('face');
  back_face.classList.add('costas');

  carta.appendChild(back_face);
  carta.appendChild(front_face);

  return carta;
}

/**
 * @returns {void}
 * @param {string[]} listaCartasNomes
 * @param {HTMLDivElement} grid
 */
function criarCartas(listaCartasNomes, grid) {
  let cartasEmb = [...listaCartasNomes, ...listaCartasNomes].sort(
    () => Math.random() - 0.5
  );
  cartasEmb.map((cardName) => grid.appendChild(criarCarta(cardName)));
}

/** @returns {void} */
async function init() {
  await audioBackEndInit();
  let grid = document.querySelector('.grid');
  criarCartas(gameCardDificullty.frenteCartasFacil, grid);
  playSound('bg-lowered-comp');
  // grid.appendChild(criarCarta(frenteCartas[0]));
}

init();
