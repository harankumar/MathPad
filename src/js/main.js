/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
function keystroke(e,n){var t=$.Event("keydown");t.bubbles=!1,t.cancelable=!1,t.charCode=n,t.keyCode=n,t.which=n,e.children().children("textarea").trigger(t)}function focus(e){e.children().children("textarea").focus()}function getID(e){return e.attr("id")}function isEmpty(e){return""===e.mathquill("latex")}function isCursorAtBeginning(e){return e.children(":nth-child(2)").hasClass("cursor")}function moveCursorToBeginning(e){keystroke(e,36)}function isCursorAtEnd(e){return e.children(":last-child").hasClass("cursor")}function moveCursorToEnd(e){keystroke(e,35)}function isCursorElevated(e){return e.find("sub.hasCursor, sup.hasCursor").length>0}function updatePrevCursorAtBeginning(e){setTimeout(function(){prevCursorAtBeginning[getID(e)]=isCursorAtBeginning(e)},10)}function cursorAtBeginningNotChanged(e){var n=prevCursorAtBeginning[getID(e)],t=isCursorAtBeginning(e);return n===t}function updatePrevCursorAtEnd(e){setTimeout(function(){prevCursorAtEnd[getID(e)]=isCursorAtEnd(e)},10)}function cursorAtEndNotChanged(e){var n=prevCursorAtEnd[getID(e)],t=isCursorAtEnd(e);return n===t}function updatePrevCursorElevation(e){setTimeout(function(){prevCursorElevation[getID(e)]=isCursorElevated(e)},10)}function cursorElevationNotChanged(e){var n=prevCursorElevation[getID(e)],t=isCursorElevated(e);return n===t}function textNotChanged(e){var n=prevText[getID(e)],t=e.mathquill("latex");return n===t}function updatePrevText(e){setTimeout(function(){var n=e.mathquill("latex");(void 0===n||null===n)&&(n=""),prevText[getID(e)]=n},10)}function update(e){updatePrevCursorAtBeginning(e),updatePrevCursorAtEnd(e),updatePrevText(e),updatePrevCursorElevation(e)}function onEnter(e){if(isCursorAtEnd(e)){e.after('<span class="mathquill-editable mathbox"></span>');var n=e.next();n.mathquill("editable"),focus(n),mathboxIdNumber++,n.attr("id",mathboxIdNumber),update(n)}else if(isCursorAtBeginning(e)){e.before('<span class="mathquill-editable mathbox"></span>');var t=e.prev();t.mathquill("editable"),focus(t),mathboxIdNumber++,t.attr("id",mathboxIdNumber),update(t)}else{e.after('<span class="mathquill-editable mathbox"></span>');var n=e.next();n.mathquill("editable"),focus(n),mathboxIdNumber++,n.attr("id",mathboxIdNumber),update(n)}}function onBackspace(e){var n=e.prev();e.next(),isCursorAtBeginning(e)&&textNotChanged(e)&&$(".mathbox").length>1&&(n.mathquill("latex",n.mathquill("latex")+" "+e.mathquill("latex")),e.remove(),focus(n))}function onDelete(e){var n=(e.prev(),e.next());isCursorAtEnd(e)&&textNotChanged(e)&&$(".mathbox").length>1&&(n.mathquill("latex",e.mathquill("latex")+" "+n.mathquill("latex")),e.remove(),focus(n))}function onArrowLeft(e){var n=e.prev();isCursorAtBeginning(e)&&cursorAtBeginningNotChanged(e)&&0!==n.length&&(focus(n),moveCursorToEnd(n)),update(e)}function onArrowRight(e){var n=e.next();isCursorAtEnd(e)&&cursorAtEndNotChanged(e)&&0!==n.length&&(focus(n),moveCursorToBeginning(n))}function onArrowUp(e){var n=e.prev();0!==n.length&&cursorElevationNotChanged(e)&&(focus(n),moveCursorToEnd(n))}function onArrowDown(e){var n=e.next();0!==n.length&&cursorElevationNotChanged(e)&&(focus(n),moveCursorToBeginning(n))}function onKeyDown(e){var n=$(e.target).parent().parent();"Enter"===e.key?onEnter(n):"Backspace"===e.key?onBackspace(n):"Delete"===e.key?onDelete(n):"ArrowLeft"===e.key?onArrowLeft(n):"ArrowRight"===e.key?onArrowRight(n):"ArrowUp"===e.key?onArrowUp(n):"ArrowDown"===e.key&&onArrowDown(n),update(n)}function onClick(e){var n=$(e.target).parent().parent();update(n)}function displayHelpMenu(){$("#help").removeClass("hidden"),$("#container, footer").addClass("hidden"),isHelpDisplayed=!0}function hideHelpMenu(){$("#help").addClass("hidden"),$("#container, footer").removeClass("hidden"),isHelpDisplayed=!1}function toggleHelpMenu(){isHelpDisplayed?hideHelpMenu():displayHelpMenu()}var mathboxIdNumber=1,prevCursorAtBeginning={},prevCursorAtEnd={},prevCursorElevation={},prevText={},isHelpDisplayed=!1;$(document).ready(function(){var e=$(".notecard");e.keydown(onKeyDown),e.click(onClick),$("#help-button").click(displayHelpMenu),$(document).bind("keydown","alt+ctrl+h",toggleHelpMenu),$("#help-modal-close").click(hideHelpMenu)});