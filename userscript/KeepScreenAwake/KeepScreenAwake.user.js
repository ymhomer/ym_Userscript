// ==UserScript==
// @name         Stay Awake! (Modern NoSleep)
// @name:zh-CN   保持唤醒！(新防休眠)
// @namespace    https://github.com/ymhomer/ym_Userscript
// @version      0.1.2
// @description  Prevents the screen from sleeping. Uses Tampermonkey menu if available, otherwise a floating button.
// @description:zh-CN 防止屏幕自动休眠。优先使用Tampermonkey菜单切换，若无则使用悬浮按钮。采用现代Wake Lock API，并备有视频播放方案。
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

    // ----------------------------------------------------
    // Core Class: ModernNoSleep
    // ----------------------------------------------------
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

    // ----------------------------------------------------
    // User Interface Implementation
    // ----------------------------------------------------
    const noSleep = new ModernNoSleep();
    let menuCommandId = null;

    // A flag to check if the floating UI has been created
    let isFloatingUiCreated = false;

    // Check if running in Tampermonkey
    const isTampermonkey = typeof GM_registerMenuCommand !== 'undefined';

    if (isTampermonkey) {
        // Function to create the floating UI
        const createFloatingUi = (message = 'Screen lock is inactive. Click to enable.') => {
            if (isFloatingUiCreated) return;

            const container = document.createElement('div');
            container.id = 'modern-nosleep-widget';

            const messageBox = document.createElement('div');
            messageBox.id = 'nosleep-message-box';
            messageBox.innerHTML = `<span>${message}</span>`;
            messageBox.style.display = 'none'; // Initially hidden

            const toggleButton = document.createElement('button');
            toggleButton.id = 'nosleep-toggle-btn';
            toggleButton.title = 'Toggle Screen Wake Lock';
            toggleButton.innerHTML = '🌙';

            const hideButton = document.createElement('button');
            hideButton.id = 'nosleep-hide-btn';
            hideButton.title = 'Hide for this session';
            hideButton.innerHTML = '&times;';

            container.appendChild(messageBox);
            container.appendChild(toggleButton);
            container.appendChild(hideButton);
            document.body.appendChild(container);

            GM_addStyle(`
                #modern-nosleep-widget {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 999999;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    align-items: flex-end;
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
                #nosleep-message-box {
                    background-color: rgba(255, 0, 0, 0.7);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 14px;
                    margin-bottom: 5px;
                    max-width: 200px;
                    text-align: right;
                    transition: opacity 0.5s ease-in-out;
                }
            `);

            const updateButtonState = (enabled) => {
                if (enabled) {
                    toggleButton.innerHTML = '☀️';
                    toggleButton.classList.add('active');
                    toggleButton.title = 'Screen lock is active. Click to disable.';
                    messageBox.style.display = 'none';
                } else {
                    toggleButton.innerHTML = '🌙';
                    toggleButton.classList.remove('active');
                    toggleButton.title = 'Screen lock is inactive. Click to enable.';
                }
            };

            toggleButton.addEventListener('click', async () => {
                if (noSleep.isEnabled) {
                    noSleep.disable();
                    updateButtonState(false);
                } else {
                    try {
                        await noSleep.enable();
                        updateButtonState(true);
                    } catch (err) {
                        messageBox.innerHTML = `<span>Could not activate wake lock. Your browser might not support it or requires a specific user interaction.</span>`;
                        messageBox.style.display = 'block';
                        setTimeout(() => { messageBox.style.display = 'none'; }, 5000);
                        updateButtonState(false);
                    }
                }
            });

            hideButton.addEventListener('click', () => {
                container.style.display = 'none';
            });

            noSleep.onRelease = () => {
                updateButtonState(false);
            };

            isFloatingUiCreated = true;
        };

        // Register Tampermonkey menu command
        const updateMenu = () => {
            if (menuCommandId) GM_unregisterMenuCommand(menuCommandId);
            menuCommandId = GM_registerMenuCommand(
                noSleep.isEnabled ? '🌙 Disable Screen Wake Lock' : '☀️ Enable Screen Wake Lock',
                async () => {
                    if (noSleep.isEnabled) {
                        noSleep.disable();
                    } else {
                        try {
                            await noSleep.enable();
                        } catch (err) {
                            // On failure, create floating UI and show error message
                            createFloatingUi();
                            const messageBox = document.getElementById('nosleep-message-box');
                            if (messageBox) {
                                messageBox.innerHTML = `<span>Could not activate wake lock. Your browser might not support it or requires a specific user interaction.</span>`;
                                messageBox.style.display = 'block';
                                setTimeout(() => { messageBox.style.display = 'none'; }, 5000);
                            }
                        }
                    }
                    updateMenu();
                }
            );
        };
        noSleep.onRelease = updateMenu;
        updateMenu();
    } else {
        // Fallback to floating button UI directly if not in Tampermonkey
        createFloatingUi();
    }
})();