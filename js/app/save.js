/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function getLines() {
    var lines = [];
    $('.mathbox').each(function () {
        var text = $(this).mathquill('latex');
        if (text === '' || text === undefined || text === null) {
        } else {
            lines.push(text);
        }
    });
    return lines;
}

function getDocument() {
    return getLines().join('\n');
}

function loadDocument() {
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
}

function saveDocument() {
    store.set('lines', getLines());
}

function loadSettings() {
    setRootFontSize(store.get('rootFontSize'));
}

function saveSettings() {
    store.set('rootFontSize', rootFontSize);
}

function loadData() {
    loadDocument();
    loadSettings();
}

function _save() {
    saveDocument();
    saveSettings();
}

function save() {
    _save();
    setTimeout(function () {
        _save();
    }, 10);
}