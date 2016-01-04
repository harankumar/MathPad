/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var app = (function (app) {
    app.MathBox = MathBox;

    function MathBox(element, id, type) {
        // Initialize Properties
        this.el = $(element);
        this.id = id;
        this.type = type;

        this.prevText = "";

        // Initialize Element
        element.mathquill('editable');
        this.focus();
        element.attr('id', this.id);

        // Initialize Cursor
        this.cursor = new app.Cursor(this);
        this.cursor.moveToBeginning();

        // Initialize Keyboard
        this.keyListener = new app.KeyListener(this);

        this.update();
    }

    app.mathboxText = '<span class="mathquill-editable mathbox"></span>';

// Mathbox Manipulation

    MathBox.prototype.keystroke = function (keyCode) {
        var customKeyDownEvent = $.Event('keydown');

        customKeyDownEvent.bubbles = false;
        customKeyDownEvent.cancelable = false;
        customKeyDownEvent.charCode = keyCode;
        customKeyDownEvent.keyCode = keyCode;
        customKeyDownEvent.which = keyCode;

        this.el.children().children('textarea').trigger(customKeyDownEvent);
    };

// Focus

    MathBox.prototype.focus = function () {
        // TODO: fix random stuttering
        app.document.unfocusAll.bind(app.document)();
        setTimeout(app.document.unfocusAll.bind(app.document), 10);
        setTimeout(function () {
            this.el.find('textarea').focus();
            this.keystroke(32);
        }.bind(this), 10);
    };

    MathBox.prototype.unfocus = function () {
        this.el.find('textarea').blur();
        this.cursor.deactivate();
    };

// Misc Utils/Status Stuff

    MathBox.prototype.getNeighbor = function () {
        var prev = this.getPrev();
        var next = this.getNext();
        return prev || next;
    };

    MathBox.prototype.getPrev = function () {
        var index = app.document.getIndex(this.id);
        // find next index
        var prev = index - 1;
        // return the object there
        return app.document.mathboxes[prev];
    };

    MathBox.prototype.getNext = function () {
        var index = app.document.getIndex(this.id);
        // find next index
        var next = index + 1;
        // return the object there
        return app.document.mathboxes[next];
    };

    MathBox.prototype.getIndex = function () {
        return app.document.getIndex(this.id);
    };

    MathBox.prototype.getText = function () {
        return this.el.mathquill('latex');
    };

    MathBox.prototype.delete = function () {
        if ($('.mathbox').length > 1)
            app.document.remove(this);
    };

    function latex2HTML(html) {
        var latex = "";
        // TODO: fix issue where &nbsp; insert after f's
        html.each(function () {
            var t = this.outerHTML;
            if (t === undefined || t === null || t === '')
                return;
            var tag = this.tagName.toLowerCase();
            var contents = latex2HTML($(this).children());
            if (tag === 'sup') {
                latex += " ^{" + contents + "} ";
            } else if (tag === 'sub') {
                latex += " _{" + contents + "} ";
            } else if (tag === 'var') {
                latex += this.innerHTML;
            } else if (tag === 'big') {
                latex += this.innerHTML;
            } else if (tag === 'span') {
                var classes = this.classList;
                if (classes.length === 0) {
                    if (this.innerHTML === '    ')
                        latex += '\\quad ';
                    else
                        latex += this.innerHTML;
                } else if (classes.contains('textarea')) {
                } else if (classes.contains('text')) {
                    latex += ' \\text{' + contents + '} ';
                } else if (classes.contains('fraction')) {
                    var numerator = latex2HTML($(this).children('.numerator').children());
                    var denominator = latex2HTML($(this).children('.denominator').children());
                    latex += ' \\frac{' + numerator + '}{' + denominator + '} ';
                } else if (classes.contains('binary-operator')) {
                    latex += this.innerHTML;
                } else if ($(this).children('.sqrt-stem').length > 0) {
                    contents = latex2HTML($(this).children('.sqrt-stem').children());
                    latex += ' \\sqrt{' + contents + '} ';
                } else if (classes.contains('non-italicized-function')) {
                    latex += ' \\' + this.innerHTML + ' ';
                } else if (classes.contains('paren')) {
                    var next = $(this).next();
                    var arr = next.children('.array');
                    if (arr.length > 0) {
                        // left paren for a binom
                        var top = latex2HTML(arr.children(':first').children());
                        var bottom = latex2HTML(arr.children(':last').children());
                        latex += ' \\binom{' + top + '}{' + bottom + '} ';
                    } else if ($(this).prev().children('.array').length > 0) {
                        // right paren for a binom, skip it
                    } else {
                        // regular paren
                        switch (this.innerHTML) {
                            case '{':
                                latex += ' \\left \\';
                                break;
                            case '(':
                            case '[':
                                latex += ' \\left';
                                break;
                            case '}':
                                latex += ' \\right \\';
                                break;
                            case ')':
                            case ']':
                                latex += ' \\right';
                                break;
                        }
                        latex += this.innerHTML + ' ';
                    }
                } else if (classes.contains('array') || $(this).children('.array').length > 0) {
                    // handled with the paren
                } else if (classes.contains('underline')) {
                    latex += ' \\underline{' + contents + '} ';
                } else if (classes.contains('overline')) {
                    latex += ' \\overline{' + contents + '} ';
                } else if ($(this).children('.vector-stem').length > 0) {
                    contents = latex2HTML($(this).children('.vector-stem').children());
                    latex += ' \\vec{' + contents + '} ';
                } else if (classes.contains('non-leaf')) {
                    latex += latex2HTML($(this).children());
                } else {
                    latex += latex2HTML($(this.innerHTML));
                }
            }
        });
        return latex;
    }

    MathBox.prototype.getTextBeforeCursor = function () {
        var cursor = this.el.find('.cursor');
        var html = $(cursor.prevAll().not('.textarea').get().reverse());
        return latex2HTML(html);
    };

    MathBox.prototype.getTextAfterCursor = function () {
        var cursor = this.el.find('.cursor');
        var html = cursor.nextAll().not('.textarea');
        return latex2HTML(html);
    };

    MathBox.prototype.isEmpty = function () {
        return this.getText() === '';
    };

    MathBox.prototype.textNotChanged = function () {
        return this.prevText === this.getText();
    };

    MathBox.prototype.updatePrevText = function () {
        var el = this.el;
        var mb = this;
        setTimeout(function () {
            var text = el.mathquill('latex');
            if (text === undefined || text === null)
                text = '';
            mb.prevText = text;
        }, 10);
    };

    MathBox.prototype.update = function () {
        this.cursor.update();

        this.updatePrevText();
        app.document.save.bind(app.document)();
    };

    return app;
})(app || {});