// ==UserScript==
// @name         Custom Auto Refresh
// @namespace    YMHOMER
// @version      1.0
// @description  Define custom auto-refresh intervals for different websites, and manage them through a settings menu with options to view, modify, or clear.
// @author       YMHOMER
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @license MIT
// ==/UserScript==

(function () {
    'use strict';
    const currentUrl = window.location.hostname;
    const defaultRefreshInterval = 0;

    //Setting
    let allRefreshSettings = GM_getValue('allRefreshSettings', {});
    let refreshInterval = allRefreshSettings[currentUrl] || defaultRefreshInterval;
    let refreshTimer;
    const startAutoRefresh = () => {
        if (refreshInterval > 0) {
            refreshTimer = setInterval(() => {
                location.reload();
            }, refreshInterval * 1000);
        }
    };

    const stopAutoRefresh = () => {
        clearInterval(refreshTimer);
    };

    //Setting panel
    const openSettings = () => {
        stopAutoRefresh();

        const newInterval = prompt("Enter refresh interval (Seconds)", refreshInterval);
        if (newInterval !== null) {
            refreshInterval = parseInt(newInterval, 10);
            allRefreshSettings[currentUrl] = refreshInterval;
            GM_setValue('allRefreshSettings', allRefreshSettings);
            alert(`New refresh interval ${refreshInterval} seconds`);
            startAutoRefresh();
        }
    };

    // Manage all refresh interval
    const manageAllSettings = () => {
        let settingsList = 'All refresh interval setting: \n\n';
        const siteKeys = Object.keys(allRefreshSettings);

        if (siteKeys.length === 0) {
            alert('No setting');
            return;
        }

        siteKeys.forEach((site, index) => {
            settingsList += `${index + 1}. site: ${site}, refresh interval: ${allRefreshSettings[site]} seconds\n`;
        });

        let action = prompt(`${settingsList}\nEnter the number you want edit, or press 0 to cancel: `);

        if (action !== null) {
            let index = parseInt(action, 10) - 1;
            if (index >= 0 && index < siteKeys.length) {
                let selectedSite = siteKeys[index];
                let newAction = prompt(`Site selected: ${selectedSite}\n\n1: Modify refresh interval setting\n2: Delete refresh interval setting\npress 0 to cancel`);

                if (newAction === '1') {
                    const newInterval = prompt(`Enter new refresh interval (Seconds), current refresh interval ${allRefreshSettings[selectedSite]} seconds`);
                    if (newInterval !== null) {
                        allRefreshSettings[selectedSite] = parseInt(newInterval, 10);
                        GM_setValue('allRefreshSettings', allRefreshSettings);
                        alert(`Already set ${selectedSite} refresh interval as ${newInterval} seconds`);
                    }
                } else if (newAction === '2') {
                    delete allRefreshSettings[selectedSite];
                    GM_setValue('allRefreshSettings', allRefreshSettings);
                    alert(`Deleted ${selectedSite} refresh interval setting`);
                }
            }
        }
    };

    startAutoRefresh();

    GM_registerMenuCommand("Enter new refresh interval to current site", openSettings);
    GM_registerMenuCommand("Manage all refresh interval", manageAllSettings);
})();
