"use strict";
var expect = require("expect.js");
var sinon = require('sinon');
var logstash = require('../lib/logstash');

describe( "logstash", function() {
    it( "works", function() {
        var stream = logstash.createStream();
        sinon.stub( stream, "send" ).callsFake( function() {
            console.log("send: ", arguments )
        } );
        stream.write({ time: new Date(), msg: "Test", level: 20, testField: 1 } );
        expect( stream.send.callCount ).to.be( 1 );
        var arg0 = stream.send.firstCall.args[0];
        var obj = JSON.parse( arg0 );
        expect( obj["@timestamp"] ).to.contain( "20" );
        expect( obj.message ).to.be( "Test" );
        expect( obj.tags ).to.eql( ["bunyan"] );
        expect( obj.level ).to.be( "debug" );
        expect( obj.testField ).to.be( 1 );
    } );
} );
