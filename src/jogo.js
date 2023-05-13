import { audioBackEndInit, playSound } from "../src/soundLoader.js";

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
  frenteCartasFacil: {
    cartas: ["Mushroom", "Propeller_Mushroom", "Star", "Dead1"],
    mortes: 1,
  },
  frenteCartasMedio: {
    cartas: [
      "Ice_Flower",
      "Mushroom",
      "Penguin",
      "Propeller_Mushroom",
      "Star",
      "Dead1",
      "Dead1",
    ],
    mortes: 2,
  },
  frenteCartasDificil: {
    cartas: [
      "Fire_Flower",
      "Ice_Flower",
      "Mushroom",
      "Penguin",
      "Propeller_Mushroom",
      "Star",
      "Dead1",
      "Dead2",
      "Dead2",
    ],
    mortes: 3,
  },
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

  carta.onclick = () => handleCardClick(carta);

  const front_face = document.createElement("div");
  front_face.classList.add("face");
  front_face.classList.add("frente");

  const back_face = document.createElement("div");
  back_face.classList.add("face");
  back_face.classList.add("costas");
  back_face.style.backgroundImage = cssBgUrlFromImgName(cardImgSrc);

  carta.appendChild(back_face);
  carta.appendChild(front_face);

  return carta;
}

function getCartaImageSrc(index) {
  return document
    .getElementById(gameState.cartasSelecionadas[index])
    .querySelector(".costas").style.backgroundImage;
}

/**
 * Muda o lado da carta visivel ao utilizador dependendo do estado
 * anterior, ou seja, se na iteração n-1 estava de "frente" na iteração n
 * estará virada de "costas"
 *
 * @returns {void}
 * @param {number} id
 */
function toggleDisplayCardSelection(id) {
  // Cada carta do jogo têm um id associado à sua posição no array
  // de cartas, logo o id não identifica unicamente a mesma carta em jogos diferentes
  const carta = document.getElementById(id);
  carta.classList.toggle("_selected");
  carta.querySelector(".frente").classList.toggle("frente-flip");
  carta.querySelector(".costas").classList.toggle("costas-flip");
}

/**
 * Dado um nome de uma imagem, se essa estiver colocada no folder `/assets/images`
 * será devolvido o valor correto para ser dado a à regra css 'background-image'
 *
 * @param {string} cardImgSrc
 * @returns {string}
 */
const cssBgUrlFromImgName = (cardImgSrc) =>
  `url("${buildImgPathFromImg(cardImgSrc)}.png")`;

/**
 * Dado o nome de uma imagem, o seu caminho no projeto
 * será criado de maneira automática, esta função assume que
 * cada imagem terá um nome único (também ignora as extensões de ficheiro)
 *
 * @param {string} cardImgSrc
 * @returns {string}
 */
const buildImgPathFromImg = (cardImgSrc) =>
  `${assets_paths.images}${cardImgSrc}`;

/**
 *
 * @param {string} path
 * @returns {string | undefined}
 */
const getImgNameFromBuildImgPathString = (path) => path.split("/").pop();

/**
 * Lida com a lógica principal do jogo a cada click numa carta,
 * como não existe um game-loop corrente, e o jogo só "corre"
 * em cada interação do jogador com o tabuleiro das cartas,
 * as regras têm de ser verificadas a cada interação com a carta
 *
 * @param {HTMLDivElement} carta
 * @returns {void}
 */
function handleCardClick(carta) {
  /*
    Se a carta já foi selecionada e utilizada para criar um par
    válido de cartas iguais, logo essa carta existe no array de
    cartas selecionadas, a função termina por aqui, assim evita-se
    descelecionar cartas antes de escolher um par, e/ou cartas
    já utilizadas/escolhidas.
  */
  if (
    carta.getAttribute("selected") === "true" ||
    checkCardInSelectedCardArray(carta.id)
  )
    return;

  /*
    No momento que tivermos duas cartas disponiveis para comparar
    vamos trancar a interação do jogador com cada carta (como um semaforo - var locked)
    para evitar "race-conditions" (se é que pode acontecer) ao escolher várias
    cartas simultaneamente.
  */
  if (gameState.numCardSelected < 2 && !locked) {
    locked = true;

    /* Só alteramos a dispozição da carta escolhida se essa mesma
    não estiver contida no array de cartas selcionadas*/
    if (!checkCardInSelectedCardArray(carta.id))
      toggleDisplayCardSelection(carta.id);
    ++gameState.numCardSelected;

    gameState.cartasSelecionadas.push(carta.id);

    locked = false;
  }
  /* Verificação do par de cartas escolhidas e a ação resultante,
  se o jogo continua ou acaba */
  if (gameState.numCardSelected === 2) {
    locked = true;

    /* Este comportamento lida com timmings de css,
    logo para a boa visualização destas fantásticas animações css,
    temos de dar tempo para elas ocurrerem */
    let timeOutID = setTimeout(() => {
      let firstCardImageName = getImgNameFromBuildImgPathString(
        getCartaImageSrc(0),
      );
      let secondCardImageName = getImgNameFromBuildImgPathString(
        getCartaImageSrc(1),
      );

      if (firstCardImageName === secondCardImageName) {
        // Verificação para ver se é o par de cartas que acabam o jogo
        if (firstCardImageName.toLocaleLowerCase().includes("dead")) {
          // Atribui a animação css especifica para as cartas de game-over
          for (const id of gameState.cartasSelecionadas.values())
            document.getElementById(id).classList.toggle("_death");

          // Esperamos um pouco até mostrar o ecrã de end-game, para deixar a anim. correr
          let timeOutId = setTimeout(() => {
            playSound("getreckt");
            showGameOverScreen();
            clearTimeout(timeOutId);
          }, 700);

          return;
        }

        /* Se a esolha de carta gera um par de cartas iguais,
        mudamos a dispozição das mesmas, e marcamos as cartas como
        selecionadas, assim não se pode voltar a descelecionar as cartas */
        gameState.correctChoices++;
        for (const id of gameState.cartasSelecionadas.values()) {
          document.getElementById(id).classList.toggle("_correta");
          document.getElementById(id).setAttribute("selected", "true");
        }
      } else {
        /* Se as cartas não forem iguais, damos reset ao seu estado */
        for (const id of gameState.cartasSelecionadas.values()) {
          toggleDisplayCardSelection(id);
          carta.setAttribute("selected", "false");
        }
      }

      /* Esta secção lida com o reset da rodada de seleção do par de cartas
      e desbloqueia o tabuleiro para a próxima jogada*/
      gameState.cartasSelecionadas = [];
      gameState.numCardSelected = 0;
      locked = false;
      clearTimeout(timeOutID);
    }, 1100);
  }

  /**
   * Verifica se uma carta especificada pelo seu ID, se encontra no
   * array das cartas selecionadas
   *
   * @param {number} id
   * @returns {boolean}
   */
  function checkCardInSelectedCardArray(id) {
    return gameState.cartasSelecionadas.indexOf(id) !== -1;
  }
}

/**
 * Altera o css para tornar vizivél o ecrã de fim de jogo
 *
 * @returns {void}
 */
function showGameOverScreen() {
  document.querySelector(".modal").classList.toggle("_showModal");
  document.getElementById("mariodance").classList.add("_showImage");
  document.removeChild(document.getElementById("grid"));
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
  criarCartas(
    gameCardDificullty[localStorage.getItem("dificuldade")].cartas,
    grid,
  );

  let timeOutId = setTimeout(() => {
    // playSound("bg-music-org");
    clearTimeout(timeOutId);
  }, 1000);
}

init();
