/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var app = (function (app) {
    app.clipboard = {
        initialize: function () {
            new Clipboard('.copy-button');
        }
    };
    return app;
})(app || {});