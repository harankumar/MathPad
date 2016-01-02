/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var app = app || {};


app.document = {
    mathboxes: [],
    mathboxID: 0,
    getIndex: function (id) {
        // find index in app.document.mathboxes
        var adm = app.document.mathboxes;
        var index = -1;
        for (var i = 0; i < adm.length; i++) {
            if (adm[i].id === id)
                index = i;
        }
        if (index === -1) {
            console.error('could not find index of mathbox!');
        }
        return index
    },
    getMathbox: function (id) {
        return app.document.mathboxes[app.document.getIndex(id)];
    },
    add: function (el) {
        var id = ++app.document.mathboxID;
        app.document.mathboxes.push(
            new app.MathBox(el, id, 'temp')
        );
    },
    addAtIndex: function (el, index) {
        var id = ++app.document.mathboxID;
        var mb = new app.MathBox(el, id, 'temp');
        app.document.mathboxes.splice(index, 0, mb);
    },
    remove: function (mb) {
        var index = app.document.getIndex(mb.id);
        var el = app.document.mathboxes[index].el;
        el.remove();

        app.document.mathboxes.splice(index, index);
    },
    unfocusAll: function () {
        var mb = app.document.mathboxes;
        for (var i = 0; i < mb.length; i++) {
            mb[i].unfocus();
        }
    },
    asArray: function () {
        var lines = [];
        var mb = app.document.mathboxes;
        for (var i = 0; i < mb.length; i++) {
            lines.push(mb[i].getText());
        }
        return lines;
    },
    asString: function () {
        return this.asArray().join('\n');
    },
    load: function () {
        var lines = store.get('lines');
        var mathbox = $('.mathbox:last');
        app.document.add(mathbox);
        if (lines !== undefined && lines !== null && lines.length > 0) {
            mathbox.mathquill('latex', lines[0]);
            if (lines.length > 1) {
                for (var i = 1; i < lines.length; i++) {
                    mathbox.after(app.mathboxText);
                    mathbox = mathbox.next();
                    app.document.add(mathbox);
                    mathbox.mathquill('latex', lines[i]);
                }
            }
        }
        app.document.unfocusAll();
        focus(mathbox);
    },
    store: function () {
        store.set('lines', this.asArray());
    },
    save: function () {
        this.store();
        setTimeout(function () {
            // JS Context is obnoxious :(
            app.document.store()
        }, 10);
    }
};