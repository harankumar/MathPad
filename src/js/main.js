var id_no = 1;

function keystroke(mathbox, keyCode) {
    var customKeyDownEvent = $.Event('keydown');

    customKeyDownEvent.bubbles = false;
    customKeyDownEvent.cancelable = false;
    customKeyDownEvent.charCode = keyCode;
    customKeyDownEvent.keyCode = keyCode;
    customKeyDownEvent.which = keyCode;

    mathbox.children().children('textarea').trigger(customKeyDownEvent);
}

function focus(mathbox) {
    mathbox.children().children('textarea').focus();
}

function getID(mathbox) {
    return mathbox.attr('id');
}

var empty = {};

function isEmpty(mathbox) {
    var id = getID(mathbox);
    var previous = empty[id];
    var present = mathbox.mathquill('latex') === '';

    if (previous && present) {
        empty[id] = false;
        return true;
    } else if (present) {
        empty[id] = true;
        return false;
    } else {
        empty[id] = false;
        return false;
    }
}

var cursorAtBeginning = {};

function isCursorAtBeginning(mathbox) {
    var id = getID(mathbox);
    var previous = cursorAtBeginning[id];
    var present = mathbox.children(":nth-child(2)").hasClass("cursor");
    if (previous && present) {
        cursorAtBeginning[id] = false;
        return true;
    } else if (present) {
        cursorAtBeginning[id] = true;
        return false;
    } else {
        cursorAtBeginning[id] = false;
        return false;
    }
}

function moveCursorToBeginning(mathbox) {
    keystroke(mathbox, 36);
    cursorAtBeginning[getID(mathbox)] = true;
}

function isCursorAtEnd(mathbox) {
    return mathbox.children(":last-child").hasClass("cursor");
}

function moveCursorToEnd(mathbox) {
    keystroke(mathbox, 35);
}

var prevText = {};

function textNotChanged(mathbox) {
    var prev = prevText[getID(mathbox)];
    var curr = mathbox.mathquill('latex');
    //console.log(prev + ' ' + curr);
    return prev === curr;
}

function update(mathbox) {
    isCursorAtBeginning(mathbox);
    isCursorAtEnd(mathbox);
    isEmpty(mathbox);
    updatePrevText(mathbox);
}

function updatePrevText(mathbox) {
    setTimeout(function () {
        var text = mathbox.mathquill('latex');
        if (text === undefined || text === null)
            text = '';
        prevText[getID(mathbox)] = text;
    }, 30);
}

$(document).ready(function () {
    //TODO: Make this a switch statement?
    $('.notecard').keydown(function (e) {
        var mathbox = $(e.target).parent().parent();
        if (e.key === "Enter") {
            //TODO: This needs hella refactoring
            /** Adds a new mathbox directly below and focuses it
             *
             * */
            if (isCursorAtEnd(mathbox)) {
                mathbox.after('<span class="mathquill-editable mathbox"></span>');
                var next = mathbox.next();
                next.mathquill('editable');
                focus(next);
                id_no++;
                next.attr('id', id_no);
                update(next);
            } else if (isCursorAtBeginning(mathbox)) {
                mathbox.before('<span class="mathquill-editable mathbox"></span>');
                var prev = mathbox.prev();
                prev.mathquill('editable');
                focus(prev);
                id_no++;
                prev.attr('id', id_no);
                update(prev);
            } else {
                // TODO: split up text between the two boxes
                mathbox.after('<span class="mathquill-editable mathbox"></span>');
                var next = mathbox.next();
                next.mathquill('editable');
                focus(next);
                id_no++;
                next.attr('id', id_no);
                update(next);
            }
        } else if (e.key === "Backspace") {
            /** If at the beginning of mathbox and there are more than one:
             * If current box is empty:
             * Delete current box, focus box directly above
             * If current box not empty and there is a box above it:
             * Combine previous and current box into one, focus it
             * */
            var prev = mathbox.prev();
            var next = mathbox.next();
            if (mathbox.children(":nth-child(2)").hasClass("cursor") && textNotChanged(mathbox) && $(".mathbox").length > 1) {
                prev.mathquill('latex', prev.mathquill('latex') + ' ' + mathbox.mathquill('latex'));
                mathbox.remove();
                focus(prev);
            }
        } else if (e.key === "Delete") {
            /** If at the end of mathbox and there are more than one:
             * If current box is empty:
             * Delete current box, focus box directly below (or above, if that's the only one left)
             * If current box not empty and there is a box below it:
             * Delete next box, maintain focus on current TODO: have a more traditional behavior here
             * */
            var prev = mathbox.prev();
            var next = mathbox.next();
            if (isCursorAtEnd(mathbox) && $(".mathbox").length > 1) {
                if (isEmpty(mathbox)) {
                    mathbox.remove();
                    if (next.length === 0)
                        focus(prev);
                    else
                        focus(next);
                } else if (next.length !== 0) {
                    next.remove();
                }
            }
        }
        else if (e.key === "ArrowLeft") {
            if (isCursorAtBeginning(mathbox)) {
                var prev = mathbox.prev();
                if (prev.length !== 0) {
                    focus(prev);
                    moveCursorToEnd(prev);
                }
            }
            update(mathbox);
        } else if (e.key === "ArrowRight" && isCursorAtEnd(mathbox)) {
            var next = mathbox.next();
            if (next.length !== 0) {
                focus(next);
                moveCursorToBeginning(next);
            }
        } else if (e.key === "ArrowUp") {
            var prev = mathbox.prev();
            if (prev.length !== 0) {
                focus(prev);
                moveCursorToEnd(prev);
            }
        } else if (e.key === "ArrowDown") {
            var next = mathbox.next();
            if (next.length !== 0) {
                focus(next);
                moveCursorToBeginning(next);
            }
        } else {
            update(mathbox);
        }
        updatePrevText(mathbox);
        // TODO: Indentation?, shortcut for plain text
    }).click(function (e) {
        var mathbox = $(e.target).parent().parent();
        update(mathbox);
    });
});