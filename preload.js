const ip = require('ip');
const ZwiftPacketMonitor = require('@zwfthcks/zwift-packet-monitor');
// const ZwiftPacketMonitor = require('./ZwiftPacketMonitor');

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
});

var Cap = require('cap').Cap;
var decoders=require('cap').decoders, PROTOCOL=decoders.PROTOCOL

// Create data monitor
const ipAddress = ip.address();
console.log(ipAddress);
window.zwiftData = new ZwiftPacketMonitor(ipAddress);
window.zwiftData.start();
console.log('Started Zwift monitor');
