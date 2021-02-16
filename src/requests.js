const request = require('request');

async function request_get(dataObject) {
    try {
        return new Promise(function(resolve, reject) {
            request.get({
                    "headers": { "content-type": "application/json" },
                    "url": dataObject
                },
                (error, response, body) => {
                    if (error) {
                        resolve({ send: false })
                    } else {
                        resolve(JSON.parse(body))
                    }
                }
            );
        })
    } catch (err) {}

}

async function request_update_post(dataObject, apiurl) {
    try {
        return new Promise(function(resolve, reject) {
            request.post({
                    "headers": { "content-type": "application/json" },
                    "url": apiurl,
                    "body": JSON.stringify(dataObject)
                },
                (error, response, body) => {
                    if (error) {
                        resolve({ send: false })
                    } else {
                        resolve(JSON.parse(body))
                    }
                }
            );
        })
    } catch (err) {}
}
async function get_event() {
    try {
        response = await request_get('http://vbdapi.com/api/events/bot/fetch-events')
        return response.data.events
    } catch (err) {

    }


}

async function update_event(id, status) {
    data = {
        id: id,
        status: status
    }

    try {
        response = await request_update_post(data, 'http://vbdapi.com/api/events/bot/update-event')
        // if(response.send!=false)
        // while(response.data.success===false){
        //     response = await request_update_post(data, 'http://vbdapi.com/api/events/bot/update-event')
        // }
        return response
    } catch (error) {
        console.log('update_event')
    }

}

async function create_ticket(ticketdata) {
    if (ticketdata.length != 0) {
        for (var i = 0; i < ticketdata.length; i++) {
            data = {
                "event_id": ticketdata[i].userid,
                "game_title": ticketdata[i].gameTitle,
                "game_id": ticketdata[i].gameId,
                "date": ticketdata[i].date,
                "location": ticketdata[i].location,
                "gate_details": ticketdata[i].gateDetails,
                "barcode_id": ticketdata[i].barcodeId,
                "section": ticketdata[i].section,
                "row": ticketdata[i].row,
                "seat": ticketdata[i].seat,
                "barcode": null,
                "background_color": ticketdata[i].bgColor,
                "header_color": "#FFFFFF",
                "second_color": ticketdata[i].secondColor,
                "event_running_time": '',
                "vip_text": ticketdata[i].vipText,
                "is_transfer": ticketdata[i].isTransfer
            }

            try {
                let result = await request_update_post(data, 'http://vbdapi.com/api/tickets/bot/create-ticket')
                if(result.send===false)
                result = await request_update_post(data, 'http://vbdapi.com/api/tickets/bot/create-ticket')
            } catch (err) {
                console.log('')
            }
        }

    }
    return { status: 200 }

}

module.exports = { get_event, update_event, create_ticket };