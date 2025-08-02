# Custom Auto Refresh

A userscript to set custom auto-refresh intervals for websites. This script gives you full control over page refreshes with a dedicated settings menu, allowing you to view, modify, and clear saved settings.

一個用於為網站設定自訂自動重新整理間隔的油猴腳本。此腳本透過專屬的設定菜單，讓你全面控制頁面重新整理，並可檢視、修改或清除已儲存的設定。

---

### Features | 特性

* **Custom Intervals**: Set a specific refresh time (in seconds) for each website.
* **Per-Site Settings**: The refresh interval is saved for each website, so it automatically applies the next time you visit.
* **Flexible Application**: Choose to apply the refresh interval to the entire domain (e.g., `example.com`) or to a specific full URL (e.g., `example.com/page-to-monitor`).
* **Management Dialog**: A comprehensive management menu allows you to view all saved settings, modify intervals, or delete settings for any site.
* **Simple UI**: All controls are accessible via the Tampermonkey menu, keeping the webpage clean and uncluttered.

---

* **自訂間隔**：為每個網站設定特定的重新整理時間（以秒為單位）。
* **按網站設定**：重新整理間隔會為每個網站獨立儲存，當你下次造訪時會自動套用。
* **靈活套用**：可選擇將重新整理間隔套用至整個網域（例如 `example.com`），或僅限於特定的完整 URL（例如 `example.com/page-to-monitor`）。
* **管理介面**：透過一個全面的管理菜單，你可以檢視所有已儲存的設定、修改間隔或刪除任何網站的設定。
* **簡潔介面**：所有控制都可透過 Tampermonkey 菜單存取，保持網頁介面的整潔。

---

### Installation | 安裝

#### From Greasy Fork | 從 Greasy Fork 安裝

1.  請確保您已安裝如 **Tampermonkey** 或 **Violentmonkey** 等使用者腳本管理器。
2.  前往 [Greasy Fork 上的 Custom Auto Refresh 頁面](https://greasyfork.org/en/scripts/513942-custom-auto-refresh)。
3.  點擊 **「Install this script」** 按鈕。

#### From GitHub | 從 GitHub 安裝

1.  請確保您已安裝如 **Tampermonkey** 或 **Violentmonkey** 等使用者腳本管理器。
2.  點擊腳本直接連結：[CustomAutoRefresh.user.js](https://raw.githubusercontent.com/ymhomer/ym_Userscript/refs/heads/main/userscript/CustomAutoRefresh/CustomAutoRefresh.user.js)。
3.  你的使用者腳本管理器會提示你安裝腳本。確認安裝即可。

---

### How to Use | 如何使用

腳本的所有功能都集中在 Tampermonkey 的菜單命令中。

1.  點擊瀏覽器工具列中的 **Tampermonkey** 圖示。
2.  在下拉菜單中找到並點擊 **「Manage Settings」**。
3.  一個彈窗會出現，你可以在這裡管理你的設定：
    * **設定間隔**：在輸入框中輸入重新整理間隔（以秒為單位），點擊 **「Save」** 儲存。如果間隔為 `0`，則表示停用自動重新整理。
    * **修改或刪除**：在已儲存設定列表中，點擊 **「Modify」** 修改特定網站的間隔，或點擊 **「Delete」** 刪除該設定。

---

### License | 許可

This script is licensed under the **MIT License**.

此腳本採用 **MIT 許可證**。