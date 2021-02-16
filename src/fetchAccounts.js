const Request = require('request');

async function request_update_post(dataObject, apiurl) {
    try {
        return new Promise(function(resolve, reject) {
            Request.post({
                    "headers": { "content-type": "application/json" },
                    "url": apiurl,
                    "body": JSON.stringify(dataObject)
                },
                (error, response, body) => {
                    if (error) {
                        resolve({ send: error })
                    } else {
                        resolve(JSON.parse(body))
                    }
                }
            );
        })
    } catch (err) {}
}

async function fetchAccounts(action, data1={}, url, key ) {
    
    data = {
        key: key,
        action: action,
        type: "373"
    }
    data = {...data, ...data1}

    // console.log(url, data)

    try {
        response = await request_update_post(data, url)
        return response
    } catch (error) {
        console.log('fetchAccounts')
        return error
    }

}

module.exports = fetchAccounts;