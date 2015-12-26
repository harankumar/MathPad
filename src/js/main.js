function keystroke(mathbox, keyCode) {
    var customKeyDownEvent = $.Event('keydown');

    customKeyDownEvent.bubbles = false;
    customKeyDownEvent.cancelable = false;
    customKeyDownEvent.charCode = keyCode;
    customKeyDownEvent.keyCode = keyCode;
    customKeyDownEvent.which = keyCode;

    mathbox.children().children('textarea').trigger(customKeyDownEvent);
}

function focus(mathbox){
    mathbox.children().children('textarea').focus();
}

function isCursorAtBeginning(mathbox) {
    return mathbox.children(":nth-child(2)").hasClass("cursor");
}

function isCursorAtEnd(mathbox) {
    return mathbox.children(":last-child").hasClass("cursor");
}

function isEmpty(mathbox) {
    return mathbox.mathquill('latex') === '';
}

function moveCursorToBeginning(mathbox) {
    keystroke(mathbox, 36);
}

function moveCursorToEnd(mathbox) {
    keystroke(mathbox, 35);
}

$(document).ready(function(){
    $('header').click(function () {
        keystroke($('.mathbox'), 36);
    });
    //TODO: Make this a switch statement?
    $('.notecard').keydown(function(e){
        var mathbox = $(e.target).parent().parent();
        if (e.key === "Enter") {
            /** Adds a new mathbox directly below and focuses it
             *
             * */
            if (isCursorAtEnd(mathbox)) {
                mathbox.after('<span class="mathquill-editable mathbox"></span>');
                var next = mathbox.next();
                next.mathquill('editable');
                focus(next);
            } else if (isCursorAtBeginning(mathbox)) {
                mathbox.before('<span class="mathquill-editable mathbox"></span>');
                var prev = mathbox.prev();
                prev.mathquill('editable');
                focus(prev);
            } else {
                // TODO: split up text between the two boxes
                mathbox.after('<span class="mathquill-editable mathbox"></span>');
                var next = mathbox.next();
                next.mathquill('editable');
                focus(next);
            }
        } else if (e.key === "Backspace"){
            /** If at the beginning of mathbox and there are more than one:
                 * If current box is empty:
                     * Delete current box, focus box directly above
                 * If current box not empty and there is a box above it:
                     * Delete previous box, maintain focus on current TODO: have a more traditional behavior here
             * */
            var prev = mathbox.prev();
            var next = mathbox.next();
            if (isCursorAtBeginning(mathbox) && $(".mathbox").length > 1) {
                if (isEmpty(mathbox)) {
                    mathbox.remove();
                    focus(prev);
                } else if (prev.length !== 0) {
                    prev.remove();
                }
            }
        } else if (e.key === "Delete"){
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
        } // TODO: Arrow Key Jump triggers too early
        else if (e.key === "ArrowLeft" && isCursorAtBeginning(mathbox)) {
            var prev = mathbox.prev();
            if (prev.length !== 0) {
                focus(prev);
                moveCursorToEnd(prev);
            }
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

        // TODO: Indentation?, shortcut for plain text
    });
});