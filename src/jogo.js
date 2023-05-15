import { audioBackEndInit, playSound, stopSound } from "../src/soundLoader.js";

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
    pares: 3,
  },
  frenteCartasMedio: {
    cartas: [
      "Ice_Flower",
      "Mushroom",
      "Penguin",
      "Propeller_Mushroom",
      "Dead1",
      "Dead1",
    ],
    pares: 4,
  },
  frenteCartasDificil: {
    cartas: [
      "Fire_Flower",
      "Ice_Flower",
      "Mushroom",
      "Propeller_Mushroom",
      "Star",
      "Dead1",
      "Dead2",
      "Dead2",
    ],
    pares: 5,
  },
};

const gameState = {
  cartasSelecionadas: [],
  numCardSelected: 0,
  correctChoices: 0,
  neddedChoices: 0,
};

let GameInteractionIsLocked = false;

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

/**
 * Retira o valor da regra css de background image
 *
 * @param {number} index
 * @returns {string}
 */
function getCartaImageSrc(index) {
  const backgroundImage = document
    .getElementById(gameState.cartasSelecionadas[index])
    .querySelector(".costas").style.backgroundImage;
  return backgroundImage;
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
  `url("${buildImgPathFromImgName(cardImgSrc)}.png")`;

/**
 * Dado o nome de uma imagem, o seu caminho no projeto
 * será criado de maneira automática, esta função assume que
 * cada imagem terá um nome único (também ignora as extensões de ficheiro)
 *
 * @param {string} cardImgSrc
 * @returns {string}
 */
const buildImgPathFromImgName = (cardImgSrc) =>
  `${assets_paths.images}${cardImgSrc}`;

/**
 *
 * @param {string} path
 * @returns {string | undefined}
 */
const getImgNameFromImgPathString = (path) =>
  path.split("/").pop().slice(0, -2);

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
  if (gameState.numCardSelected < 2 && !GameInteractionIsLocked) {
    GameInteractionIsLocked = true;

    /* Só alteramos a dispozição da carta escolhida se essa mesma
    não estiver contida no array de cartas selcionadas*/
    if (!checkCardInSelectedCardArray(carta.id))
      toggleDisplayCardSelection(carta.id);

    playSound("paper-slide");
    ++gameState.numCardSelected;
    gameState.cartasSelecionadas.push(carta.id);

    GameInteractionIsLocked = false;
  }
  /* Verificação do par de cartas escolhidas e a ação resultante,
  se o jogo continua ou acaba */
  if (gameState.numCardSelected === 2) {
    GameInteractionIsLocked = true;

    /* Este comportamento lida com timmings de css,
    logo para a boa visualização destas fantásticas animações css,
    temos de dar tempo para elas ocurrerem */
    let gameBehaviorComputationTimeOutID = setTimeout(() => {
      let firstPickCardImageName = getImgNameFromImgPathString(
        getCartaImageSrc(0),
      );
      let secondPickCardImageName = getImgNameFromImgPathString(
        getCartaImageSrc(1),
      );

      if (firstPickCardImageName === secondPickCardImageName) {
        // Verificação para ver se é o par de cartas que acabam o jogo
        if (firstPickCardImageName.toLocaleLowerCase().includes("dead")) {
          // Atribui a animação css especifica para as cartas de game-over
          for (const id of gameState.cartasSelecionadas.values())
            document.getElementById(id).classList.toggle("_death");

          // Esperamos um pouco até mostrar o ecrã de end-game, para deixar a anim. correr
          playSound("player-losing");
          let deathScreenAppearDelay = setTimeout(() => {
            stopSound("bg-music-org");
            playSound("getreckt", 0.5);
            showGameOverScreen();
            clearTimeout(deathScreenAppearDelay);
          }, 1100);
        }

        /* Se a esolha de carta gera um par de cartas iguais,
        mudamos a dispozição das mesmas, e marcamos as cartas como
        selecionadas, assim não se pode voltar a descelecionar as cartas */
        gameState.correctChoices++;
        playSound("corr-choice");

        const powerUp = new Image();
        powerUp.src = buildImgPathFromImgName(firstPickCardImageName);
        powerUp.classList.add("power_icon");
        document.getElementById("power").appendChild(powerUp);

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
        playSound("paper-slide");
      }

      /* Verifica se as escolhas corretas necessárias para vencer
      foram atingidas, e termina o jogo com sucesso se tudo estiver bem */
      if (gameState.correctChoices === gameState.neddedChoices) {
        GameInteractionIsLocked = true;
        let id = setTimeout(() => {
          stopSound("bg-music-org");
          playSound("win-sound");
          showGameWinScreen();
          clearTimeout(id);
        }, 1100);
      }

      /* Esta secção lida com o reset da rodada de seleção do par de cartas
      e desbloqueia o tabuleiro para a próxima jogada*/
      gameState.cartasSelecionadas = [];
      gameState.numCardSelected = 0;
      GameInteractionIsLocked = false;
      clearTimeout(gameBehaviorComputationTimeOutID);
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
  document.getElementById("screens").style.zIndex = 9;
  document.getElementById("screens").style.opacity = 1;
  document.querySelector(".modal").classList.add("_showModal");
  document.getElementById("mariodance").classList.add("_showImage");
}

function showGameWinScreen() {
  document.getElementById("screens").style.zIndex = 9;
  document.getElementById("screens").style.opacity = 1;
  document.querySelector(".win").classList.add("_showModal");
  document.getElementById("mariodance").classList.add("_showImage");
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
function init() {
  audioBackEndInit();

  document.getElementById("stopMusic").onclick = () => stopBgMusic();

  let grid = document.querySelector(".grid");
  const infoCartas = gameCardDificullty[localStorage.getItem("dificuldade")];
  criarCartas(infoCartas.cartas, grid);

  gameState.neddedChoices = infoCartas.pares;

  let timeOutId = setTimeout(() => {
    playSound("bg-music-org", 0.05);
    clearTimeout(timeOutId);
  }, 1000);
}

function stopBgMusic() {
  stopSound("bg-music-org");
}

init();
