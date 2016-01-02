/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var app = (function (app) {
    app.screens = {
        save: {
            displayed: false,
            load: function () {
                var lines = app.document.asArray.bind(app.document)();

                var textOutput = $('#text-output');
                textOutput.html('');
                for (var i = 0; i < lines.length; i++) {
                    textOutput.append('<div class="mathquill-embedded-latex"></div>');
                    textOutput.find('div:last').text(lines[i]).mathquill();
                    textOutput.append('<br>');
                }

                $('#latex-source').val(app.document.asString());

                var canvasLoaded = $.Deferred();
                var selectable = $('.selectable');
                selectable.addClass('hidden');
                $('#image-output').html('');
                html2canvas(textOutput, {
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
            },
            show: function () {
                app.screens.hideAll();
                $('#save').removeClass('hidden');
                app.screens.save.displayed = true;
                window.location.hash = "save";

                setTimeout(app.screens.save.load, 10);

            },
            toggle: function () {
                if (app.screens.save.displayed)
                    app.screens.document.show();
                else
                    app.screens.save.show();
            }
        },
        settings: {
            displayed: false,
            load: function () {
                $('#font-size-select').change(function () {
                    app.usersettings.rootFontSize.set(this.value);
                });
            },
            show: function () {
                app.screens.hideAll();
                $('#settings').removeClass('hidden');
                app.screens.settings.displayed = true;
                window.location.hash = "settings";

                app.screens.settings.load();
            },
            toggle: function () {
                if (app.screens.settings.displayed)
                    app.screens.document.show();
                else
                    app.screens.settings.show();
            }
        },
        help: {
            displayed: false,
            show: function () {
                app.screens.hideAll();
                $('#help').removeClass('hidden');
                app.screens.help.displayed = true;
                window.location.hash = "help";
            },
            toggle: function () {
                if (app.screens.help.displayed)
                    app.screens.document.show();
                else
                    app.screens.help.show();
            }

        },
        document: {
            show: function () {
                app.screens.hideAll();
                $('#container, footer').removeClass('hidden');
                window.location.hash = "document";
            }
        },
        hideAll: function () {
            $('#container, footer, #save, #help, #settings').addClass('hidden');
            app.screens.save.displayed = false;
            app.screens.settings.displayed = false;
            app.screens.help.displayed = false;
        },
        route: function () {
            var hash = window.location.hash.substring(1);
            switch (hash) {
                case "save":
                    app.screens.save.show();
                    break;
                case "settings":
                    app.screens.settings.show();
                    break;
                case "help":
                    app.screens.settings.show();
                    break;
                case "document":
                case "":
                    app.screens.document.show();
                    break;
                default:
                    app.screens.document.show();
                    console.log("Unrecognized hash " + hash);
            }
        },
        initListeners: function () {
            var doc = $(document);
            doc.ready(function () {

                $('#save-button').click(app.screens.save.show);
                $('#save-close').click(app.screens.document.show);
                doc.bind('keydown', 'alt+ctrl+s', app.screens.save.toggle);

                $('#help-button').click(app.screens.help.show);
                $('#help-close').click(app.screens.document.show);
                doc.bind('keydown', 'alt+ctrl+j', app.screens.settings.toggle);

                $('#settings-button').click(app.screens.settings.show);
                $('#settings-close').click(app.screens.document.show);
                doc.bind('keydown', 'alt+ctrl+h', app.screens.help.toggle);
            });
        }
    };
    return app;
})(app || {});