// ==UserScript==
// @name         Stay Awake! (Modern NoSleep)
// @name:zh-CN   保持唤醒！(新防休眠)
// @namespace    https://github.com/ymhomer/ym_Userscript
// @version      0.2.0
// @description  Prevents the screen from sleeping. Toggles a floating button via Tampermonkey menu, and shows it automatically in unsupported environments.
// @description:zh-CN 防止屏幕自动休眠。在Tampermonkey下，通过菜单命令切换悬浮按钮的显示与隐藏，若无Tampermonkey则自动显示。
// @author       ymhomer
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @run-at       document-idle
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    class ModernNoSleep {
        constructor() {
            this.enabled = false;
            this._wakeLock = null;
            this._noSleepVideo = null;
            this.wakeLockType = 'wakeLock' in navigator ? 'modern' : 'legacy';

            if (this.wakeLockType === 'modern') {
                document.addEventListener('visibilitychange', this._onVisibilityChange.bind(this));
                document.addEventListener('fullscreenchange', this._onVisibilityChange.bind(this));
            }
        }

        async enable() {
            if (this.enabled) return;
            try {
                if (this.wakeLockType === 'modern') {
                    this._wakeLock = await navigator.wakeLock.request('screen');
                    this._wakeLock.addEventListener('release', () => {
                        if (this.enabled) {
                           this.enabled = false;
                           console.log('Wake Lock was released by the system.');
                           if(this.onRelease) this.onRelease();
                        }
                    });
                } else {
                    this._createLegacyVideo();
                    await this._noSleepVideo.play();
                }
                this.enabled = true;
                console.log(`NoSleep enabled (${this.wakeLockType}).`);
            } catch (err) {
                this.enabled = false;
                console.error(`Failed to enable NoSleep: ${err.name}, ${err.message}`);
                throw err;
            }
        }

        disable() {
            if (!this.enabled) return;
            if (this.wakeLockType === 'modern' && this._wakeLock) {
                this._wakeLock.release();
                this._wakeLock = null;
            } else if (this.wakeLockType === 'legacy' && this._noSleepVideo) {
                this._noSleepVideo.pause();
            }
            this.enabled = false;
            console.log('NoSleep disabled.');
        }

        get isEnabled() {
            return this.enabled;
        }

        _onVisibilityChange() {
            if (this.enabled && document.visibilityState === 'visible') {
                this.enable().catch(() => {});
            }
        }

        _createLegacyVideo() {
            if (this._noSleepVideo) return;
            const minimalMp4 = 'data:video/mp4;base64,AAAAHGZ0eXBNNFYgAAACAGlzb21pc28yYXZjMQAAAAhmcmVlAAAAG21kYXQAAAGzABAHAAABthABGWAAAAABAAA2Z2VzZHMAAAAAAQABAAEAAAA2YXZjMQAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAEAAQABAAEAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAc3R0cwAAAAAAAAABAAAAAQABAAABAAAAHHN0c2QAAAAAAAAAAQAAAFhzdHNjAAAAAAAAAAEAAAABAAAAAQAAAAEAAABoc3RzegAAAAAAAAAAAAAAAQAAAAEAAAAUc3RjbwAAAAAAAAABAAAAMAAAAGB1ZHRhAAAAWG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAAK2lsc3QAAAAjqXRvbwAAABtkYXRhAAAAAQAAAABMYXZmYzgxLjEyLjEwMA==';
            this._noSleepVideo = document.createElement('video');
            this._noSleepVideo.setAttribute('title', 'No Sleep');
            this._noSleepVideo.setAttribute('playsinline', '');
            this._noSleepVideo.setAttribute('loop', '');
            this._noSleepVideo.muted = true;
            const source = document.createElement('source');
            source.src = minimalMp4;
            source.type = 'video/mp4';
            this._noSleepVideo.appendChild(source);
        }
    }

    const noSleep = new ModernNoSleep();
    const isTampermonkey = typeof GM_registerMenuCommand !== 'undefined';
    let menuCommandId = null;
    let isFloatingUIVisible = false;
    let floatingUIContainer = null;

    GM_addStyle(`
        #modern-nosleep-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            display: flex;
            gap: 5px;
            align-items: center;
        }
        #modern-nosleep-widget button {
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            transition: background-color 0.2s, transform 0.2s;
            font-family: sans-serif;
        }
        #modern-nosleep-widget button:hover {
            background-color: rgba(0, 0, 0, 0.9);
            transform: scale(1.1);
        }
        #nosleep-toggle-btn {
            width: 48px;
            height: 48px;
            font-size: 24px;
            line-height: 48px;
        }
        #nosleep-toggle-btn.active {
            background-color: #f39c12;
        }
        #nosleep-hide-btn {
            width: 24px;
            height: 24px;
            font-size: 16px;
            line-height: 22px;
        }
    `);

    function updateFloatingButtonState(enabled) {
        const toggleButton = floatingUIContainer.querySelector('#nosleep-toggle-btn');
        if (!toggleButton) return;
        if (enabled) {
            toggleButton.innerHTML = '☀️';
            toggleButton.classList.add('active');
            toggleButton.title = 'Screen lock is active. Click to disable.';
        } else {
            toggleButton.innerHTML = '🌙';
            toggleButton.classList.remove('active');
            toggleButton.title = 'Screen lock is inactive. Click to enable.';
        }
    }

    function createFloatingButtonUI() {
        if (floatingUIContainer) return floatingUIContainer;
        const container = document.createElement('div');
        container.id = 'modern-nosleep-widget';

        const toggleButton = document.createElement('button');
        toggleButton.id = 'nosleep-toggle-btn';
        toggleButton.title = 'Toggle Screen Wake Lock';
        toggleButton.innerHTML = '🌙';

        const hideButton = document.createElement('button');
        hideButton.id = 'nosleep-hide-btn';
        hideButton.title = 'Hide for this session';
        hideButton.innerHTML = '&times;';

        container.appendChild(toggleButton);
        container.appendChild(hideButton);

        toggleButton.addEventListener('click', async () => {
            if (noSleep.isEnabled) {
                noSleep.disable();
            } else {
                try {
                    await noSleep.enable();
                } catch (err) {
                    console.error('Failed to enable wake lock from button:', err);
                }
            }
        });

        hideButton.addEventListener('click', () => {
            toggleFloatingUI(false);
        });

        floatingUIContainer = container;
        noSleep.onRelease = () => {
            updateFloatingButtonState(false);
        };
        return floatingUIContainer;
    }

    function updateMenuCommand() {
        if (menuCommandId) GM_unregisterMenuCommand(menuCommandId);
        menuCommandId = GM_registerMenuCommand(
            isFloatingUIVisible ? '🌙 Hide Floating Window' : '☀️ Show Floating Window',
            () => {
                toggleFloatingUI(!isFloatingUIVisible);
            }
        );
    }

    function toggleFloatingUI(show) {
        if (show) {
            if (!floatingUIContainer) {
                createFloatingButtonUI();
            }
            if (!document.body.contains(floatingUIContainer)) {
                document.body.appendChild(floatingUIContainer);
            }
        } else {
            if (document.body.contains(floatingUIContainer)) {
                document.body.removeChild(floatingUIContainer);
            }
            if (noSleep.isEnabled) {
                noSleep.disable();
            }
        }
        isFloatingUIVisible = show;
        if (isTampermonkey) {
            updateMenuCommand();
        }
    }

    if (isTampermonkey) {
        updateMenuCommand();
    } else {
        toggleFloatingUI(true);
        noSleep.onRelease = () => {
            updateFloatingButtonState(false);
        };
    }

})();