// TODO: Refactor out methods
// TODO: Fix equality checking

function focus(mathbox){
    var customKeyDownEvent = $.Event('keydown');

    customKeyDownEvent.bubbles = false;
    customKeyDownEvent.cancelable = false;
    var key = 39;
    customKeyDownEvent.charCode = key;
    customKeyDownEvent.keyCode = key;
    customKeyDownEvent.which = key;

    mathbox.children().children('textarea').trigger(customKeyDownEvent).focus();
}

function cursorAtBeginning(mathbox){
    return mathbox.children(":nth-child(2)").hasClass("cursor");
}

function cursorAtEnd(mathbox){
    return mathbox.children(":last-child").hasClass("cursor");
}

$(document).ready(function(){
    $('.notecard').keydown(function(e){
        var mathbox = $(e.target).parent().parent();
        if (e.key === "Enter"){
            /** Adds a new mathbox directly below and focuses it
             * TODO: All text after the cursor goes into the next box
             */
            mathbox.after('<span class="mathquill-editable mathbox"></span>');
            var next = mathbox.next();
            next.mathquill('editable');
            focus(next);
        } else if (e.key === "Backspace"){
            /** If at the beginning of mathbox and there are more than one:
                 * If current box is empty:
                     * Delete current box, focus box directly above
                 * If current box not empty and there is a box above it:
                     * Delete previous box, maintain focus on current TODO: have a more traditional behavior here
             * */
            var prev = mathbox.prev();
            var next = mathbox.next();
            if (cursorAtBeginning(mathbox) && $(".mathbox").length > 1){
                if (mathbox.mathquill('latex') == ''){
                    mathbox.remove();
                    focus(prev);
                } else if (prev.length != 0){
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
            if (cursorAtEnd(mathbox) && $(".mathbox").length > 1){
                if (mathbox.mathquill('latex') == ''){
                    mathbox.remove();
                    if (next.length == 0)
                        focus(prev);
                    else
                        focus(next);
                } else if (next.length != 0){
                    next.remove();
                }
            }
        }
        // TODO: UP DOWN LEFT RIGHT
        // TODO: Indentation?, shortcut for plain text
    });
});