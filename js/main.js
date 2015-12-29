/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
    mathbox.find('textarea').focus();
}

function unfocus(mathbox) {
    mathbox.find('textarea').blur();
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
    return mathbox.find('sub.hasCursor, sup.hasCursor').length > 0;
}

var prevCursorAtBeginning = {}; // TODO: Seriously? Get A Better name than this

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

var prevCursorAtEnd = {}; // TODO: Seriously? Get A Better name than this

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
    save();
}

// Keyboard Stuff

function onEnter(mathbox) {
    //TODO: This needs hella refactoring
    /** Adds a new mathbox directly below and focuses it
     * */
    if (isCursorAtEnd(mathbox)) {
        mathbox.after('<span class="mathquill-editable mathbox"></span>');
        var next = mathbox.next();
        next.mathquill('editable');
        focus(next);
        mathboxIdNumber++;
        next.attr('id', mathboxIdNumber);
        update(next);
    } else if (isCursorAtBeginning(mathbox)) {
        mathbox.before('<span class="mathquill-editable mathbox"></span>');
        var prev = mathbox.prev();
        prev.mathquill('editable');
        focus(prev);
        mathboxIdNumber++;
        prev.attr('id', mathboxIdNumber);
        update(prev);
    } else {
        // TODO: split up text between the two boxes
        mathbox.after('<span class="mathquill-editable mathbox"></span>');
        var next = mathbox.next();
        next.mathquill('editable');
        focus(next);
        mathboxIdNumber++;
        next.attr('id', mathboxIdNumber);
        update(next);
    }

}

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

// TODO: Indentation?, shortcut for plain text, multiple mathboxes

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
    }
    update(mathbox);
}

function onClick(e) {
    var mathbox = $(e.target).parent().parent();
    update(mathbox);
}

/******************************
 * CLIPBOARD
 ******************************/

function initClipboard() {
    new Clipboard('button');
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
//TODO: randomly breaks
function loadData() {
    var lines = store.get('lines');
    var mathbox = $('.mathbox:last');
    if (lines.length > 0) {
        mathbox.mathquill('latex', lines[0]);
        for (var i = 1; i < lines.length; i++) {
            keystroke(mathbox, 13);
            mathbox = mathbox.next();
            mathbox.mathquill('latex', lines[i]);
        }
    }
    unfocus($('.mathbox'));
    focus(mathbox);
}

function save() {
    store.set('lines', getLines());
}

/******************************
 * MENUS
 ******************************/

var isSaveDisplayed = false;
var isHelpDisplayed = false;

function hideEverything() {
    $('#container, footer, #save, #help').addClass('hidden');
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

    h2cLoaded.done(function(){
        var selectable = $('.selectable');
        selectable.addClass('hidden');
        $('#image-output').html('');
        html2canvas($('#text-output'), {
            onrendered: function(canvas) {
                $('#image-output').html(canvas);
                selectable.addClass('hidden')
            }
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

/************************************
 * BIG WRAPPER/LOADER FOR EVERYTHING
 ************************************/

// SAVING
$.getScript("https://cdnjs.cloudflare.com/ajax/libs/store.js/1.3.20/store.min.js", function () {
    loadData();
    setInterval(save, 5000);
});

// CLIPBOARD
$.getScript("https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.5/clipboard.min.js", initClipboard);

// KEY COMBINATIONS
$.getScript("js/hotkeys.min.js", function () {
    $(document).bind('keydown', 'alt+ctrl+s', toggleSaveMenu);
    $(document).bind('keydown', 'alt+ctrl+h', toggleHelpMenu);
});

// HTML TO CANVAS
var h2cLoaded = $.Deferred();
$.getScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js", function(){
    h2cLoaded.resolve();
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
});