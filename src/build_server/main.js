var express = require("express");
var config = require("config");
var body_parser = require("body-parser");

var Client = require("../common/Client");
var Builder = require("./Builder");

var app = express();
var builder = new Builder();

app.use( body_parser.json() );
app.use( body_parser.urlencoded({ extended: true }) );
app.use( function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
    next();
});

/***********************************************************************************************************************
 * GET
 */

/**
 * @apiGroup Builder
 * @api {get} /api/v2/build/:id
 * @apiName Get build information location
 * @apiDescription Gets the URLs for the requested information locations
 * @apiParam {number} id Integer representing the id of the client in the database
 */
app.get("/api/v2/build/:id/", function(req, res) {
    var id = req.params.id;

    res.send({
        tar_url: `http://${config.build_server.url}:${config.build_server.port}/api/v2/build/${id}/tar`,
        hash_url: `http://${config.build_server.url}:${config.build_server.port}/api/v2/build/${id}/hash`,
        log_url: `http://${config.build_server.url}:${config.build_server.port}/api/v2/build/${id}/log`,
    });
});

/**
 * @apiGroup Builder
 * @api {get} /api/v2/build/:id/tar
 * @apiName Get Build
 * @apiDescription Gets the tarred build of the most recent build for a client's code
 * @apiParam {number} id Integer representing the id of the client in the database
 * @apiSuccess 200 The tarred build itself
 * @apiError 404 The tarred build for the given client id was not found
 */
app.get("/api/v2/build/:id/tar", function(req, res) {
    var id = req.params.id;

    builder.getTar(id, (err, tar) => {
        if(err) return res.send(404);
        res.send(tar);
    });
});

/**
 * @apiGroup Builder
 * @api {get} /api/v2/build/:id/log
 * @apiName Get Build Log
 * @apiDescription Gets the build log of the client's most recent build
 * @apiParam {number} id Database client id
 * @apiSuccess 200 The build log for the most recent build of the specified client id
 * @apiError 404 The build log for the build was not found
 */
app.get("/api/v2/build/:id/log", function (req, res) {
    var id = req.params.id;

    builder.getLog(id, function(err, log){
        if(err) return res.send(404);
        res.send(log);
    });
});

/**
 * @apiGroup Builder
 * @api {get} /api/v2/build/:id/log
 * @apiName Get Build Log
 * @apiDescription Gets the build log of the client's most recent build
 * @apiParam {number} id Database client id
 * @apiSuccess 200 The build log for the most recent build of the specified client id
 * @apiError 404 The build log for the build was not found
 */
app.get("/api/v2/build/:id/hash", function (req, res) {
    var id = req.params.id;

    builder.getHash(id, function(err, hash){
        if(err) return res.send(404);
        res.send(hash);
    });
});

/**
 * @apiGroup Builder
 * @apiName Build Client Code
 * @apiDescription Builds code for client given by id
 * @api {post} /api/v2/build/:id
 * @apiParam {number} id Database client id
 * @apiSuccess 200 The client is valid and build has started
 * @apiError 400 Invalid parameters were given
 * @apiError 404 The client is valid and the build has started
 */
app.post("/api/v2/build/:id", function (req, res) {
    if(typeof req.params.id !== "number") return res.send(400);
    var id = req.params.id;

    Client.getById(id, function(err){
        if(err) return res.send(404);
        res.send(200);
        builder.build(id, function(err){
            if(err) console.warn(`Error:  ${JSON.stringify(err)}`);
            //TODO: Update database with build status
        });
    });
});

console.log("Build Server - LISTENING - port " + config.build_server.port);
app.listen(config.build_server.port);

