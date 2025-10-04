// ==UserScript==
// @name         Google Discover Toggle
// @namespace    https://github.com/ymhomer/ym_Userscript
// @version      1.2
// @description  Enable/disable Google Discover by toggling ?gl=nz. Persists across sessions.
// @author       ymhomer
// @match        https://www.google.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// @license      MIT
// @downloadURL  https://update.greasyfork.org/scripts/541203/Google%20Discover%20Toggle.user.js
// @updateURL    https://update.greasyfork.org/scripts/541203/Google%20Discover%20Toggle.meta.js
// ==/UserScript==

;(async function () {
    'use strict';

    const STORAGE_KEY = 'discoverEnabled';
    const DISCOVER_GL = 'nz';
    const GL_PARAM = 'gl';

    const GMAPI = (typeof GM?.getValue === 'function')
        ? {
            get:   (k, d) => GM.getValue(k, d),
            set:   (k, v) => GM.setValue(k, v),
            menu:  (label, cb) => GM.registerMenuCommand(label, cb)
          }
        : {
            get:   (k, d) => Promise.resolve(GM_getValue(k, d)),
            set:   (k, v) => Promise.resolve(GM_setValue(k, v)),
            menu:  (label, cb) => GM_registerMenuCommand(label, cb)
          };

    const isEnabled = await GMAPI.get(STORAGE_KEY, false);

    function buildUrlWithDiscover(enable) {
        try {
            const url = new URL(location.href);
            const params = url.searchParams;

            if (enable) {
                params.set(GL_PARAM, DISCOVER_GL);
            } else {
                params.delete(GL_PARAM);
            }

            return url.toString();
        } catch (e) {
            console.error('Google Discover Toggle: failed to build URL', e);
            return location.href;
        }
    }

    if (isEnabled && location.search.indexOf(`${GL_PARAM}=${DISCOVER_GL}`) === -1) {
        const target = buildUrlWithDiscover(true);
        location.replace(target);
        return;
    }

    const menuLabel = `${isEnabled ? 'Disable' : 'Enable'} Google Discover`;

    GMAPI.menu(menuLabel, async () => {
        const newState = !isEnabled;
        await GMAPI.set(STORAGE_KEY, newState);
        location.replace(buildUrlWithDiscover(newState));
    });

})();
