var bunyan = require('bunyan');
var extend = require('extend');
var os     = require('os');
var dgram  = require('dgram');

// used to throttle errors loggings when sending fails
var lastErrorTimestamp;

function clone(obj, depth) {
    // we only need to clone reference types (Object)
    if (!(obj instanceof Object) ||
        obj instanceof Date ||
        depth > 2) {
        return obj;
    }

    var copy = {};
    for (var i in obj) {
        if (Array.isArray(obj[i])) {
            copy[i] = obj[i].slice(0);
        }
        else if (obj[i] instanceof Buffer) {
            copy[i] = obj[i].slice(0);
        }
        else if (typeof obj[i] != 'function') {
            copy[i] = obj[i] instanceof Object ? clone(obj[i], depth+1) : obj[i];
        }
        else if (typeof obj[i] === 'function') {
            copy[i] = obj[i];
        }
    }

    return copy;
}

function LogstashStream(options) {
    options = options || {};

    this.name        = 'bunyan';
    this.level       = options.level || 'info';
    this.server      = options.server || os.hostname();
    this.host        = options.host || '127.0.0.1';
    this.port        = options.port || 9999;
    this.application = options.appName || process.title;
    this.pid         = options.pid || process.pid;
    this.tags        = options.tags || ["bunyan"];
    this.type        = options.type;

    this.client = null;
}

var levels = {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal'
};

function createLogstashStream(options) {
    return new LogstashStream(options);
};

LogstashStream.prototype.write = function logstashWrite(entry) {
    var level, rec, msg;

    if (typeof(entry) === 'string') {
        entry = JSON.parse(entry);
    }

    rec = clone(entry, 0);

    level = rec.level;

    if (levels.hasOwnProperty(level)) {
        level = levels[level];
    }

    msg = {
        '@timestamp': rec.time.toISOString(),
        'message':    rec.msg,
        'tags':       this.tags,
        'source':     this.server + "/" + this.application,
        'level':      level
    };

    if (typeof(this.type) === 'string') {
        msg.type = this.type;
    }

    delete rec.time;
    delete rec.msg;

    // Remove internal bunyan fields that won't mean anything outside of
    // a bunyan context.
    delete rec.v;
    delete rec.level;

    rec.pid = this.pid;

    this.send(JSON.stringify(extend({}, msg, rec), bunyan.safeCycles()));
};

LogstashStream.prototype.send = function logstashSend(message) {
    var self = this;
    var buf = new Buffer(message);

    if (! self.client) {
        self.client = dgram.createSocket('udp4');
        self.client.on("error", function (err) {
            var currentTimestamp = new Date().getTime()
            if (!lastErrorTimestamp || currentTimestamp - lastErrorTimestamp > 10000) {
                lastErrorTimestamp = currentTimestamp;
                console.log("bunyan-logstash socket connection error: " + err);
            }
        });
    }

    self.client.send(buf, 0, buf.length, self.port, self.host);
};


module.exports = {
    createStream:   createLogstashStream,
    LogstashStream: LogstashStream
};
