// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const players = {
  1441367: { // new player row
    id: 1441367,
    name: 'fake name 1',
    distance: 12475,
    power: 200,
    heartrate: 156,
  },
  696358: { // new player row
    id: 696358,
    name: 'fake name 2',
    distance: 12474,
    power: 180,
    heartrate: 165,
  },
  286609: { // new player row
    id: 286609,
    name: 'fake name 3',
    distance: 12474,
    power: 180,
    heartrate: 165,
  },
  436482: { // new player row
    id: 436482,
    name: 'fake name 4',
    distance: 12474,
    power: 180,
    heartrate: 165,
  },
  94821: { // new player row
    id: 94821,
    name: 'fake name 5',
    distance: 12474,
    power: 180,
    heartrate: 165,
  },
  2897693: { // new player row
    id: 2897693,
    name: 'fake name 6',
    distance: 12474,
    power: 180,
    heartrate: 165,
  }
}

// 2401253
// renderer.js:58 78957
// renderer.js:58 340456
// renderer.js:58 2926529
// renderer.js:58 3233042
// renderer.js:58 383411
// renderer.js:58 1496840
// renderer.js:58 436482
// renderer.js:58 94821
// renderer.js:58 1344555
// renderer.js:58 429749
// renderer.js:58 1094589

// 930448
// renderer.js:100 13064
// renderer.js:100 964105
// renderer.js:100 2897693
// renderer.js:100 666826
// renderer.js:100 108766
// renderer.js:100 696358
// renderer.js:100 521196
// renderer.js:100 2166008
// renderer.js:100 295964
// renderer.js:100 282773
// renderer.js:100 41870

function setPlayerTableData(playerId) {
  const player = players[playerId];
  const playerData = document.getElementById(`player-data-${playerId}`);
  playerData.querySelector('.name').textContent = player.name;
  playerData.querySelector('.power').textContent = player.power;
  playerData.querySelector('.hr').textContent = player.heartrate;
}

Object.keys(players).forEach((playerId, i) => {
  const player = players[playerId];
  const playerData = document.getElementById('template-player-data').content.cloneNode(true);
  playerData.querySelector('.player-data').id = `player-data-${playerId}`;
  document
    .getElementById('player-data')
    .append(playerData);
  setPlayerTableData(playerId);
});

function updatePlayer(playerState) {
  if (playerState.id in players) {
    const player = players[playerState.id];
    player.power = playerState.power;
    player.heartrate = playerState.heartrate;
    player.distance = playerState.distance;
    setPlayerTableData(playerState.id);
  }
};

window.zwiftData.on('outgoingPlayerState', (playerState, serverWorldTime) => {
  updatePlayer(playerState);
});

window.zwiftData.on('incomingPlayerState', (playerState, serverWorldTime) => {
  console.log(playerState.id);
  updatePlayer(playerState);
});

// PlayerState {
//   id: 423578,
//   worldTime: Long { low: 323773601, high: 45, unsigned: false },
//   distance: 12475,
//   roadTime: 98795,
//   laps: 0,
//   speed: 39066668,
//   roadPosition: 9746445,
//   cadenceUHz: 1264414,
//   heartrate: 126,
//   power: 183,
//   heading: Long { low: 3474317, high: 0, unsigned: false },
//   lean: 1003924,
//   climbing: 19,
//   time: 1105,
//   f19: 637927442,
//   f20: 16797967,
//   progress: 0,
//   justWatching: 0,
//   calories: 61273,
//   x: 30045.130859375,
//   altitude: 11641.2734375,
//   y: 500580.71875,
//   watchingRiderId: 423578,
//   groupId: 0,
//   sport: Long { low: 0, high: 0, unsigned: false },
//   f34: 39466048
// }
