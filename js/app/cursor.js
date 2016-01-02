/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var app = app || {};

app.Cursor = Cursor;

function Cursor(mathbox) {
    // Initialize Properties
    this.mbel = mathbox.el;
    this.mb = mathbox;
    this.el = this.mbel.find('.cursor');

    this.prevAtBeginning = true;
    this.prevAtEnd = true;
    this.prevElevated = false;
    this.prevCI = false;

    this.initializeListeners();
}

// Status
Cursor.prototype.isAtBeginning = function () {
    return this.mbel.children(":nth-child(2)").hasClass("cursor");
};

Cursor.prototype.isAtEnd = function () {
    return this.mbel.children(":last-child").hasClass("cursor");
};

Cursor.prototype.isElevated = function () {
    // Checks if cursor is in super or subscript
    return this.mbel.find('sub.hasCursor, sup.hasCursor, .fraction .hasCursor').length > 0;
};

Cursor.prototype.isCI = function () {
    return this.mbel.find('.latex-command-input.hasCursor, .text .cursor').length > 0;
};

// Status Change
Cursor.prototype.atBeginningNotChanged = function () {
    return this.prevAtBeginning === this.isAtBeginning();
};

Cursor.prototype.atEndNotChanged = function () {
    return this.prevAtEnd === this.isAtEnd();
};

Cursor.prototype.elevationNotChanged = function () {
    return this.prevElevated === this.isElevated();
};

Cursor.prototype.ciChanged = function () {
    return this.prevCI !== this.isCI();
};

// Activation
Cursor.prototype.deactivate = function () {
    this.mbel.removeClass('.hasCursor');
    this.mbel.find('.hasCursor').removeClass('.hasCursor');
    this.el.remove();
};

// Update
Cursor.prototype.update = function () {
    var cursor = this;
    // TODO: unfocus other mathboxes
    setTimeout(function () {
        cursor.prevAtBeginning = cursor.isAtBeginning();
        cursor.prevAtEnd = cursor.isAtEnd();
        cursor.prevElevation = cursor.isElevated();
        cursor.prevCI = cursor.isCI();
    }, 10);
};

// Movement
Cursor.prototype.moveToBeginning = function () {
    this.mb.keystroke(36);
    this.prevAtBeginning = true;
};

Cursor.prototype.moveToEnd = function () {
    this.mb.keystroke(35);
    this.prevAtEnd = true;
};

// Listeners
Cursor.prototype.initializeListeners = function () {
    this.mbel.click(this.update.bind(this));
};