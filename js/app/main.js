/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// SAVING
loadData();
setInterval(save, 5000);

// CLIPBOARD
initClipboard();

// KEY COMBINATIONS
bindCombos();

// ROUTER
route();

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