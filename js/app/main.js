/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// ROUTER
app.screens.route();
app.screens.initListeners();

// DOCUMENT
app.document.load.bind(app.document)();

// SETTINGS
app.usersettings.load();

// CLIPBOARD
app.clipboard.initialize();