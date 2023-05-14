window.soundLib = new AudioContext();

/* Tabela dos audios atualmente a serem reproduzidos*/
export const audio_table = {};

/**
 * Encarregue de carregar os audios para os elementos <audio>
 * e coloca os mesmos no html da página
 *
 * @returns {void}
 */
export async function loadSoundsIntoHTML() {
  const soundSectionName = "#audio-lib";

  let audioSection = document.createElement("section");
  audioSection.setAttribute("id", soundSectionName);

  // Lê os efeitos sonoros diponivies ao jogo,
  // descritos num ficheiro JSON
  let soundEffectsLib = await loadSoundLibJSON();

  for (let soundEffectName in soundEffectsLib) {
    const local = soundEffectsLib[soundEffectName].local;
    const extension = soundEffectsLib[soundEffectName].extension;
    const newSound = createAudioElement(local, soundEffectName, extension);

    audioSection.appendChild(newSound);

    audio_table[soundEffectName] = { playing: false };
  }

  let docBody = document.body;
  docBody.appendChild(audioSection);
}

export function pageAudioContext() {
  return window.soundLib;
}

export function playSound(soundName, volume) {
  const sound = document.getElementById(soundName);
  sound.volume = volume || 0.1;
  audio_table[soundName].playing = true;
  sound.play();
}

export function stopSound(soundName) {
  const sound = document.getElementById(soundName);
  audio_table[soundName].playing = false;
  sound.pause();
}

/**
 * @param {string} local
 * @param {string} audioName
 * @param {string} extension
 */
function createAudioElement(local, audioName, extension) {
  let newAudioElement = document.createElement("audio");
  newAudioElement.setAttribute("id", audioName);
  newAudioElement.setAttribute("src", `${local}${audioName}.${extension}`);
  return newAudioElement;
}

async function loadSoundLibJSON() {
  return await fetch("../src/soundLib.json").then(
    async (res) => await res.json(),
  );
}

export function audioBackEndInit() {
  window.soundLib = new AudioContext();
  loadSoundsIntoHTML();
  pageAudioContext();
  // testAudioPlayBack();
}
// audioBackEndInit();

function testAudioPlayBack() {
  playSound("bg-music-org");
  // console.table(audio_table);
  let x = setTimeout(() => {
    stopSound("bg-music-org");
    // console.table(audio_table);
    clearTimeout(x);
  }, 4000);
}
