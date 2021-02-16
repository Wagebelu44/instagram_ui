const electron = require('electron')
const login = require('./login.js');
const csv = require('csvtojson');
const fs = require("fs");
const delay = require('./delay.js');
const fetchAccounts = require('./fetchAccounts.js');
const userDataPath = (electron.app || electron.remote.app).getPath('userData')
// const csvFilePath = userDataPath + '/Accounts.csv';
// const settingsFilePath = userDataPath + '/Settings.csv';
// const proxiesFilePath = userDataPath + '/Proxies.txt';
const csvFilePath = './Accounts.csv';
const settingsFilePath = './Settings.csv';
const proxiesFilePath = './Proxies.txt';



async function updateStatus(status, order, count=0){
    data = {
        orders:[{
            id: order.id,
            status: status,
            count: count,
            remains: Number(order.quantity) - count
        }]
    }
    console.log('DATA : ',data)
    console.log('STATUS : ',status)
    var urlu = "https://snssupporter.com/adminapi/v1"
    var apikeyu = "btetzrqkymw6b69uf4u8zywb2ahgnnrjj8hyk8y28rtw0hqn0ai55uymaykhppok"
    try {
        await fetchAccounts('updateOrders', data, urlu, apikeyu)
    } catch (error) {
        console.log('ERROR In Update Status ')
        console.log(error.toString())
    }
}

async function fetchData(order) {
    // const remote = electron.remote
    // // try {
    // var mainWindow = remote.getGlobal('mainWindow')
    // // } catch (error) {}
    var quantity = Number(order.quantity)
    let accountsArray = await csv()
        .fromFile(csvFilePath)
        .then(async (jsonObj) => {
            return jsonObj
        })

    console.log('STARTED with : ',order)

    let randomAccounts = []

    let settingsArray = await csv()
        .fromFile(settingsFilePath)
        .then(async (jsonObj) => {
            return jsonObj
        })

    // if(order.link.indexOf('/p/')!=-1){
    settingsArray[0]['POST'] = order.link
    // } else {
    //     settingsArray[0]['USER'] = order.link
    // }
    settingsArray[0]["order"] = order
    settingsArray[0]["counter"] = {id:order.id, count:0}

    // settingsArray[0]['NO_OF_ACCOUNTS'] = order.quantity

    if (accountsArray.length > quantity) {
        console.log('We got ', accountsArray.length)
        do {
            randomAccounts[randomAccounts.length] = accountsArray.splice(
                Math.floor(Math.random() * accountsArray.length)
                , 1)[0];
        } while (randomAccounts.length < quantity);
    } else if(accountsArray.length == quantity) {
        console.log('ELIF Got ', accountsArray.length)
        randomAccounts = accountsArray
    } else {
        console.log('Else got ', accountsArray.length)
        updateStatus('Insufficient Accounts', order)
        global.mainWindow.webContents.send('system-status', 'Insufficient Accounts')
        isLoaded = []
    }

    let array = fs.readFileSync(proxiesFilePath).toString().split("\n");
    let proxiesArray = []

    for (let i = 0; i < array.length; i++) {
        let string = array[i].replace('\r', '');
        proxiesArray.push(string)
    }
    global.mainWindow.webContents.send('system-status', 'ORDER '+order.id+'<br> Status : Started')
    var successCount = await openInstagram(randomAccounts, settingsArray[0], proxiesArray)
    console.log('\n\n\nThis is Success Count : ', successCount)
    isLoaded = []
    if (successCount==0){
        await updateStatus('Canceled', order, successCount)
        global.mainWindow.webContents.send('system-status', 'No Accounts Followed')
        return 'Failure'
    } else if (successCount==quantity){
        await updateStatus('Completed', order, successCount)
        global.mainWindow.webContents.send('system-status', 'Completed')
        return 'Success'
    } else {
        await updateStatus('partial', order, successCount)
        global.mainWindow.webContents.send('system-status', 'Partially Completed')
        return 'Success'
    }
}
async function openInstagram(accountsArray, settings, proxiesArray) {
    global.isRunning = 0
    global.isCounting = 0
    // console.log(successCount, " Entered ", settings.order)
    for (var i = 0; i < accountsArray.length; i++) {

        var browserNum = Number(settings.NO_OF_BROWSERS)
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

        if(global.isRunning<browserNum){
            global.isRunning = global.isRunning+1
            global.isCounting = global.isCounting+1
            if(i<accountsArray.length-1){
                console.log(i+1, " - ", accountsArray[i])
                login(accountsArray[i], settings, proxyObject);
            } else if (i==accountsArray.length-1){
                console.log('Finalize ', i, " - ", settings.order)
                await login(accountsArray[i], settings, proxyObject);
            }
        } else {
            await delay(3000)
            i = i-1
        }
    }
    return global.isCounting
}


var isCompleted = []
var isLoaded = []
// var minutes = 5,
//     the_interval = 4 * 1000;

    // setInterval(async function() {
async function fetchDataFromCsv(){
    console.log('PROCESS INITIATED')
    global.mainWindow.webContents.send('system-status', 'PROCESS INITIATED')

    while(isCompleted.length == 0){
        await delay(3000)
        try {
            if(isCompleted.length == 0){
                global.mainWindow.webContents.send('system-status', 'getOrders INITIATED')
                var getOrdersAPI = await fetchAccounts('getOrders', {}, "https://snssupporter.com/adminapi/v1", "btetzrqkymw6b69uf4u8zywb2ahgnnrjj8hyk8y28rtw0hqn0ai55uymaykhppok")
            } else {
                global.mainWindow.webContents.send('system-status', '')
            }
            if (getOrdersAPI.status == 'success') {
                if(getOrdersAPI.orders.length>0){
                    console.log(getOrdersAPI.orders.length)
                    var getOrders = getOrdersAPI.orders
                    for (var order=0; order < getOrders.length; order++) {
                        if (isCompleted.indexOf(getOrders[order].id) == -1 && isLoaded.length<1) {
                            isLoaded.push(getOrders[order].id)
                            isCompleted.push(getOrders[order].id)
                            await updateStatus('processing', getOrders[order])
                            var stat = await fetchData(getOrders[order])
                            console.log(stat,' ',order.id)
                        } else if(isCompleted.length!=getOrders.length){
                            console.log(' ELIF ')
                            order = order-1
                        } else {
                            console.log('Else')
                            console.log(' Iteration Completed... \n\n Looking for next List of Orders...')
                            global.mainWindow.webContents.send('system-status', 'Iteration Complete <br> Click Login for newOrders')
                            await delay(5000)
                            isCompleted = []
                        }
                    }
                    if(isCompleted.length==getOrders.length){
                        isCompleted = []
                    }
                } else {
                    console.log('NO ORDERS')
                    console.log(getOrdersAPI)
                }
            } else {
                if(getOrdersAPI)
                global.mainWindow.webContents.send('system-status', 'Status : '+getOrdersAPI.status+'<br> Error : '+getOrdersAPI.error)
                else 
                global.mainWindow.webContents.send('system-status', ' INITIATED')
                console.log('No success ')
                console.log(getOrdersAPI)
            }
            // console.log('Leaving Scope')
        } catch (err) {
            console.log(err.message)
            global.mainWindow.webContents.send('system-status', 'API unresponsive')
            console.log('API UNRESPONSIVE \n\n Retrying...')
            await delay(5000)
        }
    }
}

// }, the_interval);

module.exports = fetchDataFromCsv;
