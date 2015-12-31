/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var mathboxText = '<span class="mathquill-editable mathbox"></span>';

/******************************
 * NAVIGATION
 ******************************/

// Mathox Manipulation

function keystroke(mathbox, keyCode) {
    var customKeyDownEvent = $.Event('keydown');

    customKeyDownEvent.bubbles = false;
    customKeyDownEvent.cancelable = false;
    customKeyDownEvent.charCode = keyCode;
    customKeyDownEvent.keyCode = keyCode;
    customKeyDownEvent.which = keyCode;

    mathbox.children().children('textarea').trigger(customKeyDownEvent);
}

// Focus

function focus(mathbox) {
    unfocus($('.mathbox'));
    mathbox.find('textarea').focus();
    keystroke(mathbox, 32);
}

function unfocus(mathbox) {
    mathbox.find('textarea').blur();
    mathbox.find('.cursor').remove();
    mathbox.removeClass('.hasCursor');
    mathbox.find('.hasCursor').removeClass('.hasCursor');
}

// ID

var mathboxIdNumber = 1;

function getID(mathbox) {
    return mathbox.attr('id');
}

// Mathbox Status/Update Stuff

function isEmpty(mathbox) {
    return mathbox.mathquill('latex') === '';
}

/* Cursor Stuff */

function isCursorAtBeginning(mathbox) {
    return mathbox.children(":nth-child(2)").hasClass("cursor");
}

function moveCursorToBeginning(mathbox) {
    keystroke(mathbox, 36);
}

function isCursorAtEnd(mathbox) {
    return mathbox.children(":last-child").hasClass("cursor");
}

function moveCursorToEnd(mathbox) {
    keystroke(mathbox, 35);
}

function isCursorElevated(mathbox) {
    // Checks if cursor is in super or subscript
    return mathbox.find('sub.hasCursor, sup.hasCursor, .fraction .hasCursor').length > 0;
}

function isCursorCommandInput(mathbox) {
    return mathbox.find('.latex-command-input.hasCursor, .text .cursor').length > 0;
}

var prevCursorAtBeginning = {};

function updatePrevCursorAtBeginning(mathbox) {
    setTimeout(function () {
        prevCursorAtBeginning[getID(mathbox)] = isCursorAtBeginning(mathbox);
    }, 10);
}

function cursorAtBeginningNotChanged(mathbox) {
    var prev = prevCursorAtBeginning[getID(mathbox)];
    var curr = isCursorAtBeginning(mathbox);
    return prev === curr;
}

var prevCursorAtEnd = {};

function updatePrevCursorAtEnd(mathbox) {
    setTimeout(function () {
        prevCursorAtEnd[getID(mathbox)] = isCursorAtEnd(mathbox);
    }, 10);
}

function cursorAtEndNotChanged(mathbox) {
    var prev = prevCursorAtEnd[getID(mathbox)];
    var curr = isCursorAtEnd(mathbox);
    return prev === curr;
}

var prevCursorElevation = {};

function updatePrevCursorElevation(mathbox) {
    setTimeout(function () {
        prevCursorElevation[getID(mathbox)] = isCursorElevated(mathbox);
    }, 10);
}

function cursorElevationNotChanged(mathbox) {
    var prev = prevCursorElevation[getID(mathbox)];
    var curr = isCursorElevated(mathbox);
    return prev === curr;
}

var prevCursorCI = {};

function updatePrevCursorCI(mathbox) {
    setTimeout(function () {
        prevCursorCI[getID(mathbox)] = isCursorCommandInput(mathbox);
    }, 10);
}

function cursorCIChanged(mathbox) {
    var prev = prevCursorCI[getID(mathbox)];
    var curr = isCursorCommandInput(mathbox);
    return prev !== curr;
}

/* Text Change Stuff */

var prevText = {};

function textNotChanged(mathbox) {
    var prev = prevText[getID(mathbox)];
    var curr = mathbox.mathquill('latex');
    return prev === curr;
}

function updatePrevText(mathbox) {
    setTimeout(function () {
        var text = mathbox.mathquill('latex');
        if (text === undefined || text === null)
            text = '';
        prevText[getID(mathbox)] = text;
    }, 10);
}

function update(mathbox) {
    updatePrevCursorAtBeginning(mathbox);
    updatePrevCursorAtEnd(mathbox);
    updatePrevText(mathbox);
    updatePrevCursorElevation(mathbox);
    updatePrevCursorCI(mathbox);
    save();
    bindCombos();
}

/* Misc Utils */

function add(mathbox) {
    mathbox.mathquill('editable');
    focus(mathbox);
    mathboxIdNumber++;
    mathbox.attr('id', mathboxIdNumber);
    update(mathbox);
    moveCursorToBeginning(mathbox);
}

function prevLatex(mathbox) {
    var cursor = $('.cursor');
    var prevHtml = $(cursor.prevAll().not('.textarea').get().reverse());
    return getLatex(prevHtml);
}

function nextLatex(mathbox) {
    var cursor = $('.cursor');
    var nextHtml = cursor.nextAll().not('.textarea');
    return getLatex(nextHtml);
}

function getLatex(html) {
    var latex = "";
    html.each(function () {
        var t = this.outerHTML;
        if (t === undefined || t === null || t === '')
            return;
        var tag = this.tagName.toLowerCase();
        var contents = getLatex($(this).children());
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
                var numerator = getLatex($(this).children('.numerator').children());
                var denominator = getLatex($(this).children('.denominator').children());
                latex += ' \\frac{' + numerator + '}{' + denominator + '} ';
            } else if (classes.contains('binary-operator')) {
                latex += this.innerHTML;
            } else if ($(this).children('.sqrt-stem').length > 0) {
                contents = getLatex($(this).children('.sqrt-stem').children());
                latex += ' \\sqrt{' + contents + '} ';
            } else if (classes.contains('non-italicized-function')) {
                latex += ' \\' + this.innerHTML + ' ';
            } else if (classes.contains('paren')) {
                var next = $(this).next();
                var arr = next.children('.array');
                if (arr.length > 0) {
                    // left paren for a binom
                    var top = getLatex(arr.children(':first').children());
                    var bottom = getLatex(arr.children(':last').children());
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
                contents = getLatex($(this).children('.vector-stem').children());
                latex += ' \\vec{' + contents + '} ';
            } else if (classes.contains('non-leaf')) {
                latex += getLatex($(this).children());
            } else {
                latex += getLatex($(this.innerHTML));
            }
        }
    });
    return latex;
}

// Keyboard Stuff

function onEnter(mathbox) {
    /** Adds a new mathbox directly below and focuses it
     * */
    // make the enter wouldn't go to some mathquill purpose
    if (isCursorCommandInput(mathbox) || cursorCIChanged(mathbox))
        return;
    if (isCursorAtEnd(mathbox)) {
        mathbox.after(mathboxText);
        var next = mathbox.next();
        add(next);
    } else if (isCursorAtBeginning(mathbox)) {
        mathbox.before(mathboxText);
        var prev = mathbox.prev();
        add(prev);
    } else {
        // make sure cursor not elevated
        if (isCursorElevated(mathbox))
            return;
        if (mathbox.children('.cursor').length == 0)
            return;
        // determine latex before and after cursor
        var _prevLatex = prevLatex(mathbox);
        var _nextLatex = nextLatex(mathbox);
        // add new box
        mathbox.after(mathboxText);
        var next = mathbox.next();
        add(next);
        // write latex to current and previous box
        mathbox.mathquill('latex', _prevLatex);
        next.mathquill('latex', _nextLatex);
        // focus current
        unfocus($('.mathbox'));
        focus(next);
        moveCursorToBeginning(next);
    }

}

//TODO: not just moving cursor to the end or beginning of line !!!important
function onBackspace(mathbox) {
    /** If at the beginning of mathbox, there are more than one, and the backspace wasn't also a text deleting one:
     * Combine the mathbox with the previous one
     * */
    var prev = mathbox.prev();
    var next = mathbox.next();
    if (isCursorAtBeginning(mathbox) && textNotChanged(mathbox) && $(".mathbox").length > 1) {
        prev.mathquill('latex', prev.mathquill('latex') + ' ' + mathbox.mathquill('latex'));
        mathbox.remove();
        focus(prev);
        moveCursorToEnd(prev);
    }
}

function onDelete(mathbox) {
    /** If at the end of mathbox, there are more than one, and the delete wasn't also a text deleting one:
     * Combine the mathbox with the next one
     * */
    var prev = mathbox.prev();
    var next = mathbox.next();
    if (isCursorAtEnd(mathbox) && textNotChanged(mathbox) && $(".mathbox").length > 1) {
        next.mathquill('latex', mathbox.mathquill('latex') + ' ' + next.mathquill('latex'));
        mathbox.remove();
        focus(next);
        moveCursorToEnd(next);
    }
}

function onArrowLeft(mathbox) {
    /** If at the beginning of mathbox, there is a box above, and the keystroke didn't cause cursor movement:
     * Move to mathbox directly above
     * */
    var prev = mathbox.prev();
    if (isCursorAtBeginning(mathbox) && cursorAtBeginningNotChanged(mathbox) && prev.length !== 0) {
        focus(prev);
        moveCursorToEnd(prev);
    }
    update(mathbox);
}

function onArrowRight(mathbox) {
    /** If at the end of mathbox, there is a box below, and the keystroke didn't cause cursor movement:
     * Move to mathbox directly below
     * */
    var next = mathbox.next();
    if (isCursorAtEnd(mathbox) && cursorAtEndNotChanged(mathbox) && next.length !== 0) {
        focus(next);
        moveCursorToBeginning(next);
    }
}

function onArrowUp(mathbox) {
    /** If there is a box above, and the keystroke didn't cause an elevation change:
     *  move to it */
    var prev = mathbox.prev();
    if (prev.length !== 0 && cursorElevationNotChanged(mathbox)) {
        focus(prev);
        moveCursorToEnd(prev);
    }
}

function onArrowDown(mathbox) {
    /** If there is a box below, and the keystroke didn't cause an elevation change:
     * move to it */
    var next = mathbox.next();
    if (next.length !== 0 && cursorElevationNotChanged(mathbox)) {
        focus(next);
        moveCursorToBeginning(next);
    }
}

function onTab(mathbox, e) {
    e.preventDefault();
    if (isCursorCommandInput(mathbox) || cursorCIChanged(mathbox))
        return;
    if (isCursorElevated(mathbox))
        return;
    var _prevLatex = prevLatex(mathbox);
    var _nextLatex = nextLatex(mathbox);
    mathbox.mathquill('latex', _prevLatex + '\\quad ' + _nextLatex);
    focus(mathbox);
}

// TODO: shortcut for plain text, multiple mathboxes

// Listeners

function onKeyDown(e) {
    var mathbox = $(e.target).parent().parent();
    if (e.key === "Enter" || e.keyCode === 13) {
        onEnter(mathbox);
    } else if (e.key === "Backspace" || e.keyCode === 8) {
        onBackspace(mathbox);
    } else if (e.key === "Delete" || e.keyCode === 46) {
        onDelete(mathbox);
    } else if (e.key === "ArrowLeft" || e.keyCode === 37) {
        onArrowLeft(mathbox);
    } else if (e.key === "ArrowRight" || e.keyCode === 39) {
        onArrowRight(mathbox);
    } else if (e.key === "ArrowUp" || e.keyCode === 38) {
        onArrowUp(mathbox);
    } else if (e.key === "ArrowDown" || e.keyCode === 40) {
        onArrowDown(mathbox);
    } else if (e.key === "Tab" || e.keyCode === 9) {
        onTab(mathbox, e);
    }
    update(mathbox);
}

function onClick(e) {
    var mathbox = $(e.target).parent().parent();
    update(mathbox);
}

// Combinations

function onCombo(func) {
    function a(event) {
        event.preventDefault();
        func();
    }

    return a;
}

function bindCombos() {
    $(document).unbind();
    $(document).bind('keydown', 'alt+ctrl+s', onCombo(toggleSaveMenu));
    $(document).bind('keydown', 'alt+ctrl+j', onCombo(toggleSettingsMenu));
    $(document).bind('keydown', 'alt+ctrl+h', onCombo(toggleHelpMenu));

    var textarea = $('.mathbox textarea');
    textarea.unbind();
    textarea.bind('keydown', 'alt+ctrl+s', onCombo(toggleSaveMenu));
    textarea.bind('keydown', 'alt+ctrl+j', onCombo(toggleSettingsMenu));
    textarea.bind('keydown', 'alt+ctrl+h', onCombo(toggleHelpMenu));
    //textarea.bind('keydown', 'shift+esc', onCombo(plaintext));
}

/******************************
 * CLIPBOARD
 ******************************/

function initClipboard() {
    new Clipboard('.copy-button');
}

/******************************
 * SAVE
 ******************************/

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
    saveDataLoaded.resolve();
}

function _save() {
    saveDocument();
    saveSettings();
}

function save() {
    saveDataLoaded.done(function () {
        _save();
        setTimeout(function () {
            _save();
        }, 10);
    });
}

/******************************
 * SETTINGS
 ******************************/
// Theming
var rootFontSize = 16;

function setRootFontSize(value) {
    rootFontSize = value;
    $('html').css('font-size', rootFontSize + 'px');
    save();
}

/******************************
 * MENUS
 ******************************/

var isSaveDisplayed = false;
var isHelpDisplayed = false;
var isSettingsDisplayed = false;

function hideEverything() {
    $('#container, footer, #save, #help, #settings').addClass('hidden');
    isSaveDisplayed = false;
    isHelpDisplayed = false;
}

function showMathPad() {
    hideEverything();
    $('#container, footer').removeClass('hidden');
}

// Save Menu
function initSaveMenu() {
    var lines = getLines();

    var textOutput = $('#text-output');
    textOutput.html('');
    for (var i = 0; i < lines.length; i++) {
        textOutput.append('<div class="mathquill-embedded-latex"></div>');
        textOutput.find('div:last').text(lines[i]).mathquill();
        textOutput.append('<br>');
    }

    $('#latex-source').val(getDocument());

    var canvasLoaded = $.Deferred();
    h2cLoaded.done(function () {
        var selectable = $('.selectable');
        selectable.addClass('hidden');
        $('#image-output').html('');
        html2canvas($('#text-output'), {
            onrendered: function (canvas) {
                canvas.setAttribute('id', 'image-output-canvas');
                $('#image-output').html(canvas);
                selectable.addClass('hidden');
                canvasLoaded.resolve();
            }
        });
    });

    $.when(fsReady, canvasLoaded).done(function () {
        var downloadBtn = $('#image-download');
        var canvas = document.getElementById('image-output-canvas');
        downloadBtn.off();
        downloadBtn.click(function () {
            canvas.toBlob(function (blob) {
                saveAs(blob, "math_document.png");
            });
        });
    });
}

function displaySaveMenu() {
    hideEverything();
    $('#save').removeClass('hidden');
    isSaveDisplayed = true;

    initSaveMenu();
}

function toggleSaveMenu() {
    if (isSaveDisplayed)
        showMathPad();
    else
        displaySaveMenu();
}

// Help Menu
function displayHelpMenu() {
    hideEverything();
    $('#help').removeClass('hidden');
    isHelpDisplayed = true;
}

function toggleHelpMenu() {
    if (isHelpDisplayed)
        showMathPad();
    else
        displayHelpMenu();
}

// Settings Menu
function initSettingsMenu() {
    $('#font-size-select').change(function () {
        setRootFontSize(this.value);
    });
}

function displaySettingsMenu() {
    hideEverything();
    $('#settings').removeClass('hidden');
    isSettingsDisplayed = true;

    initSettingsMenu();
}

function toggleSettingsMenu() {
    if (isSettingsDisplayed)
        showMathPad();
    else
        displaySettingsMenu();
}

// Router

function route() {
    var hash = window.location.hash.substring(1);
    switch (hash) {
        case "save":
            displaySaveMenu();
            break;
        case "settings":
            displaySettingsMenu();
            break;
        case "help":
            displayHelpMenu();
            break;
    }
}

/************************************
 * BIG WRAPPER/LOADER FOR EVERYTHING
 ************************************/

// SAVING
var saveDataLoaded = $.Deferred();
//$.getScript("https://cdnjs.cloudflare.com/ajax/libs/store.js/1.3.20/store.min.js", function () {
loadData();
setInterval(save, 5000);
//});

// CLIPBOARD
//$.getScript("https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.5/clipboard.min.js",
initClipboard();
//);

// KEY COMBINATIONS
//$.getScript("js/hotkeys.min.js",
bindCombos();

// HTML TO CANVAS
var h2cLoaded = $.Deferred();
//$.getScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js", function () {
    h2cLoaded.resolve();
//});

// CANVAS TO IMAGE FILE
var fsReady = $.Deferred();
var fsLoaded = $.Deferred();
var c2bLoaded = $.Deferred();

//$.getScript("https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2014-11-29/FileSaver.min.js", function () {
fsLoaded.resolve();
//});

//$.getScript("https://cdnjs.cloudflare.com/ajax/libs/javascript-canvas-to-blob/3.1.0/js/canvas-to-blob.min.js", function () {
c2bLoaded.resolve();
//});

$.when(fsLoaded, c2bLoaded).done(function () {
    fsReady.resolve();
});

// ROUTER
route();
$.when(saveDataLoaded, fsReady).done(function () {
    route();
});

// DOM
$(document).ready(function () {
    // NAVIGATION
    var notecard = $('.notecard');
    notecard.keydown(onKeyDown);
    notecard.click(onClick);
    // MENUS
    $('#save-button').click(displaySaveMenu);
    $('#save-close').click(showMathPad);
    $('#help-button').click(displayHelpMenu);
    $('#help-close').click(showMathPad);
    $('#settings-button').click(displaySettingsMenu);
    $('#settings-close').click(showMathPad);
});