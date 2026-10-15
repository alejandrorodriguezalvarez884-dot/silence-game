import { getLocales } from 'expo-localization';

import type { Sensitivity } from './game';

type Strings = {
  title: string;
  subtitle: string;
  playersTitle: string;
  namePlaceholder: string;
  add: string;
  removePlayer: (name: string) => string;
  teamHint: string;
  eliminationHint: string;
  durationTitle: string;
  minutes: (n: number) => string;
  sensitivityTitle: string;
  sensitivity: Record<Sensitivity, { label: string; caption: string }>;
  speakNames: string;
  start: string;
  record: (time: string) => string;
  countdownTitle: string;
  countdownHint: string;
  playingTitle: string;
  wakingTitle: string;
  timeLeft: string;
  playersLeft: (n: number) => string;
  pause: string;
  micDenied: string;
  micError: string;
  openSettings: string;
  back: string;
  caughtTitle: string;
  whoWasIt: string;
  falseAlarm: string;
  out: (name: string) => string;
  continue: string;
  pausedTitle: string;
  resume: string;
  end: string;
  teamWin: string;
  teamWinDetail: (time: string) => string;
  teamLose: string;
  teamLoseDetail: (time: string) => string;
  newRecord: string;
  winner: (names: string[]) => string;
  winnerDetail: (time: string) => string;
  playAgain: string;
  settings: string;
};

const list = (names: string[], and: string) =>
  names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} ${and} ${names[names.length - 1]}`;

const es: Strings = {
  title: 'El juego del silencio',
  subtitle: '¡Shhh! No despiertes al búho',
  playersTitle: 'Jugadores',
  namePlaceholder: 'Escribe un nombre',
  add: 'Añadir',
  removePlayer: (name) => `Quitar a ${name}`,
  teamHint: 'Sin nombres jugáis todos juntos contra el reloj. Añade dos o más para que el que haga ruido quede fuera.',
  eliminationHint: 'El que haga ruido queda fuera. Gana el último en silencio.',
  durationTitle: 'Duración',
  minutes: (n) => `${n} min`,
  sensitivityTitle: 'Oído del búho',
  sensitivity: {
    low: { label: 'Fino', caption: 'Coche, ruido de fondo' },
    medium: { label: 'Muy fino', caption: 'Casa' },
    high: { label: 'Finísimo', caption: 'Habitación en silencio' },
  },
  speakNames: 'Decir los nombres en voz alta',
  start: '¡A jugar!',
  record: (time) => `Récord de silencio: ${time}`,
  countdownTitle: 'Shhh… el búho se está durmiendo',
  countdownHint: 'Escuchando el ruido de fondo',
  playingTitle: 'El búho duerme',
  wakingTitle: '¡Cuidado, se despierta!',
  timeLeft: 'quedan',
  playersLeft: (n) => (n === 1 ? 'Queda 1 jugador' : `Quedan ${n} jugadores`),
  pause: 'Pausa',
  micDenied: 'El búho necesita el micrófono para oír el ruido. Actívalo en los ajustes del teléfono.',
  micError: 'No se pudo usar el micrófono.',
  openSettings: 'Abrir Ajustes',
  back: 'Volver',
  caughtTitle: '¡Ruido!',
  whoWasIt: '¿Quién ha sido?',
  falseAlarm: 'Nadie, seguir jugando',
  out: (name) => `¡${name} queda fuera!`,
  continue: 'Seguir',
  pausedTitle: 'Pausa',
  resume: 'Seguir',
  end: 'Terminar',
  teamWin: '¡Lo habéis conseguido!',
  teamWinDetail: (time) => `${time} de silencio total`,
  teamLose: '¡Se despertó el búho!',
  teamLoseDetail: (time) => `Aguantasteis ${time} en silencio`,
  newRecord: '¡Nuevo récord!',
  winner: (names) => (names.length === 1 ? `¡${names[0]} gana!` : `¡Ganan ${list(names, 'y')}!`),
  winnerDetail: (time) => `Tras ${time} de silencio`,
  playAgain: 'Otra vez',
  settings: 'Ajustes',
};

const en: Strings = {
  title: 'The Silence Game',
  subtitle: 'Shhh! Don’t wake the owl',
  playersTitle: 'Players',
  namePlaceholder: 'Type a name',
  add: 'Add',
  removePlayer: (name) => `Remove ${name}`,
  teamHint: 'With no names everyone plays together against the clock. Add two or more and whoever makes a noise is out.',
  eliminationHint: 'Whoever makes a noise is out. The last one silent wins.',
  durationTitle: 'Length',
  minutes: (n) => `${n} min`,
  sensitivityTitle: 'Owl’s hearing',
  sensitivity: {
    low: { label: 'Good', caption: 'Car, background noise' },
    medium: { label: 'Sharp', caption: 'Home' },
    high: { label: 'Super sharp', caption: 'Quiet room' },
  },
  speakNames: 'Say names out loud',
  start: 'Let’s play!',
  record: (time) => `Silence record: ${time}`,
  countdownTitle: 'Shhh… the owl is falling asleep',
  countdownHint: 'Listening to the background noise',
  playingTitle: 'The owl is asleep',
  wakingTitle: 'Careful, it’s waking up!',
  timeLeft: 'left',
  playersLeft: (n) => (n === 1 ? '1 player left' : `${n} players left`),
  pause: 'Pause',
  micDenied: 'The owl needs the microphone to hear noise. Turn it on in your phone settings.',
  micError: 'Could not use the microphone.',
  openSettings: 'Open Settings',
  back: 'Back',
  caughtTitle: 'Noise!',
  whoWasIt: 'Who was it?',
  falseAlarm: 'Nobody, keep playing',
  out: (name) => `${name} is out!`,
  continue: 'Keep going',
  pausedTitle: 'Paused',
  resume: 'Resume',
  end: 'End game',
  teamWin: 'You did it!',
  teamWinDetail: (time) => `${time} of total silence`,
  teamLose: 'The owl woke up!',
  teamLoseDetail: (time) => `You lasted ${time} in silence`,
  newRecord: 'New record!',
  winner: (names) => (names.length === 1 ? `${names[0]} wins!` : `${list(names, 'and')} win!`),
  winnerDetail: (time) => `After ${time} of silence`,
  playAgain: 'Play again',
  settings: 'Settings',
};

const locale = getLocales()[0];

export const t: Strings = locale?.languageCode === 'es' ? es : en;

export const speechLanguage = locale?.languageCode === 'es' ? (locale.languageTag ?? 'es-ES') : 'en-US';
