// ==UserScript==
// @name         Google Discover Toggle
// @namespace    YMHOMER
// @version      1.0
// @description  Toggle Google Discover by setting ?gl=nz persistently, preserving other query parameters
// @author       ymhomer
// @match        https://www.google.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';
    const isDiscoverEnabled = GM_getValue('discoverEnabled', false);

    // Function to update URL with gl=nz while preserving other parameters
    function updateUrl(enableDiscover) {
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);

        if (enableDiscover) {
            params.set('gl', 'nz');
        } else {
            params.delete('gl');
        }

        url.search = params.toString();
        return url.toString();
    }

    // Redirect if Discover is enabled and gl=nz is not set
    if (isDiscoverEnabled && !window.location.search.includes('gl=nz')) {
        window.location.href = updateUrl(true);
    }

    // Register toggle menu command
    GM_registerMenuCommand(`${isDiscoverEnabled ? 'Disable' : 'Enable'} Google Discover`, () => {
        GM_setValue('discoverEnabled', !isDiscoverEnabled);
        window.location.href = updateUrl(!isDiscoverEnabled);
    });
})();
