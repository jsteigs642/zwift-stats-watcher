// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const players = {
  // 703914: { // new player row
  //   id: 703914,
  //   name: 'Justin',
  //   ftp: 302, // Watts
  //   maxHR: 194, // bpm
  //   weight: 81, // kg
  //   distance: 12475, // who knows...
  //   power: 200, // watts
  //   heartrate: 156, // bpm
  // }
}

const ZONE_COLOR = {
  1: 'LightGrey',
  2: 'Blue',
  3: 'Gold',
  4: 'DarkOrange',
  5: 'Red',
}

const POWER_ZONES = {
  1: .76,
  2: .9,
  3: 1.05,
  4: 1.25,
}

const HR_ZONES = {
  1: .6,
  2: .7,
  3: .8,
  4: .93,
}

function getHRZone(player) {
  const maxHR = player.maxHR;
  const hr = player.heartrate;
  if (maxHR && hr) {
    for (const zone in HR_ZONES) {
      if (hr < maxHR * HR_ZONES[zone]) {
        return zone;
      }
    }
    return 5;
  }
  return 1;
}

function getPowerZone(player) {
  const ftp = player.ftp;
  const power = player.power;
  if (ftp && power) {
    for (const zone in POWER_ZONES) {
      if (power < ftp * POWER_ZONES[zone]) {
        return zone;
      }
    }
    return 5;
  }
  return 1;
}

async function setPlayerZPData(playerId) {
  try {
    const resp = await fetch(`https://www.zwiftpower.com/cache3/profile/${playerId}_all.json`).then(r => r.json());
    if (resp) {
      const data = resp.data;
      data.sort((a, b) => b.event_date - a.event_date) // most recent event first
      players[playerId].ftp = data[0].ftp;
      players[playerId].weight = data[0].weight[0];
      const hrs = data.map((race) => {
        return race.max_hr[0];
      });
      players[playerId].maxHR = Math.max(...hrs);
    }
  } catch (error) {
    console.log(error.response);
  }
}

function setPlayerTableData(playerId) {
  const player = players[playerId];
  const playerData = document.getElementById(`player-data-${playerId}`);
  playerData.querySelector('.name').textContent = player.name;
  playerData.querySelector('.power-watts').textContent = player.power ? player.power : '--';
  playerData.querySelector('.power-wkg').textContent = player.weight && player.power ? (player.power / player.weight).toFixed(1) : '--';
  playerData.querySelectorAll('.power-split').forEach((el, i) => {
    el.style = `background-color: ${ZONE_COLOR[getPowerZone(player)]};`;
  });

  playerData.querySelector('.hr').textContent = player.heartrate ? player.heartrate : '--';
  playerData.querySelector('.hr').style = `background-color: ${ZONE_COLOR[getHRZone(player)]};`;
}

async function addPlayer(playerId) {
  await setPlayerZPData(playerId);
  const playerData = document.getElementById('template-player-data').content.cloneNode(true);
  playerData.querySelector('.player-data').id = `player-data-${playerId}`;
  document
    .querySelector('#player-data tbody')
    .append(playerData);
  setPlayerTableData(playerId);
}

Object.keys(players).forEach(addPlayer);

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
  console.log(playerState);
  updatePlayer(playerState);
});

window.zwiftData.on('incomingPlayerState', (playerState, serverWorldTime) => {
  // console.log(playerState.id);
  updatePlayer(playerState);
});

document.querySelector('button.add-player').addEventListener('click', async () => {
  const nameInput = document.querySelector('input[name=player-name]');
  const idInput = document.querySelector('input[name=zwift-id]');
  const playerName = nameInput.value;
  const playerId = parseInt(idInput.value);
  if (playerName && playerId) {
    players[playerId] = {
      id: playerId,
      name: playerName
    }
    await addPlayer(playerId);
    nameInput.value = '';
    idInput.value = '';
  }
});

// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }
//
// async function mockPlayerData() {
//   const stats = [
//     [250, 145],
//     [290, 160],
//     [310, 160],
//     [350, 165],
//     [400, 170],
//     [800, 180],
//     [1000, 190],
//     [100, 190],
//     [100, 185],
//     [100, 175],
//     [100, 170],
//   ];
//   for (const i in powers) {
//     const item = stats[i];
//     const player = players[72371];
//     player.power = item[0];
//     player.heartrate = item[1];
//     setPlayerTableData(72371);
//     console.log(item);
//     await sleep(1000);
//   }
// }
//
// mockPlayerData();

// PlayerState {
//   id: 72371,
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
