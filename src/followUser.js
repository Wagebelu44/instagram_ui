const delay = require('./delay.js');

async function followUser(page, NEWOBJ) {
    try {
        if (NEWOBJ.USER === "")
            return

        await page.goto(NEWOBJ.USER, {waitUntil: 'domcontentloaded'})
        await delay(5000)

        await page.evaluate(() => {
            let allButtons = document.querySelectorAll('header button');
            if (allButtons.length === 3){
                allButtons[0].click()
                // allButtons[1].click()
            }
        })
    } catch (e) {
        console.log(e.message)
        page.evaluate(async () => {
            alert("Some error has occurred. Please restart the program.");
        })
    }
}

module.exports = followUser;
