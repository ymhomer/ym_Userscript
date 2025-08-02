# Google Discover Toggle

A userscript that allows you to easily toggle the Google Discover feed on the Google homepage. It works by persistently setting the `gl=nz` query parameter, while preserving any other search parameters.

一個方便的油猴腳本，讓你輕鬆在 Google 首頁上切換顯示 Google Discover 動態消息。它透過持續設定 `gl=nz` 查詢參數來實現，同時會保留其他所有查詢參數。

---

### Features | 特性

* **One-Click Toggle**: Enable or disable the Discover feed with a single click from the Tampermonkey menu.
* **Persistent Setting**: The script remembers your preference, so the setting is preserved across browser sessions.
* **Preserves URL Parameters**: It intelligently adds or removes the `gl=nz` parameter without affecting your search queries or other URL parameters.
* **Automated Redirect**: The script automatically handles the page redirect to apply the setting immediately.

---

* **一鍵切換**：透過 Tampermonkey 菜單，一鍵即可啟用或停用 Discover 動態消息。
* **永久儲存設定**：腳本會記住你的偏好設定，在不同瀏覽器工作階段中都會持續生效。
* **保留 URL 參數**：智慧地新增或移除 `gl=nz` 參數，同時不會影響你的搜尋詞或其他 URL 參數。
* **自動重導向**：腳本會自動處理頁面重新導向，以即時套用設定。

---

### Installation | 安裝

#### From Greasy Fork | 從 Greasy Fork 安裝

1.  請確保您已安裝如 **Tampermonkey** 或 **Violentmonkey** 等使用者腳本管理器。
2.  前往 [Greasy Fork 上的 Google Discover Toggle 頁面](https://greasyfork.org/en/scripts/541203-google-discover-toggle)。
3.  點擊 **「Install this script」** 按鈕。

#### From GitHub | 從 GitHub 安裝

1.  請確保您已安裝如 **Tampermonkey** 或 **Violentmonkey** 等使用者腳本管理器。
2.  點擊腳本直接連結：[EnableGoogleFeed.user.js](https://raw.githubusercontent.com/ymhomer/ym_Userscript/refs/heads/main/userscript/EnableGoogleFeed/EnableGoogleFeed.user.js)。
3.  你的使用者腳本管理器會提示你安裝腳本。確認安裝即可。

---

### How to Use | 如何使用

腳本的所有功能都集中在 Tampermonkey 的菜單命令中。

1.  前往 `https://www.google.com`。
2.  點擊瀏覽器工具列中的 **Tampermonkey** 圖示。
3.  在下拉菜單中找到並點擊 **「Enable Google Discover」** 或 **「Disable Google Discover」**。
4.  頁面會自動重新整理，並套用新的設定。

---

### License | 許可

This script is licensed under the **MIT License**.

此腳本採用 **MIT 許可證**。