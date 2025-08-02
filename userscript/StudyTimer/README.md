# Study Timer

A userscript to record webpage study time and display a floating timer window in the upper-right corner. It comes with controls to start, pause, and stop the timer, automatic focus detection, and the ability to view and export your detailed study logs.

一款網站學習計時器腳本，能夠記錄您在網頁上花費的學習時間，並在右上角顯示一個懸浮計時器視窗。它提供了開始、暫停和停止計時器的控制項、自動焦點偵測，以及檢視和匯出詳細學習記錄的功能。

---

### Features | 特性

* **Real-time Timer**: A draggable floating timer in the top-right corner to track your study time in real-time.
* **Start/Pause/End Controls**: Full control over your study session with clear Start, Pause, and End buttons on the timer window.
* **Automatic Focus Tracking**: The timer intelligently pauses when you switch tabs or lose focus, and automatically resumes when you return, ensuring accurate and honest session tracking.
* **Detailed Study Logs**: Records each session's start/end time, total study duration, pause count, and total pause time.
* **Exportable Records**: After ending a session, a summary dialog appears with an option to export the session record as a text file.
* **View History**: A dedicated Tampermonkey menu command allows you to view a detailed history of all your study sessions for the current site.
* **Customizable Display**: Toggle the timer window on or off via a Tampermonkey menu command.

---

* **即時計時器**：一個可拖動的懸浮計時器會顯示在右上角，即時追蹤您的學習時間。
* **開始/暫停/結束控制**：計時器視窗上的「Start」（開始）、「Pause」（暫停）和「End」（結束）按鈕，讓您完全控制學習會話。
* **自動焦點追蹤**：當您切換分頁或失去焦點時，計時器會自動暫停，當您返回時會自動恢復，確保記錄的準確性。
* **詳細學習記錄**：腳本會記錄每個會話的開始/結束時間、總學習時長、暫停次數和總暫停時長。
* **可匯出記錄**：結束會話後，會彈出一個總結視窗，提供將會話記錄匯出為文字檔的選項。
* **檢視歷史記錄**：透過 Tampermonkey 菜單命令，您可以檢視當前網站所有學習會話的詳細歷史記錄。
* **可自訂顯示**：可透過 Tampermonkey 菜單命令來顯示或隱藏計時器視窗。

---

### Installation | 安裝

#### From Greasy Fork | 從 Greasy Fork 安裝

1.  請確保您已安裝如 **Tampermonkey** 或 **Violentmonkey** 等使用者腳本管理器。
2.  前往 [Greasy Fork 上的 Study Timer 頁面](https://greasyfork.org/en/scripts/516057-study-timer)。
3.  點擊 **「Install this script」** 按鈕。

#### From GitHub | 從 GitHub 安裝

1.  請確保您已安裝如 **Tampermonkey** 或 **Violentmonkey** 等使用者腳本管理器。
2.  點擊腳本直接連結：[StudyTimer.user.js](https://raw.githubusercontent.com/ymhomer/ym_Userscript/refs/heads/main/userscript/StudyTimer/StudyTimer.user.js)。
3.  你的使用者腳本管理器會提示你安裝腳本。確認安裝即可。

---

### How to Use | 如何使用

腳本的主要介面是一個懸浮計時器視窗，並透過 Tampermonkey 菜單提供額外功能。

#### 懸浮計時器視窗
* **顯示/隱藏**：如果計時器視窗未顯示，請點擊 Tampermonkey 圖示，然後選擇 **「Toggle Study Timer Display」**。
* **控制**：在視窗上，點擊 **「Start」** 開始計時，**「Pause」** 暫停，**「Resume」** 繼續，以及 **「End」** 結束會話並儲存記錄。
* **移動**：您可以按住計時器視窗並拖動它到螢幕上的任意位置。

#### Tampermonkey 菜單
* **Toggle Study Timer Display**：顯示或隱藏懸浮計時器視窗。
* **View Study History**：開啟一個彈窗，顯示您在此網站上所有學習會話的詳細歷史記錄。

---

### License | 許可

This script is licensed under the **MIT License**.

此腳本採用 **MIT 許可證**。