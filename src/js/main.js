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

$(document).ready(function(){
    $('.notecard').keydown(function(e){
        var parent = $(e.target).parent().parent();
        if (e.key === "Enter"){
            parent.after('<span class="mathquill-editable mathbox"></span>');
            var next = parent.next();
            next.mathquill('editable');
            focus(next);
        } else if (e.key === "Backspace"){
            if(parent.mathquill('latex') !== ''){
            } else if ($(".mathbox").length == 1){
            } else {
                var prev = parent.prev();
                var next = parent.next();
                parent.remove();
                if (prev.length == 0)
                    focus(next);
                else
                    focus(prev);
            }
        }
    });
});