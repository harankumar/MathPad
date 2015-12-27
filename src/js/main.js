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

function isEmpty(mathbox) {
    return mathbox.mathquill('latex') === '';
}

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
    // Leaving this wrapper here since I might need to add more update functions
    updatePrevText(mathbox);
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
        } else if (e.key === "Delete") {
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
        }
        update(mathbox);
        // TODO: Indentation?, shortcut for plain text
    }).click(function (e) {
        var mathbox = $(e.target).parent().parent();
        update(mathbox);
    });
});