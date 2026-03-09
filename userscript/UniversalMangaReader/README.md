# Universal Manga Reader

A userscript that automatically detects manga pages on the current site and opens an immersive overlay reader.  
It actively scans images, analyzes page layouts, and transforms the current webpage into a full-screen manga reader with features such as auto paging, shake paging, next chapter detection, and rule-based auto-launch.

一個可自動偵測漫畫頁並開啟沉浸式閱讀器的油猴腳本。  
腳本會主動掃描頁面圖片、分析漫畫頁結構，並以覆蓋層方式將當前網站轉換為完整的漫畫閱讀器，支援自動翻頁、搖晃翻頁、自動下一章與自動啟動規則等功能。

---

## Features | 特性

### Smart Image Detection | 智能漫畫頁偵測

- **Proactive Image Discovery**: Actively scans DOM images, lazy-load attributes, srcset sources, background images, and script references to find manga pages.
- **Automatic Page Analysis**: Filters large images using size, aspect ratio, and layout heuristics to determine which images are likely manga pages.
- **Lazy-Load Triggering**: Automatically scrolls the page to trigger lazy-loaded images before detection.

- **主動圖片探測**：掃描 DOM 圖片、懶載入屬性、srcset、背景圖與腳本中的圖片來源。
- **漫畫頁分析**：透過尺寸、比例與版面規則自動判斷漫畫頁。
- **懶載入觸發**：自動滾動頁面以觸發尚未載入的圖片。

---

### Immersive Reader | 沉浸式閱讀器

- **Overlay Reader**: Opens directly on top of the current webpage without navigating away.
- **Single / Double Page Mode**: Toggle between single-page and double-page layouts.
- **Smart Image Fitting**: Portrait pages prioritize side edges, landscape pages prioritize vertical fit.
- **Progress Bar Navigation**: Jump to any page instantly using the progress slider.

- **覆蓋式閱讀器**：直接在當前頁面開啟閱讀模式。
- **單頁 / 雙頁模式**：可自由切換閱讀版面。
- **智能圖片適配**：直式圖優先左右貼邊，橫式圖優先上下完整。
- **進度條導航**：可快速跳轉至任意頁。

---

### Automation Features | 自動化功能

- **Auto Page Turn**: Automatically turn pages at configurable intervals.
- **Shake Paging**: Turn pages by shaking your device (mobile supported).
- **Auto Next Chapter**: Automatically navigate to the next chapter after reaching the final page.
- **Wake Lock**: Prevent screen sleep during reading sessions.

- **自動翻頁**：可設定翻頁間隔。
- **搖晃翻頁**：支援手機搖晃翻頁。
- **自動下一章**：到達最後一頁後自動跳轉下一章。
- **防熄屏**：閱讀時保持螢幕常亮。

---

### Smart Auto Launch | 智能自動啟動

- **Auto-Open Rules**: Define URL patterns that automatically open the immersive reader.
- **Wildcard Support**: Use `*` as a wildcard in URL rules.
- **Rule Manager**: Add, edit, or delete auto-open rules inside the reader.

- **自動啟動規則**：為漫畫頁網址設定自動開啟閱讀器。
- **萬用字元支援**：規則可使用 `*`。
- **規則管理**：可在閱讀器中新增、修改或刪除規則。

---

### Reader Controls | 閱讀控制

Keyboard shortcuts and touch gestures are supported.

支援鍵盤與觸控操作。

**Keyboard**

| Key | Action |
|---|---|
| ← / A | Previous page |
| → / D / Space | Next page |
| M | Toggle single/double page |
| P | Toggle auto page |
| T | Change auto page delay |
| N | Toggle auto next chapter |
| F | Fullscreen |
| U | Toggle UI |
| Esc | Close reader |

**Touch**

- Tap left / right side → change page  
- Tap center → show or hide UI  
- Swipe left / right → change page  

---

## Installation | 安裝

### From Greasy Fork | 從 Greasy Fork 安裝

1. Install a userscript manager such as **Tampermonkey** or **Violentmonkey**.
2. Visit the script page on Greasy Fork.
3. Click **Install this script**.

### From GitHub | 從 GitHub 安裝

1. Install a userscript manager such as **Tampermonkey** or **Violentmonkey**.
2. Open the raw userscript file: `UniversalMangaReaderOverlayPro.user.js`
3. Your userscript manager will prompt installation automatically.

---

## How to Use | 使用方式

### Open Reader | 開啟閱讀器

Use the Tampermonkey menu command:

- `📚 Open Manga Reader`

The script will:

1. Trigger lazy loading on the page.
2. Actively discover image sources.
3. Analyze manga pages.
4. Launch the immersive reader.

### Reader Menu | 閱讀器選單

Controls are available in the bottom bar:

- Auto page
- Auto next chapter
- Shake paging
- Page mode switch
- Fullscreen
- Auto-open rule manager
- Language switch (English / 中文)

---

## Notes | 注意事項

- Some websites heavily protect images or use unusual loading techniques. In such cases, ensure the page has fully loaded before opening the reader.
- Certain sites may dynamically load images while scrolling, so the script automatically scrolls the page to trigger lazy loading.
- Auto page and shake paging are mutually exclusive. Enabling one will disable the other automatically.
- The reader defaults to English UI, with Chinese available from the **More** panel.

- 某些網站可能對圖片做了較多保護，或使用特殊載入方式，建議先讓頁面完整載入後再開啟閱讀器。
- 有些網站會在滾動時動態載入圖片，因此腳本會自動滾動頁面以提升偵測完整度。
- 自動翻頁與搖晃翻頁互斥，開啟其中一方時會自動關閉另一方。
- 閱讀器預設為英文介面，可在 **More** 面板中切換為中文。

---

## License | 許可

This script is licensed under the **MIT License**.

此腳本採用 **MIT 許可證**。
