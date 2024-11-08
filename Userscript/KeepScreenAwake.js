// ==UserScript==
// @name         Keep Screen Awake
// @namespace    YMHOMER
// @version      1.0
// @description  Keep screen awake toggle via Tampermonkey menu
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// @license MIT
// ==/UserScript==
 
(function() {
    'use strict';
 
    let keepAwake = false;
    let wakeLock = null;
 
    async function toggleKeepAwake() {
        if (!keepAwake) {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                keepAwake = true;
                alert('Keep Screen Awake - ON');
            } catch (err) {
                console.error('Keep Screen Awake - failed:', err);
                alert('Keep Screen Awake - failed');
            }
        } else {
            if (wakeLock) {
                wakeLock.release().then(() => {
                    wakeLock = null;
                    keepAwake = false;
                    alert('Keep Screen Awake - Off');
                });
            }
        }
    }
 
    if (typeof GM_registerMenuCommand === 'function') {
        GM_registerMenuCommand('Turn ON - Keep Screen Awake', toggleKeepAwake);
    } else {
        alert("GM_registerMenuCommand error");
    }
})();
