import { playSound, stopSound, audioBackEndInit } from '../src/soundLoader.js';

// Caminhos para os assets do jogo a partir da root do projeto
const assets_paths = {
  images: '/assets/images/',
  sounds: '/assets/sounds/',
};

/**
 * O jogo vai ter 3 dificuldades, logo dividimos as cartas todas
 * em 3 sets de cartas, cada um com mais cartas que o último
 */
const gameCardDificullty = {
  frenteCartasFacil: ['Mushroom', 'Propeller_Mushroom', 'Star', 'Dead1'],
  frenteCartasMedio: [
    'Ice_Flower',
    'Dead2',
    'Mushroom',
    'Penguin',
    'Propeller_Mushroom',
    'Star',
  ],
  frenteCartasdiFicil: [
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
 * @returns {HTMLDivElement} Carta
 * @param {string} cardImgSrc
 *
 * Cria uma carta a partir de um URL para uma imagem png
 */
function criarCarta(cardImgSrc) {
  let jogo = document.getElementById('grid');

  jogo.style.gridTemplateColumns = '';

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
 * @param {string[]} listaNomesDasCartas
 * @param {HTMLDivElement} grid
 */
function criarCartas(listaNomesDasCartas, grid) {
  // Adiciona a lista de cartas dadas 2x à grid, assim assegura a
  // existêmncia de pares de cartas.
  // E usamos uma função de sort random para baralhar as cartas
  let cartasEmb = [...listaNomesDasCartas, ...listaNomesDasCartas].sort(
    () => Math.random() - 0.5
  );
  // Adicionamos as cartas à grelha 1 a 1
  cartasEmb.forEach((cardName) => grid.appendChild(criarCarta(cardName)));
}

/**
 * @returns {void}
 * Inicia e configura a página para o jogo funcionar,
 * inicia a back-end que lida com o som, cria a grid das cartas
 * e inicia a músiquinha de fundo
 */
async function init() {
  await audioBackEndInit();

  let grid = document.querySelector('.grid');
  console.log(`->> ${gameCardDificullty[localStorage.getItem('dificuldade')]}`);
  criarCartas(gameCardDificullty[localStorage.getItem('dificuldade')], grid);

  let timeOutId = setTimeout(() => {
    playSound('bg-music-org');
    clearTimeout(timeOutId);
  }, 1000);
}

init();
