const viewPort = {width: 1366, height: 768};
const puppeteer = require('puppeteer');
const delay = require('./delay.js');
const likePost = require('./likePost.js');
const followUser = require('./followUser.js');
const fetchAccounts = require('./fetchAccounts.js');
// const url = "https://likepang.com/adminapi/v1"
// const apiKey = "q6o47zgu7ta3cijcwnd35s15pcppwl01eykcfe7km9r686h9nkdl6emuo8km3f5c"

async function updateStatus(status, order){
    data = {
        orders:[{
            id: order.id,
            status: status
        }]
    }
    var urlu = "https://snssupporter.com/adminapi/v1"
    var apikeyu = "btetzrqkymw6b69uf4u8zywb2ahgnnrjj8hyk8y28rtw0hqn0ai55uymaykhppok"
    console.log('order with status : ',data)
    console.log('STATUS : ',status)
    try {
        await fetchAccounts('updateOrders', data, urlu, apikeyu)
    } catch (error) {
        console.log("login Update Error")
    }
}

async function likePangStatus(account){
    data = {
        "username": account.id,
        "amount": 2
    }
    var url1 = "https://likepang.com/adminapi/v1"
    var apikey = "q6o47zgu7ta3cijcwnd35s15pcppwl01eykcfe7km9r686h9nkdl6emuo8km3f5c" 
    console.log('DATA : ',data)
    console.log('STATUS : ','likePang')
    try {
        await fetchAccounts('addPayment', data, url1 , apikey)
    } catch (error) {
        console.log('ERROR In likePangStatus ')
        console.log(error.toString())
    }
}

async function login(CSVOBJ, NEWOBJ, PROXYOBJ) {
    let options = {
        headless: false,
        args: ['--headless']
    }

    if (!(Object.keys(PROXYOBJ).length === 0 && PROXYOBJ.constructor === Object)) {
        options.args = ['--proxy-server=' + PROXYOBJ.ip + ':' + PROXYOBJ.port]
    }
    NEWOBJ['id'] = CSVOBJ.likepang_id

    const browser = await puppeteer.launch(options);
    // global.isRunning+=1
    let page = await browser.newPage();
    updateStatus('in progress', NEWOBJ.order)
    if (PROXYOBJ.username !== undefined && PROXYOBJ.password !== undefined) {
        await page.authenticate({
            username: PROXYOBJ.username,
            password: PROXYOBJ.password
        });
    }

    try {
        await page.setViewport(viewPort);
        await delay(1000)
        await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle0' })
            .catch(async function () {
                page.evaluate(async () => {
                    // alert("Some error has occurred. Please restart the program.");
                })
            });

        await delay(2000);
        // await page.waitForNavigation({ waitUntil: "networkidle0" })

        var popup = await page.evaluate(() => {
            let popupButtons = document.querySelectorAll('div[role="dialog"] button')

            if(popupButtons.length > 0){
                popupButtons[0].click()
                return true
            } else {
                return false
            }
        })

        // await delay(1000)

        if(popup)
        await page.waitForNavigation({ waitUntil: "networkidle0" })

        await page.type('input[name="username"]', CSVOBJ.EMAIL, {delay: 50})

        await delay(3000);

        await page.type('input[name="password"]', CSVOBJ.PASSWORD, {delay: 50})

        await delay(3000);

        let loginButton = await page.$('button[type="submit"]')
        await delay(2000)
        await loginButton.click()

        await delay(5000)

        let errorCheck = await page.$('#slfErrorAlert')
        await delay(2000)

        if (errorCheck) {
            await page.evaluate(async () => {
                alert("Unable to login, please check your username and password.");
            })
            await browser.close()
            global.isRunning = global.isRunning - 1
            global.isCounting = global.isCounting - 1

        } else {
            // await page.waitForNavigation({ waitUntil: "networkidle0" })

            await page.waitForSelector('img[data-testid="user-avatar"]')

            let userAvatar = await page.$('img[data-testid="user-avatar"]')
            await delay(2000)

            if (userAvatar) {
                var likeStat = await likePost(page, NEWOBJ)
                if(likeStat == 'success'){
                    await likePangStatus(NEWOBJ)
                } else if(likeStat == 'failure'){
                    global.isCounting = global.isCounting - 1
                } else {

                }
                await delay(3000)
                // await followUser(page, NEWOBJ)
                await delay(3000)
                await browser.close()
                global.isRunning = global.isRunning - 1
            } else {
                await page.evaluate(async () => {
                    alert("Unable to login, please check your username and password.");
                })
                await browser.close()
                global.isCounting = global.isCounting - 1
                global.isRunning = global.isRunning - 1
            }
        }
    } catch (e) {
        console.log('THIS IS THE REASON')
        console.log(e.message)
        page.evaluate(async () => {
            alert("Some error has occurred. Please restart the program.");
        })
        await browser.close()
        global.isCounting = global.isCounting - 1
        global.isRunning = global.isRunning - 1
    }
}

module.exports = login;
