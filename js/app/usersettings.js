/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var app = (function (app) {
    app.usersettings = {
        rootFontSize: {
            value: 16,
            set: function (_value) {
                this.value = _value;
                $('html').css('font-size', _value + 'px');
                app.usersettings.save();
            }
        },
        load: function () {
            this.rootFontSize.set(store.get('rootFontSize'));
        },
        store: function () {
            store.set('rootFontSize', this.rootFontSize.value);
        },
        save: function () {
            this.store();
            setTimeout(function () {
                app.usersettings.store();
            }, 10);
        }

    };
    return app;
})(app || {});