/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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

    $.when(canvasLoaded).done(function () {
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