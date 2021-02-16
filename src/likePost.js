const delay = require('./delay.js');
const fetchAccounts = require('./fetchAccounts.js');
// async function updateStatus(account){
//     data = {
//         "amount": 2,
//         "id": account.id
//     }
//     console.log('DATA : ',data)
//     console.log('STATUS : ',status)
//     try {
//         await fetchAccounts('addPayment', data, url, apiKey)
//     } catch (error) {
//         console.log('ERROR In Update Status ')
//         console.log(error.toString())
//     }
// }
async function likePost(page, NEWOBJ) {
    try {
        if(NEWOBJ.POST === "")
            return

        await page.goto(NEWOBJ.POST, {waitUntil: 'domcontentloaded'})
        await delay(5000)

        var stats = await page.evaluate(() => {
            let allButtons = document.querySelectorAll('svg');
            if(allButtons[1].getAttribute('fill') === "#262626"){
                allButtons[1].parentElement.click()
                var stat = 'success'
            } else {
                var stat = 'failure'
            }
            return stat
        })
        return stats
    } catch (e) {
        console.log('LIKEPOST')
        console.log(e.message)
        page.evaluate(async () => {
            alert("Some error has occurred. Please restart the program.");
        })
    }
}

module.exports = likePost;
