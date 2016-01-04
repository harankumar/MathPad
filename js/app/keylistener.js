/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var app = (function (app) {

    app.KeyListener = KeyListener;

    function KeyListener(mathbox) {
        this.mbel = mathbox.el;
        this.mb = mathbox;
        this.cursor = mathbox.cursor;

        this.initializeListeners();
    }

    // Keyboard Stuff
    KeyListener.prototype._enter = function () {
        /** Adds a new mathbox directly below and focuses it
         * */
        // make the enter wouldn't go to some mathquill purpose
        if (this.cursor.isCI() || this.cursor.ciChanged())
            return;
        if (this.cursor.isAtEnd()) {
            this.mbel.after(app.mathboxText);
            var next = this.mbel.next();
            app.document.addAtIndex(next, this.mb.getIndex() + 1);
        } else if (this.cursor.isAtBeginning()) {
            this.mbel.before(app.mathboxText);
            var prev = this.mbel.prev();
            app.document.addAtIndex(prev, this.mb.getIndex());
        } else {
            // make sure cursor not elevated
            if (this.cursor.isElevated())
                return;
            if (this.mbel.children('.cursor').length == 0)
                return;
            // determine latex before and after cursor
            var _prevLatex = this.mb.getTextBeforeCursor();
            console.log(_prevLatex);
            var _nextLatex = this.mb.getTextAfterCursor();
            console.log(_nextLatex);
            // add new box
            this.mbel.after(app.mathboxText);
            var next = this.mbel.next();
            app.document.addAtIndex(next, this.mb.getIndex() + 1);
            // write latex to current and previous box
            this.mbel.mathquill('latex', _prevLatex);
            next.mathquill('latex', _nextLatex);
            // focus current
            app.document.unfocusAll.bind(app.document)();
            focus(next);
            this.mb.getNext().cursor.moveToBeginning();
        }

    };

    //TODO: not just moving cursor to the end or beginning of line !!!important
    KeyListener.prototype._backspace = function (event) {
        /** If at the beginning of mathbox, there are more than one, and the backspace wasn't also a text deleting one:
         * Combine the mathbox with the previous one
         * */
        if (event.shiftKey && event.ctrlKey) {
            this.mb.delete.bind(this.mb)();
            this.mb.getNeighbor.bind(this.mb)().focus();
        }
        if (this.mb.cursor.isAtBeginning() && this.mb.textNotChanged() && $(".mathbox").length > 1) {
            event.preventDefault();
            var prev = this.mb.getPrev();
            prev.el.mathquill('latex', prev.el.mathquill('latex') + ' ' + this.mbel.mathquill('latex'));
            prev.focus();
            prev.cursor.moveToEnd();
            app.document.remove(this.mb);
        }
    };

    KeyListener.prototype._delete = function () {
        /** If at the end of mathbox, there are more than one, and the delete wasn't also a text deleting one:
         * Combine the mathbox with the next one
         * */
        if (this.mb.cursor.isAtEnd() && this.mb.textNotChanged() && $(".mathbox").length > 1) {
            var next = this.mb.getNext();
            next.el.mathquill('latex', this.mbel.mathquill('latex') + ' ' + next.el.mathquill('latex'));
            next.focus();
            next.cursor.moveToEnd();
            app.document.remove(this.mb);
        }
    };

    KeyListener.prototype._arrowLeft = function () {
        /** If at the beginning of mathbox, there is a box above, and the keystroke didn't cause cursor movement:
         * Move to mathbox directly above
         * */
        var prev;
        try {
            prev = this.mb.getPrev();
        } catch (Exception) {
            return;
        }
        //console.log(this.mb.cursor.isAtBeginning());
        //console.log(this.mb.cursor.atBeginningNotChanged());
        if (this.mb.cursor.isAtBeginning() && this.mb.cursor.atBeginningNotChanged()) {
            prev.focus();
            prev.cursor.moveToEnd();
        }
    };

    KeyListener.prototype._arrowRight = function () {
        /** If at the end of mathbox, there is a box below, and the keystroke didn't cause cursor movement:
         * Move to mathbox directly below
         * */
        var next;
        try {
            next = this.mb.getNext();
        } catch (Exception) {
            return;
        }
        if (this.mb.cursor.isAtEnd() && this.mb.cursor.atEndNotChanged()) {
            next.focus();
            next.cursor.moveToBeginning();
        }
    };

    KeyListener.prototype._arrowUp = function () {
        /** If there is a box above, and the keystroke didn't cause an elevation change:
         *  move to it */
        var prev;
        try {
            prev = this.mb.getPrev();
        } catch (Exception) {
            return;
        }
        if (this.mb.cursor.elevationNotChanged()) {
            prev.focus();
            prev.cursor.moveToEnd();
        }
    };

    KeyListener.prototype._arrowDown = function () {
        /** If there is a box below, and the keystroke didn't cause an elevation change:
         * move to it */
        var next;
        try {
            next = this.mb.getNext();
        } catch (Exception) {
            return;
        }
        if (this.mb.cursor.elevationNotChanged()) {
            next.focus();
            next.cursor.moveToBeginning();
        }
    };

    KeyListener.prototype._tab = function (event) {
        event.preventDefault();
        if (this.mb.cursor.isCI() || this.mb.cursor.ciChanged())
            return;
        if (this.mb.cursor.isElevated())
            return;
        var _prevLatex = this.mb.getTextBeforeCursor();
        var _nextLatex = this.mb.getTextAfterCursor();
        this.mbel.mathquill('latex', _prevLatex + '\\quad ' + _nextLatex);
        this.mb.focus();
    };

    // TODO: shortcut for plain text, multiple mathboxes

    // Listeners
    KeyListener.prototype._onKeyDown = function (e) {
        if (e.key === "Enter" || e.keyCode === 13) {
            this._enter();
        } else if (e.key === "Backspace" || e.keyCode === 8) {
            this._backspace(e);
        } else if (e.key === "Delete" || e.keyCode === 46) {
            this._delete();
        } else if (e.key === "ArrowLeft" || e.keyCode === 37) {
            this._arrowLeft();
        } else if (e.key === "ArrowRight" || e.keyCode === 39) {
            this._arrowRight();
        } else if (e.key === "ArrowUp" || e.keyCode === 38) {
            this._arrowUp();
        } else if (e.key === "ArrowDown" || e.keyCode === 40) {
            this._arrowDown();
        } else if (e.key === "Tab" || e.keyCode === 9) {
            this._tab(e)
        }
    };

    KeyListener.prototype.initializeListeners = function () {
        var textarea = this.mbel.find('textarea');
        textarea.keydown(this._onKeyDown.bind(this));
        textarea.keydown(this.cursor.update.bind(this.cursor));
        textarea.keydown(app.document.save.bind(app.document));
        textarea.bind('keydown', 'alt+ctrl+s', app.screens.save.show);
        textarea.bind('keydown', 'alt+ctrl+j', app.screens.settings.show);
        textarea.bind('keydown', 'alt+ctrl+h', app.screens.help.show);
        textarea.bind('keydown', 'alt+ctrl+i', app.screens.info.toggle);
        //TODO: textarea.bind('keydown', 'esc+shift', this.mb.plaintextify.bind(this.mb));
    };

    return app;
})(app || {});