import { audioBackEndInit, playSound, stopSound } from './soundLoader.js';

let cartas = document.getElementsByClassName('card');

let facil = document.getElementById('facil');
let medio = document.getElementById('medio');
let dificil = document.getElementById('dificil');
let musica = 0;

audioBackEndInit();

// Muda a cor de fundo da página, ao entrar em cada carta
// cada carta têm uma cor especifica que simboliza a
facil.onmouseover = function () {
  document.getElementsByClassName('page')[0].style.backgroundColor = 'green';
};
facil.onclick = function () {
  playSound('overworldtheme');
  document.body.style.animationName = 'fadeOut';
  musica = setTimeout(() => {
    stopSound('overworldtheme');
    localStorage.setItem('dificuldade', 'frenteCartasFacil');
    window.location = 'jogo.html';
    clearTimeout(musica);
  }, 2200);
};

medio.onmouseover = function () {
  document.getElementsByClassName('page')[0].style.backgroundColor = 'yellow';
};
medio.onclick = function () {
  //chamar jogo medio
  localStorage.setItem('dificuldade', 'frenteCartasMedio');
};

dificil.onmouseover = function () {
  document.getElementsByClassName('page')[0].style.backgroundColor = 'red';
};
dificil.onclick = function () {
  playSound('bowser-castle');
  document.body.style.animationName = 'fadeOut';
  musica = setTimeout(() => {
    stopSound('bowser-castle');
    localStorage.setItem('dificuldade', 'frenteCartasdiFicil');
    window.location = 'jogo.html';
    clearTimeout(musica);
  }, 2000);
};

// Mudar a cor de fundo da página para cyan, após o cursor sair de cada carta
Array.from(cartas).forEach(
  (x) =>
    (x.onmouseleave = () => {
      document.querySelector('.page').style.backgroundColor = 'cyan';
    })
);
