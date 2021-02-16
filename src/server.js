const express = require('express');
const fetchDataFromCsv = require('./fetchDataFromCsv.js');
const bodyParser = require("body-parser");


module.exports = function createServer(app) {
    const server = express();

    server.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    server.use(bodyParser.urlencoded({
        extended: true
    }));
    server.use(bodyParser.json());

    server.get('/', (req, res) => {
        res.send("Working");
    });

    server.post('/checkout', (req, res) => {
        try {
            fetchDataFromCsv(req, res)
        } catch (e) {
            res.send({error:"Some error has occured"});
        }
    });

    server.listen(9999, () => console.log("App started on port 9999"));
};
