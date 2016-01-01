/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var app = app || {};

app.document = {
    asArray: function () {
        var lines = [];
        $('.mathbox').each(function () {
            var text = $(this).mathquill('latex');
            if (text === '' || text === undefined || text === null) {
            } else {
                lines.push(text);
            }
        });
        return lines;
    },
    asString: function () {
        return this.asArray().join('\n');
    },
    load: function () {
        var lines = store.get('lines');
        var mathbox = $('.mathbox:last');
        if (lines !== undefined && lines !== null && lines.length > 0) {
            add(mathbox);
            mathbox.mathquill('latex', lines[0]);
            if (lines.length > 1) {
                for (var i = 1; i < lines.length; i++) {
                    mathbox.after(mathboxText);
                    mathbox = mathbox.next();
                    add(mathbox);
                    mathbox.mathquill('latex', lines[i]);
                }
            }
        }
        unfocus($('.mathbox'));
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