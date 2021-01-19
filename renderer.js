// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

// const players = {
//   72371: { // new player row
//     id: 72371,
//     name: 'Justin',
//     ftp: 302, // Watts
//     maxHR: 194, // bpm
//     weight: 81, // kg
//     distance: 12475, // who knows...
//     power: 100, // watts
//     heartrate: 156, // bpm
//     powerHistory: [],
//   },
//   703915: { // new player row
//     id: 703915,
//     name: 'Justin',
//     ftp: 302, // Watts
//     maxHR: 194, // bpm
//     weight: 81, // kg
//     distance: 12475, // who knows...
//     power: 250, // watts
//     heartrate: 156, // bpm
//     powerHistory: [],
//   },
//   703916: { // new player row
//     id: 703916,
//     name: 'Justin',
//     ftp: 302, // Watts
//     maxHR: 194, // bpm
//     weight: 81, // kg
//     distance: 12475, // who knows...
//     power: 300, // watts
//     heartrate: 156, // bpm
//     powerHistory: [],
//   },
//   703917: { // new player row
//     id: 703917,
//     name: 'Justin',
//     ftp: 302, // Watts
//     maxHR: 194, // bpm
//     weight: 81, // kg
//     distance: 12475, // who knows...
//     power: 350, // watts
//     heartrate: 156, // bpm
//     powerHistory: [],
//   },
//   703918: { // new player row
//     id: 703918,
//     name: 'Justin',
//     ftp: 302, // Watts
//     maxHR: 194, // bpm
//     weight: 81, // kg
//     distance: 12475, // who knows...
//     power: 400, // watts
//     heartrate: 156, // bpm
//     powerHistory: [],
//   },
//   703919: { // new player row
//     id: 703919,
//     name: 'Justin',
//     ftp: 302, // Watts
//     maxHR: 194, // bpm
//     weight: 81, // kg
//     distance: 12475, // who knows...
//     power: 6000, // watts
//     heartrate: 156, // bpm
//     powerHistory: [],
//   },
// }

const players = {};

const ZONE_BG_COLOR = {
  1: 'LightGrey',
  2: 'CornflowerBlue',
  3: 'Gold',
  4: 'DarkOrange',
  5: 'Red',
  6: 'DarkRed',
}

const ZONE_FONT_COLOR = {
  1: 'Black',
  2: 'Black',
  3: 'Black',
  4: 'White',
  5: 'White',
  6: 'White',
}

const POWER_ZONES = {
  1: .76,
  2: .9,
  3: 1.05,
  4: 1.25,
  5: 1.5,
}

const HR_ZONES = {
  1: .6,
  2: .7,
  3: .8,
  4: .88,
  5: .95,
}

const config = {
  footerVisible: true,
  maxPowerHistory: 50,
  powerDuration: 1,
  shareData: true,
  maxBufferSize: 10,
  url: 'http://zwift.jsteigs642.com/api/stats',
  start: new Date().toISOString(),
  session: Math.round(Math.random() * 1000000000),
}

const EVENT_BUFFER = [];

function getHRZone(player) {
  const maxHR = player.maxHR;
  const hr = player.heartrate;
  if (maxHR && hr) {
    for (const zone in HR_ZONES) {
      if (hr < maxHR * HR_ZONES[zone]) {
        return zone;
      }
    }
    return 6;
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
    return 6;
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
  const powerZone = getPowerZone(player);
  const hrZone = getHRZone(player);
  playerData.querySelectorAll('.power-split').forEach((el, i) => {
    el.style = `background-color: ${ZONE_BG_COLOR[powerZone]}; color: ${ZONE_FONT_COLOR[powerZone]};`;
  });
  playerData.querySelector('.hr').textContent = player.heartrate ? player.heartrate : '--';
  playerData.querySelector('.hr').style = `background-color: ${ZONE_BG_COLOR[hrZone]}; color: ${ZONE_FONT_COLOR[hrZone]};`;
}

async function addPlayer(playerId) {
  await setPlayerZPData(playerId);
  const playerData = document.getElementById('template-player-data').content.cloneNode(true);
  playerData.querySelector('.player-data-row').id = `player-data-${playerId}`;
  document
    .querySelector('.player-table .player-data-content')
    .append(playerData);
  setPlayerTableData(playerId);
}

Object.keys(players).forEach(addPlayer);

async function sendData(data) {
  const postData = {
    team: config.team,
    startDate: config.start,
    session: config.session,
    data: data,
  }
  return await fetch(config.url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData) // body data type must match "Content-Type" header
  });
}

function shareData(playerState) {
  EVENT_BUFFER.push(playerState);
  if (EVENT_BUFFER.length > config.maxBufferSize) {
    const data = []
    while (EVENT_BUFFER.length > 0) {
      data.push(EVENT_BUFFER.shift());
    }
    sendData(data);
  }
}

function updatePlayer(playerState) {
  if (playerState.id in players) {
    if (config.shareData) {
      shareData(playerState);
    }
    const player = players[playerState.id];
    player.powerHistory.push(playerState.power);
    if (player.powerHistory.length > config.maxPowerHistory) {
      player.powerHistory.shift();
    }
    const powers = player.powerHistory.slice(Math.max(player.powerHistory.length - config.powerDuration, 0));
    const powerTotal = powers.reduce((a, b) => a + b, 0);
    player.power = Math.round(powerTotal / powers.length);
    player.heartrate = playerState.heartrate;
    player.distance = playerState.distance;
    setPlayerTableData(playerState.id);
  }
};

window.zwiftData.on('outgoingPlayerState', (playerState, serverWorldTime) => {
  updatePlayer(playerState);
});

window.zwiftData.on('incomingPlayerState', (playerState, serverWorldTime) => {
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
      name: playerName,
      powerHistory: [],
    }
    await addPlayer(playerId);
    nameInput.value = '';
    idInput.value = '';
  }
});

const footerToggle = document.querySelector('.footer-toggle')
footerToggle.addEventListener('click', () => {
  const footer = document.querySelector('.player-data-footer');
  if (config.footerVisible) {

    config.footerVisible = false;
    footerToggle.textContent = '+';
    footer.style = 'display: none';
  } else {
    config.footerVisible = true;
    footerToggle.textContent = '-';
    footer.style = '';
  }
});

function handlePowerSelector(duration) {
  config.powerDuration = duration;
}

document.querySelectorAll('input[name=power]').forEach((el, i) => {
  const duration = el.value;
  el.addEventListener('click', () => handlePowerSelector(duration));
});

const shareDataInput = document.querySelector('input[name=share-data]')
shareDataInput.addEventListener('click', () => {
  config.shareData = shareDataInput.checked;
});

const teamInput = document.querySelector('input[name=team-name]')
teamInput.addEventListener('onBlur', () => {config.team = teamInput.value});

// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }
//
// async function mockPlayerData() {
//   const states = [
//     {
//       id: 72371,
//       power: 250,
//       heartrate: 145,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 290,
//       heartrate: 160,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 310,
//       heartrate: 160,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 350,
//       heartrate: 165,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 400,
//       heartrate: 170,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 800,
//       heartrate: 180,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 1000,
//       heartrate: 190,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 1000,
//       heartrate: 195,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 100,
//       heartrate: 190,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 100,
//       heartrate: 185,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 100,
//       heartrate: 175,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 100,
//       heartrate: 170,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 250,
//       heartrate: 145,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 290,
//       heartrate: 160,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 310,
//       heartrate: 160,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 350,
//       heartrate: 165,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 400,
//       heartrate: 170,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 800,
//       heartrate: 180,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 1000,
//       heartrate: 190,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 1000,
//       heartrate: 195,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 100,
//       heartrate: 190,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 100,
//       heartrate: 185,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 100,
//       heartrate: 175,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 100,
//       heartrate: 170,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 250,
//       heartrate: 145,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 290,
//       heartrate: 160,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 310,
//       heartrate: 160,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 350,
//       heartrate: 165,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 400,
//       heartrate: 170,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 800,
//       heartrate: 180,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 1000,
//       heartrate: 190,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 1000,
//       heartrate: 195,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 100,
//       heartrate: 190,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 100,
//       heartrate: 185,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 100,
//       heartrate: 175,
//       distance: 100,
//     },
//     {
//       id: 72371,
//       power: 100,
//       heartrate: 170,
//       distance: 100,
//     },
//   ]
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
//   await sleep(1000);
//   for (const i in states) {
//     const state = states[i];
//     updatePlayer(state);
//     await sleep(1000);
//   }
// }

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
