// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
var ipcRenderer = require('electron').ipcRenderer;

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  } 
  
  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
  
  ipcRenderer.on('system-status', (event, data) => {
    console.log('hiii');
    var lagele = document.getElementById('status').innerHTML = data;
  })

})
