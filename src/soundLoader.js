export const audio_table = {};

export async function loadSoundsIntoHTML() {
  const soundSectionName = '#audio-lib';

  let audioSection = document.createElement('section');
  audioSection.setAttribute('id', soundSectionName);

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

export function playSound(soundName) {
  const sound = document.getElementById(soundName);
  audio_table[soundName].playing = true;
  sound.play();
}

export function stopSound(soundName) {
  const sound = document.getElementById(soundName);
  audio_table[soundName].playing = false;
  sound.pause();
}

/**
 * @param local {string}
 * @param audioName {string}
 * @param extension {string}
 */
function createAudioElement(local, audioName, extension) {
  let newAudioElement = document.createElement('audio');
  newAudioElement.setAttribute('id', audioName);
  newAudioElement.setAttribute('src', `${local}${audioName}.${extension}`);
  return newAudioElement;
}

async function loadSoundLibJSON() {
  return await fetch('../src/soundLib.json').then(
    async (res) => await res.json()
  );
}

export async function audioBackEndInit() {
  window.soundLib = new AudioContext();
  await loadSoundsIntoHTML();
  pageAudioContext();
  // testAudioPlayBack();
}
// audioBackEndInit();

function testAudioPlayBack() {
  playSound('bg-music-org');
  // console.table(audio_table);
  let x = setTimeout(() => {
    stopSound('bg-music-org');
    // console.table(audio_table);
    clearTimeout(x);
  }, 4000);
}
window.soundLib = new AudioContext();
