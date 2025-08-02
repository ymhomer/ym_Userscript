# Stay Awake! (Modern NoSleep)

![Greasy Fork](https://img.shields.io/greasyfork/v/514101?color=green&label=Greasy%20Fork)
![GitHub release](https://img.shields.io/github/v/release/ymhomer/ym_Userscript?color=blue&label=GitHub%20release&style=flat-square&include_prereleases&logo=github)

A userscript to prevent your screen from sleeping. It prioritizes the modern **Wake Lock API** for efficiency and provides a legacy video-based fallback for older browsers. The user interface adapts automatically to your environment, offering a simple **Tampermonkey menu** or a **floating button**.

一個防止螢幕自動休眠的油猴腳本。它優先採用現代的 **Wake Lock API** 以提高效率，並為不支援的瀏覽器提供了基於影片的備用方案。使用者介面會根據您的環境自動適配，提供簡單的 **Tampermonkey 菜單** 或 **懸浮按鈕**。

---

### Features | 特性

* **Modern Wake Lock API**: Uses the native `navigator.wakeLock` API for a more efficient and battery-friendly solution, preventing screen sleep without interfering with the UI.
* **Legacy Fallback**: For browsers that don't support the Wake Lock API, the script falls back to a minimal video-based method to keep the screen awake.
* **Automatic UI**: If you are using Tampermonkey, it integrates seamlessly into the extension's menu. If not, a small floating button appears in the bottom-right corner of the page.
* **Resilience**: Automatically re-acquires the wake lock when the page becomes visible again (e.g., after switching tabs).

---

* **現代 Wake Lock API**：使用原生的 `navigator.wakeLock` API，提供更高效且省電的解決方案，在不干擾介面的情況下防止螢幕休眠。
* **傳統備用方案**：對於不支援 Wake Lock API 的瀏覽器，腳本會回退到一個基於微小影片的方案來保持螢幕喚醒。
* **自動化介面**：如果您使用 Tampermonkey，腳本會無縫整合到其擴充功能菜單中。否則，頁面右下角會出現一個小的懸浮按鈕。
* **韌性**：當頁面再次可見時（例如從其他分頁切換回來），腳本會自動嘗試重新獲取喚醒鎖。

---

### Installation | 安裝

#### From Greasy Fork | 從 Greasy Fork 安裝
1.  Ensure you have a userscript manager like **Tampermonkey** or **Violentmonkey** installed.
2.  Go to the [Stay Awake! (Modern NoSleep) page on Greasy Fork](https://greasyfork.org/en/scripts/514101-stay-awake-modern-nosleep).
3.  Click the **"Install this script"** button.

#### From GitHub | 從 GitHub 安裝
1.  Ensure you have a userscript manager like **Tampermonkey** or **Violentmonkey** installed.
2.  Go to the direct script link: [KeepScreenAwake.user.js](https://github.com/ymhomer/ym_Userscript/raw/main/userscript/KeepScreenAwake/KeepScreenAwake.user.js).
3.  Your userscript manager will prompt you to install the script. Confirm the installation.

---

### How to Use | 如何使用

The script provides two different user interfaces depending on your browser and userscript manager.

腳本會根據您的瀏覽器和使用者腳本管理器提供兩種不同的使用者介面。

#### Tampermonkey Menu
* **Enable/Disable**: Click the Tampermonkey icon in your browser toolbar.
* Find **Stay Awake! (Modern NoSleep)** in the list.
* The menu item will show either **"☀️ Enable Screen Wake Lock"** or **"🌙 Disable Screen Wake Lock"**. Click it to toggle the feature on or off.

#### Tampermonkey 菜單
* **啟用/停用**：點擊瀏覽器工具列中的 Tampermonkey 圖示。
* 在列表中找到 **Stay Awake! (Modern NoSleep)**。
* 菜單項目會顯示 **"☀️ Enable Screen Wake Lock"** 或 **"🌙 Disable Screen Wake Lock"**。點擊它即可切換功能的開啟或關閉。

#### Floating Button UI
* A small widget will appear in the **bottom-right corner** of the page.
* Click the large button with the icon to toggle the wake lock:
    * **🌙 (Inactive)**: Screen can go to sleep.
    * **☀️ (Active)**: Screen is kept awake.
* Click the smaller **×** button to hide the widget for the current session.

#### 懸浮按鈕介面
* 頁面**右下角**會出現一個小的懸浮小工具。
* 點擊帶圖示的大按鈕來切換喚醒鎖：
    * **🌙 (Inactive)**：螢幕可能會進入休眠。
    * **☀️ (Active)**：螢幕將保持喚醒。
* 點擊較小的 **×** 按鈕可以隱藏這個小工具，直到您重新載入頁面。

---

### License | 許可

This script is licensed under the **MIT License**.

此腳本採用 **MIT 許可證**。