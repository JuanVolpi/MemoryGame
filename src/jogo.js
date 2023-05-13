import { audioBackEndInit } from "../src/soundLoader.js";

// Caminhos para os assets do jogo a partir da root do projeto
const assets_paths = {
  images: "/assets/images/",
  sounds: "/assets/sounds/",
};

/**
 * O jogo vai ter 3 dificuldades, logo dividimos as cartas todas
 * em 3 sets de cartas, cada um com mais cartas que o último
 */
const gameCardDificullty = {
  frenteCartasFacil: ["Mushroom", "Propeller_Mushroom", "Star", "Dead1"],
  frenteCartasMedio: [
    "Ice_Flower",
    "Mushroom",
    "Penguin",
    "Propeller_Mushroom",
    "Star",
    "Dead1",
  ],
  frenteCartasDificil: [
    "Fire_Flower",
    "Ice_Flower",
    "Mushroom",
    "Penguin",
    "Propeller_Mushroom",
    "Star",
    "Dead1",
    "Dead2",
  ],
};

export const dificuldadesJogo = {
  facil: "frenteCartasFacil",
  medio: "frenteCartasMedio",
  dificil: "frenteCartasDificil",
};

const gameState = {
  cartasSelecionadas: [],
  numCardSelected: 0,
  correctChoices: 0,
};

let locked = false;

/**
 * @returns {HTMLDivElement} Carta
 * @param {string} cardImgSrc
 * @param {number} id
 *
 * Cria uma carta a partir de um URL para uma imagem png
 */
function criarCarta(cardImgSrc, id) {
  const carta = document.createElement("div");
  carta.classList.add("carta");
  carta.setAttribute("id", id);
  carta.setAttribute("selected", "false");

  const front_face = document.createElement("div");
  front_face.classList.add("face");
  front_face.classList.add("frente");

  const back_face = document.createElement("div");
  back_face.classList.add("face");
  back_face.classList.add("costas");
  back_face.style.backgroundImage = criarCartaSrcPath(cardImgSrc);

  // carta.classList.toggle("_correta");
  carta.onclick = () => {
    if (gameState.cartasSelecionadas.find((ids) => ids === carta.id)) return;

    if (gameState.numCardSelected < 2 && !locked) {
      locked = true;

      console.log(!gameState.cartasSelecionadas.indexOf(carta.id) !== -1);
      if (!gameState.cartasSelecionadas.indexOf(carta.id) !== -1)
        toggleDisplayCardSelection(carta.id);
      ++gameState.numCardSelected;

      gameState.cartasSelecionadas.push(carta.id);

      locked = false;
    }
    if (gameState.numCardSelected === 2) {
      locked = true;
      // handle correct choice
      let timeOutID = setTimeout(() => {
        let firstCardImage = String(getCartaImageSrc(0));
        let secondCardImage = String(getCartaImageSrc(1));

        if (firstCardImage === secondCardImage) {
          if (
            firstCardImage.includes("dead") ||
            firstCardImage.includes("Dead")
          )
            alert("dead");

          gameState.correctChoices++;
          for (const id of gameState.cartasSelecionadas.values())
            document.getElementById(id).classList.toggle("_correta");
        } else
          for (const id of gameState.cartasSelecionadas.values())
            toggleDisplayCardSelection(id);

        gameState.cartasSelecionadas = [];
        gameState.numCardSelected = 0;
        locked = false;
        clearTimeout(timeOutID);
      }, 1100);
    }
  };

  carta.appendChild(back_face);
  carta.appendChild(front_face);

  return carta;

  function getCartaImageSrc(index) {
    return document.getElementById(gameState.cartasSelecionadas[index])
      .children[0].style.backgroundImage;
  }

  function toggleDisplayCardSelection(id) {
    const carta = document.getElementById(id);
    carta.classList.toggle("_selected");
    carta.childNodes[1].classList.toggle("frente-flip");
    carta.childNodes[0].classList.toggle("costas-flip");
  }
}

function criarCartaSrcPath(cardImgSrc) {
  return `url("${assets_paths.images}${cardImgSrc}.png")`;
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
    () => Math.random() - 0.5,
  );
  // Adicionamos as cartas à grelha 1 a 1
  cartasEmb.forEach((cardName, index) =>
    grid.appendChild(criarCarta(cardName, index)),
  );
}

/**
 * @returns {void}
 * Inicia e configura a página para o jogo funcionar,
 * inicia a back-end que lida com o som, cria a grid das cartas
 * e inicia a músiquinha de fundo
 */
async function init() {
  await audioBackEndInit();

  let grid = document.querySelector(".grid");
  criarCartas(gameCardDificullty[localStorage.getItem("dificuldade")], grid);

  let timeOutId = setTimeout(() => {
    playSound("bg-music-org");
    clearTimeout(timeOutId);
  }, 1000);
}

init();
