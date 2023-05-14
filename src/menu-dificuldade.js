import { audioBackEndInit, playSound, stopSound } from "./soundLoader.js";

const dificuldadesJogo = {
  facil: "frenteCartasFacil",
  medio: "frenteCartasMedio",
  dificil: "frenteCartasDificil",
};

let cartas = document.getElementsByClassName("card");

let facil = document.getElementById("facil");
let medio = document.getElementById("medio");
let dificil = document.getElementById("dificil");
let musica = 0;

audioBackEndInit();

// Muda a cor de fundo da página, ao entrar em cada carta
// cada carta têm uma cor especifica que simboliza a
facil.onmouseover = () => {
  document.querySelector(".page").style.backgroundColor = "green";
};
facil.onclick = () => {
  //chamar jogo dificuldade facil
  gameStartRedirect("overworldtheme", dificuldadesJogo.facil);
};

medio.onmouseover = () => {
  document.querySelector(".page").style.backgroundColor = "yellow";
};
medio.onclick = () => {
  //chamar jogo dificuldade media
  gameStartRedirect("overworldtheme", dificuldadesJogo.medio);
};

dificil.onmouseover = () => {
  document.querySelector(".page").style.backgroundColor = "red";
};
dificil.onclick = () => {
  //chamar jogo dificuldade dificil
  gameStartRedirect("bowser-castle", dificuldadesJogo.dificil);
};

// Mudar a cor de fundo da página para cyan, após o cursor sair de cada carta
Array.from(cartas).forEach(
  (carta) =>
    (carta.onmouseleave = () => {
      document.querySelector(".page").style.backgroundColor = "cyan";
    }),
);

/**
 * @returns {void}
 * @param {string} gameMusicTheme
 * @param {string} dificuldade
 *
 * Inicia a sequencia de transição entre páginas,
 * define a difculdade do jog e
 * inicia a musica e retira a mesma depois de um intervalo
 * de tempo prefedefinido na funcção
 */
function gameStartRedirect(gameMusicTheme, dificuldade) {
  playSound(gameMusicTheme, 0.5);

  document.body.style.animationName = "fadeOut";
  localStorage.setItem("dificuldade", dificuldade);

  musica = setTimeout(() => {
    window.location = "jogo.html";
    stopSound(gameMusicTheme);
    clearTimeout(musica);
  }, 2200);
}
