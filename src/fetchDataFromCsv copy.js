const electron = require('electron')
const login = require('./login.js');
const csv = require('csvtojson');
const fs = require("fs");
const userDataPath = (electron.app || electron.remote.app).getPath('userData')
// const csvFilePath = userDataPath + '/Accounts.csv';
// const settingsFilePath = userDataPath + '/Settings.csv';
// const proxiesFilePath = userDataPath + '/Proxies.txt';
const csvFilePath = './Accounts.csv';
const settingsFilePath = './Settings.csv';
const proxiesFilePath = './Proxies.txt';

async function fetchDataFromCsv() {
    let accountsArray = await csv()
        .fromFile(csvFilePath)
        .then(async (jsonObj) => {
            return jsonObj
        })

    let randomAccounts = []

    let settingsArray = await csv()
        .fromFile(settingsFilePath)
        .then(async (jsonObj) => {
            return jsonObj
        })

    if (accountsArray.length > settingsArray[0].NO_OF_ACCOUNTS) {
        do {
            randomAccounts[randomAccounts.length] = accountsArray.splice(
                Math.floor(Math.random() * accountsArray.length)
                , 1)[0];
        } while (randomAccounts.length < settingsArray[0].NO_OF_ACCOUNTS);
    } else {
        randomAccounts = accountsArray
    }

    let array = fs.readFileSync(proxiesFilePath).toString().split("\n");
    let proxiesArray = []

    for (let i = 0; i < array.length; i++) {
        let string = array[i].replace('\r', '');
        proxiesArray.push(string)
    }

    await openInstagram(randomAccounts, settingsArray[0], proxiesArray)
}

async function openInstagram(accountsArray, settings, proxiesArray) {
    let browserNum = Number(settings.NO_OF_BROWSERS)
    var accountsNum = []
    if(browserNum<=accountsArray.length){
        for (let i = 1; i <= accountsArray.length; i++) {
            accountsNum.push(accountsArray[i-1])
            if(i%browserNum==0 || i==accountsArray.length.toString()){
                await activeBrowsers(accountsNum, settings, proxiesArray);
                accountsNum = []
            }
        }
    }else{
        await activeBrowsers(accountsArray, settings, proxiesArray);
    }
}

async function activeBrowsers(accountsArray, settings, proxiesArray) {
    for (let i = 0; i < accountsArray.length; i++) {

        let proxyObject = {}
        if (proxiesArray[0] !== '') {
            let randomIndex = Math.floor(Math.random() * proxiesArray.length);
            let randomProxy = proxiesArray[randomIndex];
            let randomProxyArray = randomProxy.split(':')

            proxyObject = {
                ip: randomProxyArray[0],
                port: randomProxyArray[1],
                username: randomProxyArray[2],
                password: randomProxyArray[3]
            }
        }

        login(accountsArray[i], settings, proxyObject);
    }
}

module.exports = fetchDataFromCsv;
