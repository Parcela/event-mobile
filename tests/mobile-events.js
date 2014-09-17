/*global describe, it */

"use strict";

(function (window) {

var expect = require('chai').expect,
    should = require('chai').should(),

    Event = require('../event-mobile.js')(window),

    EMIT_TAP_EVENT, EMIT_FOCUS_EVENT, EMIT_KEY_EVENT, buttonnode, divnode;

require('event/event-emitter.js');
require('event/event-listener.js');

EMIT_TAP_EVENT = function(target) {
    Event.hammertime.emit('tap', {target: target});
};

describe('TAP Events', function () {
    // Code to execute before the tests inside this describegroup.
    before(function() {
        divnode = document.createElement('div');
        divnode.id = 'divcont';
        divnode.className = 'contclass';
        divnode.style = 'position: absolute; left: -1000px; top: -1000px;';
        buttonnode = document.createElement('button');
        buttonnode.id = 'buttongo';
        buttonnode.className = 'buttongoclass';
        divnode.appendChild(buttonnode);
        document.body.appendChild(divnode);
    });

    // Code to execute after the tests inside this describegroup.
    after(function() {
        document.body.removeChild(divnode);
    });

    // Code to execute after every test.
    afterEach(function() {
        Event.detachAll();
        Event.undefAllEvents();
        Event.unNotifyAll();
    });

    it('listening event', function (done) {
        Event.after('tap', function() {
            done();
        }, '#buttongo');
        EMIT_TAP_EVENT(buttonnode);
    });

    it('preventing event', function (done) {
        Event.after('tap', function() {
            done(new Error('event should not happen'));
        }, '#buttongo');
        Event.before('tap', function(e) {
            e.preventDefault();
        }, '#buttongo');
        EMIT_TAP_EVENT(buttonnode);
        setTimeout(done, 0);
    });

    it('halt event', function (done) {
        Event.after('tap', function() {
            done(new Error('event should not happen'));
        }, '#buttongo');
        Event.before('tap', function(e) {
            e.halt();
        }, '#buttongo');
        EMIT_TAP_EVENT(buttonnode);
        setTimeout(done, 0);
    });

    it('properties eventobject', function (done) {
        Event.after('tripletap', function(e) {
            (e.velocity===undefined).should.be.false;
        }, '#buttongo');
        EMIT_TAP_EVENT(buttonnode);
        setTimeout(done, 0);
    });

    it('delegation on future nodes', function (done) {
        var count = 0,
            buttonnode2, buttonnode3;
        Event.after('tap', function() {
            count++;
        }, '#buttongo2');
        Event.after('tap', function() {
            count++;
        }, '.go');

        buttonnode2 = document.createElement('button');
        buttonnode2.id = 'buttongo2';
        buttonnode2.style = 'position: absolute; left: -1000px; top: -1000px;';
        buttonnode2.className = 'go';
        document.body.appendChild(buttonnode2);

        buttonnode3 = document.createElement('button');
        buttonnode3.id = 'buttongo3';
        buttonnode3.style = 'position: absolute; left: -1000px; top: -1000px;';
        buttonnode3.className = 'go';
        document.body.appendChild(buttonnode3);

        EMIT_TAP_EVENT(buttonnode2);
        EMIT_TAP_EVENT(buttonnode3);
        document.body.removeChild(buttonnode2);
        document.body.removeChild(buttonnode3);
        setTimeout(function() {
            count.should.be.eql(3);
            done();
        }, 0);
    });

    it('delegation on future nodes with preventDefault', function (done) {
        var count = 0,
            buttonnode2, buttonnode3;
        Event.before('tap', function(e) {
            e.preventDefault();
        }, '#buttongo3');
        Event.after('tap', function() {
            count++;
        }, '#buttongo2');
        Event.after('tap', function() {
            count++;
        }, '.go');

        buttonnode2 = document.createElement('button');
        buttonnode2.id = 'buttongo2';
        buttonnode2.style = 'position: absolute; left: -1000px; top: -1000px;';
        buttonnode2.className = 'go';
        document.body.appendChild(buttonnode2);

        buttonnode3 = document.createElement('button');
        buttonnode3.id = 'buttongo3';
        buttonnode3.style = 'position: absolute; left: -1000px; top: -1000px;';
        buttonnode3.className = 'go';
        document.body.appendChild(buttonnode3);

        EMIT_TAP_EVENT(buttonnode2);
        EMIT_TAP_EVENT(buttonnode3);
        document.body.removeChild(buttonnode2);
        document.body.removeChild(buttonnode3);
        setTimeout(function() {
            count.should.be.eql(2);
            done();
        }, 0);
    });

    it('stopPropagation', function (done) {
        var count = 0;

        Event.after('tap', function() {
            // done(new Error('After-subscriber #divcont should not be invoked'));
        }, '#divcont');

        Event.after('tap', function() {
            count.should.be.eql(15);
            count = count + 16;
        }, '#divcont button.buttongoclass');

        Event.after('tap', function() {
            count.should.be.eql(31);
            count = count + 32;
        }, '#buttongo');

        //====================================================

        Event.before('tap', function(e) {
            done(new Error('Before-subscriber #divcont should not be invoked'));
        }, '#divcont');

        Event.before('tap', function() {
            count.should.be.eql(0);
            count = count + 1;
        }, '#divcont button.buttongoclass');

        Event.before('tap', function(e) {
            count.should.be.eql(1);
            count = count + 2;
            e.stopPropagation();
        }, '#divcont button.buttongoclass');

        Event.before('tap', function() {
            count.should.be.eql(3);
            count = count + 4;
        }, '#divcont button.buttongoclass');

        Event.before('tap', function() {
            count.should.be.eql(7);
            count = count + 8;
        }, '#buttongo');

        //====================================================

        EMIT_TAP_EVENT(buttonnode);

        setTimeout(function() {
            count.should.be.eql(63);
            done();
        }, 0);
    });

    it('stopPropagation situation 2', function (done) {
        var count = 0,
            divnode = document.getElementById('divcont'),
            divnode2 = document.createElement('div'),
            divnode3 = document.createElement('div'),
            deepestbutton = document.createElement('button');
        divnode2.id = 'divnode2';
        divnode3.id = 'divnode3';
        divnode2.className = 'divnode2class';
        divnode3.appendChild(deepestbutton);
        divnode2.appendChild(divnode3);
        divnode.appendChild(divnode2);


        Event.after('tap', function() {
            done(new Error('Before-subscriber button.buttongoglass should not be invoked'));
        }, 'button.buttongoclass');

        Event.after('tap', function(e) {
            done(new Error('Before-subscriber .contclass should not be invoked'));
        }, '.contclass');

        Event.after('tap', function(e) {
            count.should.be.eql(31);
            count = count + 32;
        }, '.divnode2class');

        Event.after('tap', function() {
            count.should.be.eql(15);
            count = count + 16;
        }, '#divnode3');

        Event.after('tap', function() {
            count.should.be.eql(7);
            count = count + 8;
        }, 'button');

        //====================================================

        Event.before('tap', function() {
            done(new Error('Before-subscriber button.buttongoglass should not be invoked'));
        }, 'button.buttongoclass');

        Event.before('tap', function(e) {
            done(new Error('Before-subscriber .contclass should not be invoked'));
        }, '.contclass');

        Event.before('tap', function(e) {
            count.should.be.eql(3);
            count = count + 4;
            e.stopPropagation();
        }, '.divnode2class');

        Event.before('tap', function() {
            count.should.be.eql(1);
            count = count + 2;
        }, '#divnode3');

        Event.before('tap', function() {
            count.should.be.eql(0);
            count = count + 1;
        }, 'button');

        //====================================================

        EMIT_TAP_EVENT(deepestbutton);

        setTimeout(function() {
            count.should.be.eql(63);
            divnode.removeChild(divnode2);
            done();
        }, 0);
    });

    it('stopPropagation situation 3', function (done) {
        var count = 0,
            divnode = document.getElementById('divcont'),
            divnode2 = document.createElement('div'),
            divnode3 = document.createElement('div'),
            deepestbutton = document.createElement('button');
        divnode2.id = 'divnode2';
        divnode3.id = 'divnode3';
        divnode2.className = 'divnode2class';
        divnode3.appendChild(deepestbutton);
        divnode2.appendChild(divnode3);
        divnode.appendChild(divnode2);


        Event.after('tap', function() {
            done(new Error('Before-subscriber button.buttongoglass should not be invoked'));
        }, 'button.buttongoclass');

        Event.after('tap', function(e) {
            done(new Error('Before-subscriber .contclass should not be invoked'));
        }, '#divcont');

        Event.after('tap', function(e) {
            count.should.be.eql(31);
            count = count + 32;
        }, '#divnode2');

        Event.after('tap', function() {
            count.should.be.eql(15);
            count = count + 16;
        }, '#divnode3');

        Event.after('tap', function() {
            count.should.be.eql(7);
            count = count + 8;
        }, 'button');

        //====================================================

        Event.before('tap', function() {
            done(new Error('Before-subscriber button.buttongoglass should not be invoked'));
        }, 'button.buttongoclass');

        Event.before('tap', function(e) {
            done(new Error('Before-subscriber .contclass should not be invoked'));
        }, '#divcont');

        Event.before('tap', function(e) {
            count.should.be.eql(3);
            count = count + 4;
            e.stopPropagation();
        }, '#divnode2');

        Event.before('tap', function() {
            count.should.be.eql(1);
            count = count + 2;
        }, '#divnode3');

        Event.before('tap', function() {
            count.should.be.eql(0);
            count = count + 1;
        }, 'button');

        //====================================================

        EMIT_TAP_EVENT(deepestbutton);

        setTimeout(function() {
            count.should.be.eql(63);
            divnode.removeChild(divnode2);
            done();
        }, 0);
    });

    it('stopImmediatePropagation', function (done) {
        var count = 0;

        Event.after('tap', function() {
            done(new Error('After-subscriber #divcont should not be invoked'));
        }, '#divcont');

        Event.after('tap', function() {
            done(new Error('Before-subscriber #divcont button.buttongoclass should not be invoked'));
        }, '#divcont button.buttongoclass');

        Event.after('tap', function() {
            done(new Error('Before-subscriber #buttongo should not be invoked'));
        }, '#buttongo');

        //====================================================

        Event.before('tap', function() {
            done(new Error('Before-subscriber #divcont should not be invoked'));
        }, '#divcont');

        Event.before('tap', function() {
            count.should.be.eql(0);
            count = count + 1;
        }, '#divcont button.buttongoclass');

        Event.before('tap', function(e) {
            count.should.be.eql(1);
            count = count + 2;
            e.stopImmediatePropagation();
        }, '#divcont button.buttongoclass');

        Event.before('tap', function() {
            done(new Error('Before-subscriber #divcont button.buttongoclass should not be invoked'));
        }, '#divcont button.buttongoclass');

        Event.before('tap', function() {
            done(new Error('Before-subscriber #buttongo should not be invoked'));
        }, '#buttongo');

        //====================================================

        EMIT_TAP_EVENT(buttonnode);

        setTimeout(function() {
            count.should.be.eql(3);
            done();
        }, 0);
    });

    it('stopImmediatePropagation situation 2', function (done) {
        var count = 0,
            divnode = document.getElementById('divcont'),
            divnode2 = document.createElement('div'),
            divnode3 = document.createElement('div'),
            deepestbutton = document.createElement('button');
        divnode2.id = 'divnode2';
        divnode3.id = 'divnode3';
        divnode2.className = 'divnode2class';
        divnode3.appendChild(deepestbutton);
        divnode2.appendChild(divnode3);
        divnode.appendChild(divnode2);


        Event.after('tap', function() {
            done(new Error('Before-subscriber button.buttongoglass should not be invoked'));
        }, 'button.buttongoclass');

        Event.after('tap', function(e) {
            done(new Error('Before-subscriber .contclass should not be invoked'));
        }, '.contclass');

        Event.after('tap', function(e) {
            done(new Error('Before-subscriber .divnode2class should not be invoked'));
        }, '.divnode2class');

        Event.after('tap', function() {
            count.should.be.eql(15);
            count = count + 16;
        }, '#divnode3');

        Event.after('tap', function() {
            count.should.be.eql(7);
            count = count + 8;
        }, 'button');

        //====================================================

        Event.before('tap', function() {
            done(new Error('Before-subscriber button.buttongoglass should not be invoked'));
        }, 'button.buttongoclass');

        Event.before('tap', function(e) {
            done(new Error('Before-subscriber .contclass should not be invoked'));
        }, '.contclass');

        Event.before('tap', function(e) {
            count.should.be.eql(3);
            count = count + 4;
            e.stopImmediatePropagation();
        }, '.divnode2class');

        Event.before('tap', function() {
            count.should.be.eql(1);
            count = count + 2;
        }, '#divnode3');

        Event.before('tap', function() {
            count.should.be.eql(0);
            count = count + 1;
        }, 'button');

        //====================================================

        EMIT_TAP_EVENT(deepestbutton);

        setTimeout(function() {
            count.should.be.eql(31);
            divnode.removeChild(divnode2);
            done();
        }, 0);
    });

    it('stopImmediatePropagation situation 3', function (done) {
        var count = 0,
            divnode = document.getElementById('divcont'),
            divnode2 = document.createElement('div'),
            divnode3 = document.createElement('div'),
            deepestbutton = document.createElement('button');
        divnode2.id = 'divnode2';
        divnode3.id = 'divnode3';
        divnode2.className = 'divnode2class';
        divnode3.appendChild(deepestbutton);
        divnode2.appendChild(divnode3);
        divnode.appendChild(divnode2);


        Event.after('tap', function() {
            done(new Error('Before-subscriber button.buttongoglass should not be invoked'));
        }, 'button.buttongoclass');

        Event.after('tap', function(e) {
            done(new Error('Before-subscriber .contclass should not be invoked'));
        }, '#divcont');

        Event.after('tap', function(e) {
            done(new Error('Before-subscriber .divnode2class should not be invoked'));
        }, '#divnode2');

        Event.after('tap', function() {
            count.should.be.eql(15);
            count = count + 16;
        }, '#divnode3');

        Event.after('tap', function() {
            count.should.be.eql(7);
            count = count + 8;
        }, 'button');

        //====================================================

        Event.before('tap', function() {
            done(new Error('Before-subscriber button.buttongoglass should not be invoked'));
        }, 'button.buttongoclass');

        Event.before('tap', function(e) {
            done(new Error('Before-subscriber .contclass should not be invoked'));
        }, '#divcont');

        Event.before('tap', function(e) {
            count.should.be.eql(3);
            count = count + 4;
            e.stopImmediatePropagation();
        }, '#divnode2');

        Event.before('tap', function() {
            count.should.be.eql(1);
            count = count + 2;
        }, '#divnode3');

        Event.before('tap', function() {
            count.should.be.eql(0);
            count = count + 1;
        }, 'button');

        //====================================================

        EMIT_TAP_EVENT(deepestbutton);

        setTimeout(function() {
            count.should.be.eql(31);
            divnode.removeChild(divnode2);
            done();
        }, 0);
    });

    it('e.target', function (done) {
        var divnode = document.getElementById('divcont'),
            divnode2 = document.createElement('div'),
            divnode3 = document.createElement('div'),
            deepestbutton = document.createElement('button');
        divnode2.id = 'divnode2';
        divnode3.id = 'divnode3';
        divnode2.className = 'divnode2class';
        divnode3.appendChild(deepestbutton);
        divnode2.appendChild(divnode3);
        divnode.appendChild(divnode2);

        Event.after('tap', function(e) {
            (e.target===divnode2).should.be.true;
        }, '#divcont .divnode2class');

        EMIT_TAP_EVENT(deepestbutton);

        setTimeout(function() {
            divnode.removeChild(divnode2);
            done();
        }, 0);
    });

    it('e.currentTarget', function (done) {
        var divnode = document.getElementById('divcont'),
            divnode2 = document.createElement('div'),
            divnode3 = document.createElement('div'),
            deepestbutton = document.createElement('button');
        divnode2.id = 'divnode2';
        divnode3.id = 'divnode3';
        divnode2.className = 'divnode2class';
        divnode3.appendChild(deepestbutton);
        divnode2.appendChild(divnode3);
        divnode.appendChild(divnode2);

        Event.after('tap', function(e) {
            (e.currentTarget===divnode).should.be.true;
        }, '#divcont .divnode2class');

        Event.after('tap', function(e) {
            (e.currentTarget===divnode2).should.be.true;
        }, '#divnode2 button');

        EMIT_TAP_EVENT(deepestbutton);

        setTimeout(function() {
            divnode.removeChild(divnode2);
            done();
        }, 0);
    });

    it('e.sourceTarget', function (done) {
        var divnode = document.getElementById('divcont'),
            divnode2 = document.createElement('div'),
            divnode3 = document.createElement('div'),
            deepestbutton = document.createElement('button');
        divnode2.id = 'divnode2';
        divnode3.id = 'divnode3';
        divnode2.className = 'divnode2class';
        divnode3.appendChild(deepestbutton);
        divnode2.appendChild(divnode3);
        divnode.appendChild(divnode2);

        Event.after('tap', function(e) {
            (e.sourceTarget===deepestbutton).should.be.true;
        }, '#divcont .divnode2class');

        Event.after('tap', function(e) {
            (e.sourceTarget===deepestbutton).should.be.true;
        }, '#divnode2 button');

        EMIT_TAP_EVENT(deepestbutton);

        setTimeout(function() {
            divnode.removeChild(divnode2);
            done();
        }, 0);
    });

    it('e.target on document', function (done) {
        var divnode = document.getElementById('divcont'),
            divnode2 = document.createElement('div'),
            divnode3 = document.createElement('div'),
            deepestbutton = document.createElement('button');
        divnode2.id = 'divnode2';
        divnode3.id = 'divnode3';
        divnode2.className = 'divnode2class';
        divnode3.appendChild(deepestbutton);
        divnode2.appendChild(divnode3);
        divnode.appendChild(divnode2);

        Event.after('tap', function(e) {
            (e.target===divnode2).should.be.true;
        }, '.divnode2class');

        Event.after('tap', function(e) {
            (e.target===deepestbutton).should.be.true;
        }, '.divnode2class button');

        EMIT_TAP_EVENT(deepestbutton);

        setTimeout(function() {
            divnode.removeChild(divnode2);
            done();
        }, 0);
    });

    it('e.currentTarget on document', function (done) {
        var divnode = document.getElementById('divcont'),
            divnode2 = document.createElement('div'),
            divnode3 = document.createElement('div'),
            deepestbutton = document.createElement('button');
        divnode2.id = 'divnode2';
        divnode3.id = 'divnode3';
        divnode2.className = 'divnode2class';
        divnode3.appendChild(deepestbutton);
        divnode2.appendChild(divnode3);
        divnode.appendChild(divnode2);

        Event.after('tap', function(e) {
            (e.currentTarget===document).should.be.true;
        }, '.divnode2class');

        Event.after('tap', function(e) {
            (e.currentTarget===document).should.be.true;
        }, '.divnode2class button');

        EMIT_TAP_EVENT(deepestbutton);

        setTimeout(function() {
            divnode.removeChild(divnode2);
            done();
        }, 0);
    });

    it('e.sourceTarget on document', function (done) {
        var divnode = document.getElementById('divcont'),
            divnode2 = document.createElement('div'),
            divnode3 = document.createElement('div'),
            deepestbutton = document.createElement('button');
        divnode2.id = 'divnode2';
        divnode3.id = 'divnode3';
        divnode2.className = 'divnode2class';
        divnode3.appendChild(deepestbutton);
        divnode2.appendChild(divnode3);
        divnode.appendChild(divnode2);

        Event.after('tap', function(e) {
            (e.sourceTarget===deepestbutton).should.be.true;
        }, '.divnode2class');

        Event.after('tap', function(e) {
            (e.sourceTarget===deepestbutton).should.be.true;
        }, '.divnode2class button');

        EMIT_TAP_EVENT(deepestbutton);

        setTimeout(function() {
            divnode.removeChild(divnode2);
            done();
        }, 0);
    });

});

}(global.window || require('fake-dom')));