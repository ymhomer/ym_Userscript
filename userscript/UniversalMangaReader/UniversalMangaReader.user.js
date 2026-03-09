// ==UserScript==
// @name         Universal Manga Reader
// @namespace    https://github.com/ymhomer/ym_Userscript
// @version      1.8.0
// @description  Smart immersive manga reader overlay with proactive image detection/preload, auto next chapter, auto paging, shake paging, Wake Lock, auto-open rules, bottom more drawer, hide UI, and bilingual UI (English default / Chinese toggle).
// @author       ymhomer
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const AUTO_NEXT_FLAG = '__UMR_AUTO_OPEN__';
  const UMR_STATE_KEY = '__UMR_READER_STATE__';
  const UMR_AUTO_RULES_KEY = '__UMR_AUTO_RULES__';
  const UMR_LANG_KEY = '__UMR_LANG__';

  const SHAKE_SENSITIVITY_LEVELS = [1, 2, 3, 4, 5];

  const SHAKE_CONFIG_MAP = {
    1: { threshold: 2.7, burst: 5.2, cooldown: 900, decay: 0.80 },
    2: { threshold: 2.2, burst: 4.4, cooldown: 820, decay: 0.78 },
    3: { threshold: 1.8, burst: 3.7, cooldown: 760, decay: 0.76 },
    4: { threshold: 1.45, burst: 3.0, cooldown: 700, decay: 0.74 },
    5: { threshold: 1.1, burst: 2.4, cooldown: 620, decay: 0.72 }
  };

  const I18N = {
    en: {
      menu_open: '📚 Open Manga Reader',
      menu_close: '❌ Close Manga Reader',

      app_title: 'Manga Reader',
      app_title_with_count: ({ title, count }) => `${title || 'Manga Reader'} · ${count} pages`,

      mode_single: 'Single',
      mode_double: 'Double',

      auto_next: 'Auto Next',
      auto_play: 'Auto Play',
      hide_ui: 'Hide UI',
      show_ui: 'Show UI',
      fullscreen: 'Fullscreen',
      close: 'Close',
      more: 'More',
      help: 'Help',
      language: 'Language',
      language_en: 'English',
      language_zh: '中文',
      shake_paging: 'Shake Page',
      shake_sensitivity: ({ level }) => `Sensitivity ${level}`,
      auto_open_manager: 'Auto Open Rules',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      rule_dialog_title: 'Auto Open Immersive Reader',
      rule_empty: 'No rules yet. Press "+" to add the current page URL.',
      rule_input_placeholder: 'Enter a URL rule, wildcard * supported',
      rule_tip_html:
        'You can change the trailing part of a URL to <code>*</code> as a wildcard.<br>' +
        'It is recommended to set the rule to the real chapter reading URL, not a search page or list page.<br>' +
        'When adding, the current page URL will be filled in automatically.',

      loader_processing: 'Processing...',
      loader_trigger_lazy: 'Triggering lazy loading...',
      loader_detect_sources: 'Proactively detecting image sources...',
      loader_analyzing_pages: ({ domCount, probeCount }) => `Analyzing manga pages... DOM large images ${domCount} / proactive probe ${probeCount}`,
      loader_detecting_progress: ({ done, total }) => `Proactively detecting images... ${done}/${total}`,
      loader_analyzing_current_page: 'Analyzing images on this page...',
      loader_no_pages: 'No images that look like manga pages were found. Please fully load the page and try again.',

      toast_not_found_pages: 'No usable manga pages found',
      toast_loaded_pages: ({ count }) => `Loaded ${count} manga pages`,
      toast_last_page_no_next: 'Last page: next chapter target not found',
      toast_last_page_auto_next: ({ seconds }) => `Last page: auto entering next chapter in ${seconds} seconds`,
      toast_auto_next_failed_no_target: 'Auto next chapter failed: target not found',
      toast_auto_next_failed_open: 'Auto next chapter failed: unable to open target',
      toast_already_last: 'Already at the last page',
      toast_already_first: 'Already at the first page',
      toast_mode_single: 'Single-page mode',
      toast_mode_double: 'Double-page mode',
      toast_auto_next_off: 'Auto next chapter disabled',
      toast_auto_next_on: 'Auto next chapter enabled',
      toast_shake_off_due_autoplay: 'Shake paging disabled, switched to auto play',
      toast_auto_play_off: 'Auto play disabled',
      toast_auto_play_on: ({ seconds }) => `Auto play enabled (${seconds} sec)`,
      toast_motion_permission_denied: 'Motion permission not granted or unsupported by this browser',
      toast_shake_on: ({ level }) => `Shake paging enabled (sensitivity ${level})`,
      toast_shake_off: 'Shake paging disabled',
      toast_shake_sensitivity: ({ level }) => `Shake paging sensitivity: ${level}`,
      toast_fullscreen_fail: 'Fullscreen is not supported on this page or was blocked by the browser',
      toast_enter_rule: 'Please enter a URL rule',
      toast_rule_saved: 'Auto-open rule saved',
      toast_rule_deleted: 'Rule deleted',
      toast_lang_switched: ({ lang }) => `Language switched to ${lang}`,

      btn_seconds: ({ seconds }) => `${seconds}s`,
      btn_ui_unlock_title: 'Show controls',
      btn_fullscreen_title: 'Fullscreen',
      btn_close_title: 'Close',

      help_html:
        '<div><b>Keyboard:</b></div>' +
        '<div>← / A: Previous page</div>' +
        '<div>→ / D / Space: Next page</div>' +
        '<div>M: Single / Double page</div>' +
        '<div>P: Auto play On/Off</div>' +
        '<div>T: Switch auto play interval</div>' +
        '<div>N: Auto next chapter On/Off</div>' +
        '<div>F: Fullscreen</div>' +
        '<div>U: Hide / Show UI</div>' +
        '<div>Esc: Close</div>' +
        '<div style="margin-top:8px;"><b>Touch:</b></div>' +
        '<div>Swipe left/right to turn pages, tap left/right to turn pages, tap center to hide/show UI.</div>' +
        '<div style="margin-top:8px;"><b>Smart Display:</b></div>' +
        '<div>Portrait images prefer side fitting, landscape images prefer top/bottom fitting; double-page mode tries to keep both pages complete and centered closely together.</div>' +
        '<div style="margin-top:8px;"><b>Proactive Collection:</b></div>' +
        '<div>Scans DOM, lazy-load attributes, srcset, background images, and image URLs in scripts, then warms them up to improve auto-open completeness.</div>' +
        '<div style="margin-top:8px;"><b>Auto Play / Shake Page / Next Chapter:</b></div>' +
        '<div>Auto play and shake page are mutually exclusive. When one is enabled, the other will be disabled automatically. On the last page, if auto next chapter is enabled, it waits 5 seconds before jumping to the next chapter.</div>'
    },

    zh: {
      menu_open: '📚 开启漫画阅读器',
      menu_close: '❌ 关闭漫画阅读器',

      app_title: '漫画阅读器',
      app_title_with_count: ({ title, count }) => `${title || '漫画阅读器'} · ${count} 张`,

      mode_single: '单页',
      mode_double: '双页',

      auto_next: '自动下一章',
      auto_play: '自动翻页',
      hide_ui: '隐藏UI',
      show_ui: '显示UI',
      fullscreen: '全屏',
      close: '关闭',
      more: '更多',
      help: '说明',
      language: '语言',
      language_en: 'English',
      language_zh: '中文',
      shake_paging: '摇晃翻页',
      shake_sensitivity: ({ level }) => `敏感度 ${level}`,
      auto_open_manager: '自动打开沉浸式',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '改',
      rule_dialog_title: '自动打开沉浸式',
      rule_empty: '目前没有规则。按「+」可把当前页面网址加入管理。',
      rule_input_placeholder: '请输入网址规则，支持 * 万用字元',
      rule_tip_html:
        '可把网址后端改成 <code>*</code> 作为万用字元。<br>' +
        '建议设定为真正进入漫画阅读时的连结，不要设定到搜寻页或列表页。<br>' +
        '新增时会先自动带入当前页面网址。',

      loader_processing: '正在处理...',
      loader_trigger_lazy: '正在触发页面懒加载...',
      loader_detect_sources: '正在主动探测图片来源...',
      loader_analyzing_pages: ({ domCount, probeCount }) => `正在分析漫画页... DOM大图 ${domCount} 张 / 主动探测 ${probeCount} 张`,
      loader_detecting_progress: ({ done, total }) => `正在主动探测图片... ${done}/${total}`,
      loader_analyzing_current_page: '正在分析本页图片...',
      loader_no_pages: '没有找到足够像漫画页的图片，请先把页面完整载入后再试。',

      toast_not_found_pages: '未找到可用漫画页',
      toast_loaded_pages: ({ count }) => `已载入 ${count} 张漫画页`,
      toast_last_page_no_next: '最后一页：未找到下一章按钮',
      toast_last_page_auto_next: ({ seconds }) => `最后一页：${seconds} 秒后自动进入下一章`,
      toast_auto_next_failed_no_target: '自动下一章失败：找不到目标',
      toast_auto_next_failed_open: '自动下一章失败：无法打开目标',
      toast_already_last: '已经是最后一页',
      toast_already_first: '已经是第一页',
      toast_mode_single: '单页模式',
      toast_mode_double: '双页模式',
      toast_auto_next_off: '已关闭自动下一章',
      toast_auto_next_on: '已开启自动下一章',
      toast_shake_off_due_autoplay: '已关闭摇晃翻页，改为自动翻页',
      toast_auto_play_off: '已关闭自动翻页',
      toast_auto_play_on: ({ seconds }) => `已开启自动翻页（${seconds} 秒）`,
      toast_motion_permission_denied: '装置摇晃权限未授予或此浏览器不支持',
      toast_shake_on: ({ level }) => `已开启摇晃翻页（敏感度 ${level}）`,
      toast_shake_off: '已关闭摇晃翻页',
      toast_shake_sensitivity: ({ level }) => `摇晃翻页敏感度：${level}`,
      toast_fullscreen_fail: '此页不支持全屏或被浏览器阻止',
      toast_enter_rule: '请输入网址规则',
      toast_rule_saved: '已保存自动打开规则',
      toast_rule_deleted: '已删除规则',
      toast_lang_switched: ({ lang }) => `已切换语言：${lang}`,

      btn_seconds: ({ seconds }) => `${seconds}秒`,
      btn_ui_unlock_title: '显示控制列',
      btn_fullscreen_title: '全屏',
      btn_close_title: '关闭',

      help_html:
        '<div><b>操作：</b></div>' +
        '<div>← / A：上一页</div>' +
        '<div>→ / D / Space：下一页</div>' +
        '<div>M：单页 / 双页</div>' +
        '<div>P：自动翻页 开/关</div>' +
        '<div>T：切换自动翻页秒数</div>' +
        '<div>N：自动下一章 开/关</div>' +
        '<div>F：全屏</div>' +
        '<div>U：隐藏 / 显示 UI</div>' +
        '<div>Esc：关闭</div>' +
        '<div style="margin-top:8px;"><b>触控：</b></div>' +
        '<div>左滑 / 右滑翻页，左右点击翻页，中间点击显示/隐藏 UI。</div>' +
        '<div style="margin-top:8px;"><b>智能显示：</b></div>' +
        '<div>直式图优先左右贴边，横式图优先上下贴边；双页模式会尽量兼顾左右贴边与上下完整，并让两页靠近置中。</div>' +
        '<div style="margin-top:8px;"><b>主动收图：</b></div>' +
        '<div>会主动扫描 DOM、懒加载属性、srcset、背景图与脚本中的图片网址，并预热图片，以提高自动启动时的完整度。</div>' +
        '<div style="margin-top:8px;"><b>自动翻页 / 摇晃翻页 / 下一章：</b></div>' +
        '<div>自动翻页与摇晃翻页互斥；其中一方开启时会自动关闭另一方。到最后一页后，如果已开启自动下一章，才会再等待 5 秒自动跳下一章。</div>'
    }
  };

  const STATE = {
    overlay: null,
    pages: [],
    index: 0,
    mode: 'single',
    fullscreen: false,
    preloadCount: 12,
    isOpen: false,

    touchStartX: 0,
    touchStartY: 0,
    touchMoved: false,

    keyHandlerBound: false,
    resizeHandlerBound: false,
    fullscreenHandlerBound: false,
    visibilityHandlerBound: false,
    scrollLocked: false,

    autoNextEnabled: true,
    autoNextDelay: 5000,
    autoNextTimer: null,
    autoNextTarget: null,

    autoPlayEnabled: false,
    autoPlayDelay: 3000,
    autoPlayTimer: null,

    shakePagingEnabled: false,
    shakeSensitivity: 3,
    shakeLastTriggerTime: 0,
    shakeHandlerBound: false,
    shakeGravity: { x: 0, y: 0, z: 0 },
    shakeLastLinear: { x: 0, y: 0, z: 0 },
    shakeEnergy: 0,
    shakeWarmupFrames: 0,
    shakeLastMotionTime: 0,

    moreOpen: false,

    wakeLockSentinel: null,
    wakeLockSupported: 'wakeLock' in navigator,

    restoreUiHidden: false,

    ruleDialogOpen: false,
    ruleEditIndex: -1,

    proactiveCandidates: [],
    proactiveMetaMap: new Map(),
    proactiveDoneCount: 0,

    lang: loadLanguage(),

    config: {
      minWidth: 240,
      minHeight: 320,
      minArea: 120000,
      aspectMin: 0.2,
      aspectMax: 3.8,
      proactiveMaxCandidates: 300,
      proactiveConcurrency: 8
    }
  };

  const STYLE = `
    #umr-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483646;
      background: #000;
      color: #fff;
      display: flex;
      flex-direction: column;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      user-select: none;
      overflow: hidden;
    }

    #umr-overlay.umr-hidden {
      display: none !important;
    }

    #umr-topbar {
      height: 44px;
      min-height: 44px;
      display: flex;
      align-items: center;
      padding: 6px 12px;
      background: linear-gradient(to bottom, rgba(0,0,0,.82), rgba(0,0,0,.14));
      backdrop-filter: blur(8px);
      z-index: 5;
      transition: opacity .2s ease;
    }

    #umr-overlay.umr-ui-hidden #umr-topbar,
    #umr-overlay.umr-ui-hidden #umr-bottombar,
    #umr-overlay.umr-ui-hidden #umr-more-panel {
      opacity: 0;
      pointer-events: none;
    }

    #umr-topbar .umr-title {
      font-size: 13px;
      opacity: .9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      text-align: center;
    }

    .umr-btn {
      height: 34px;
      border: 1px solid rgba(255,255,255,.14);
      background: rgba(255,255,255,.08);
      color: #fff;
      border-radius: 10px;
      padding: 0 12px;
      cursor: pointer;
      font-size: 12px;
      transition: .18s ease;
      white-space: nowrap;
      flex: 0 0 auto;
    }

    .umr-btn:hover {
      background: rgba(255,255,255,.14);
    }

    .umr-btn.umr-active {
      background: rgba(255,255,255,.22);
      border-color: rgba(255,255,255,.28);
    }

    .umr-btn.umr-danger {
      border-color: rgba(255,255,255,.18);
    }

    .umr-icon-btn {
      width: 34px;
      min-width: 34px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      line-height: 1;
    }

    #umr-stage {
      flex: 1;
      position: relative;
      overflow: hidden;
      background: #000;
    }

    #umr-book {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: 0;
      overflow: hidden;
      perspective: 1400px;
      background: #000;
    }

    #umr-book.umr-book-double {
      gap: 8px;
      justify-content: center;
      padding: 0 12px;
    }

    .umr-pageWrap {
      width: 50%;
      max-width: 50%;
      height: 100%;
      max-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      transform-style: preserve-3d;
      transition: transform .24s ease, opacity .2s ease, width .16s ease;
      position: relative;
      overflow: hidden;
      background: #000;
    }

    .umr-pageWrap.single {
      width: 100%;
      max-width: 100%;
      height: 100%;
      max-height: 100%;
    }

    .umr-pageWrap.double {
      width: auto;
      max-width: none;
      flex: 0 0 auto;
      overflow: visible;
    }

    .umr-pageWrap.turn-next {
      animation: umrTurnNext .22s ease;
      transform-origin: left center;
    }

    .umr-pageWrap.turn-prev {
      animation: umrTurnPrev .22s ease;
      transform-origin: right center;
    }

    @keyframes umrTurnNext {
      0% { transform: rotateY(0deg) scale(1); opacity: 1; }
      50% { transform: rotateY(-12deg) scale(.992); opacity: .95; }
      100% { transform: rotateY(0deg) scale(1); opacity: 1; }
    }

    @keyframes umrTurnPrev {
      0% { transform: rotateY(0deg) scale(1); opacity: 1; }
      50% { transform: rotateY(12deg) scale(.992); opacity: .95; }
      100% { transform: rotateY(0deg) scale(1); opacity: 1; }
    }

    .umr-page {
      display: block;
      border-radius: 0;
      box-shadow: none;
      background: #000;
      max-width: 100%;
      max-height: 100%;
      image-rendering: auto;
      pointer-events: none;
      object-fit: contain;
    }

    .umr-pageWrap.single.portrait .umr-page {
      width: 100%;
      height: auto;
      max-width: 100%;
      max-height: 100%;
    }

    .umr-pageWrap.single.landscape .umr-page,
    .umr-pageWrap.single.square .umr-page {
      height: 100%;
      width: auto;
      max-height: 100%;
      max-width: 100%;
    }

    .umr-pageWrap.double .umr-page {
      width: 100%;
      height: auto;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .umr-pageMeta {
      position: absolute;
      left: 8px;
      bottom: 8px;
      background: rgba(0,0,0,.42);
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 999px;
      opacity: .5;
      pointer-events: none;
    }

    .umr-nav-zone {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 30%;
      z-index: 2;
      cursor: pointer;
      background: transparent;
    }

    .umr-nav-left { left: 0; }
    .umr-nav-right { right: 0; }

    .umr-nav-center {
      position: absolute;
      left: 30%;
      right: 30%;
      top: 0;
      bottom: 0;
      z-index: 1;
    }

    #umr-ui-unlock {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 9;
      width: 38px;
      height: 38px;
      border: 1px solid rgba(255,255,255,.18);
      background: rgba(0,0,0,.45);
      color: #fff;
      border-radius: 999px;
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      line-height: 1;
      backdrop-filter: blur(8px);
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0,0,0,.28);
    }

    #umr-overlay.umr-ui-hidden #umr-ui-unlock {
      display: flex;
    }

    #umr-ui-unlock:active {
      transform: scale(.96);
    }

    #umr-bottombar {
      min-height: 76px;
      padding: 8px 12px 10px;
      background: linear-gradient(to top, rgba(0,0,0,.90), rgba(0,0,0,.20));
      backdrop-filter: blur(8px);
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 5;
      transition: opacity .2s ease;
    }

    #umr-control-row {
      display: flex;
      gap: 8px;
      flex-wrap: nowrap;
      justify-content: flex-start;
      align-items: center;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding-bottom: 2px;
    }

    #umr-control-row::-webkit-scrollbar {
      display: none;
    }

    #umr-progress-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    #umr-progress {
      flex: 1;
      height: 6px;
      background: rgba(255,255,255,.12);
      border-radius: 999px;
      position: relative;
      cursor: pointer;
    }

    #umr-progress-fill {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 0%;
      border-radius: 999px;
      background: rgba(255,255,255,.9);
    }

    #umr-progress-handle {
      position: absolute;
      top: 50%;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #fff;
      transform: translate(-50%, -50%);
      left: 0%;
      box-shadow: 0 2px 12px rgba(255,255,255,.35);
    }

    #umr-counter {
      min-width: 92px;
      text-align: right;
      font-size: 13px;
      opacity: .92;
      flex: 0 0 auto;
    }

    #umr-toast {
      position: absolute;
      left: 50%;
      bottom: 94px;
      transform: translateX(-50%);
      background: rgba(0,0,0,.74);
      color: #fff;
      padding: 8px 12px;
      border-radius: 999px;
      font-size: 12px;
      opacity: 0;
      pointer-events: none;
      transition: opacity .2s ease, transform .2s ease;
      z-index: 12;
      max-width: min(92vw, 560px);
      text-align: center;
    }

    #umr-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(-4px);
    }

    #umr-loader {
      position: absolute;
      inset: 0;
      z-index: 11;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,.78);
      flex-direction: column;
      gap: 10px;
      color: #fff;
    }

    .umr-spinner {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 3px solid rgba(255,255,255,.18);
      border-top-color: rgba(255,255,255,.95);
      animation: umrSpin .8s linear infinite;
    }

    @keyframes umrSpin {
      to { transform: rotate(360deg); }
    }

    #umr-more-panel {
      position: absolute;
      left: 10px;
      right: 10px;
      bottom: 84px;
      z-index: 10;
      border-radius: 16px;
      background: rgba(10,10,10,.94);
      border: 1px solid rgba(255,255,255,.10);
      backdrop-filter: blur(10px);
      box-shadow: 0 16px 36px rgba(0,0,0,.45);
      padding: 12px;
      display: none;
      transform: translateY(16px);
      opacity: 0;
      transition: opacity .22s ease, transform .22s ease;
    }

    #umr-more-panel.show {
      display: block;
      opacity: 1;
      transform: translateY(0);
    }

    #umr-more-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 8px;
    }

    .umr-more-item {
      width: 100%;
      justify-content: center;
    }

    #umr-help {
      position: absolute;
      right: 0;
      left: 0;
      bottom: calc(100% + 10px);
      margin: 0 auto;
      width: min(420px, calc(100vw - 40px));
      background: rgba(8,8,8,.96);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 14px;
      padding: 12px;
      font-size: 13px;
      line-height: 1.55;
      display: none;
      box-shadow: 0 12px 30px rgba(0,0,0,.45);
    }

    #umr-help.show {
      display: block;
    }

    #umr-rule-dialog-backdrop {
      position: absolute;
      inset: 0;
      z-index: 20;
      background: rgba(0,0,0,.52);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 18px;
    }

    #umr-rule-dialog-backdrop.show {
      display: flex;
    }

    #umr-rule-dialog {
      width: min(760px, 100%);
      max-height: min(84vh, 860px);
      background: rgba(10,10,10,.97);
      border: 1px solid rgba(255,255,255,.10);
      border-radius: 18px;
      box-shadow: 0 18px 44px rgba(0,0,0,.48);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      backdrop-filter: blur(12px);
    }

    #umr-rule-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border-bottom: 1px solid rgba(255,255,255,.08);
    }

    #umr-rule-title {
      flex: 1;
      font-size: 14px;
      opacity: .95;
    }

    #umr-rule-body {
      padding: 12px;
      overflow: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .umr-rule-tip {
      font-size: 12px;
      line-height: 1.5;
      opacity: .72;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.06);
      border-radius: 12px;
      padding: 10px 12px;
    }

    #umr-rule-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .umr-rule-row {
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid rgba(255,255,255,.08);
      background: rgba(255,255,255,.04);
      border-radius: 12px;
      padding: 10px;
    }

    .umr-rule-text {
      flex: 1;
      min-width: 0;
      font-size: 12px;
      opacity: .92;
      word-break: break-all;
    }

    #umr-rule-empty {
      font-size: 12px;
      opacity: .65;
      text-align: center;
      padding: 16px 10px;
      border: 1px dashed rgba(255,255,255,.10);
      border-radius: 12px;
    }

    #umr-rule-editor {
      display: none;
      flex-direction: column;
      gap: 8px;
      border: 1px solid rgba(255,255,255,.08);
      background: rgba(255,255,255,.04);
      border-radius: 12px;
      padding: 12px;
    }

    #umr-rule-editor.show {
      display: flex;
    }

    #umr-rule-textarea {
      width: 100%;
      min-height: 110px;
      resize: vertical;
      background: rgba(0,0,0,.35);
      color: #fff;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 10px;
      padding: 10px;
      font-size: 12px;
      line-height: 1.45;
      box-sizing: border-box;
    }

    .umr-rule-editor-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    @media (max-width: 860px) {
      #umr-topbar {
        height: 44px;
        min-height: 44px;
        padding: 6px 10px;
      }

      .umr-btn {
        height: 32px;
        font-size: 12px;
        padding: 0 10px;
      }

      .umr-icon-btn {
        width: 32px;
        min-width: 32px;
      }

      #umr-ui-unlock {
        top: 8px;
        right: 8px;
        width: 36px;
        height: 36px;
        font-size: 15px;
      }

      #umr-bottombar {
        min-height: 82px;
        padding: 8px 10px 10px;
      }

      .umr-nav-zone {
        width: 30%;
      }

      .umr-nav-center {
        left: 30%;
        right: 30%;
      }

      #umr-toast {
        bottom: 98px;
      }

      #umr-more-panel {
        left: 8px;
        right: 8px;
        bottom: 88px;
      }

      #umr-rule-dialog-backdrop {
        padding: 10px;
      }

      #umr-rule-dialog {
        max-height: 88vh;
      }

      #umr-rule-toolbar {
        flex-wrap: wrap;
      }
    }
  `;

  GM_addStyle(STYLE);
  GM_registerMenuCommand(t('menu_open'), openReader);
  GM_registerMenuCommand(t('menu_close'), closeReader);

  function loadLanguage() {
    try {
      const v = localStorage.getItem(UMR_LANG_KEY);
      if (v === 'en' || v === 'zh') return v;
    } catch {}
    return 'en';
  }

  function saveLanguage(lang) {
    try {
      localStorage.setItem(UMR_LANG_KEY, lang);
    } catch {}
  }

  function t(key, vars) {
    const langTable = I18N[STATE.lang] || I18N.en;
    const fallbackTable = I18N.en;
    const value = langTable[key] ?? fallbackTable[key] ?? key;
    if (typeof value === 'function') return value(vars || {});
    return value;
  }

  function tf(key, vars) {
    return String(t(key, vars));
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function debounce(fn, wait = 100) {
    let tmr = null;
    return (...args) => {
      clearTimeout(tmr);
      tmr = setTimeout(() => fn(...args), wait);
    };
  }

  function safeText(v) {
    return String(v || '').trim();
  }

  function normalizeUrl(url) {
    try {
      if (!url) return '';
      if (url.startsWith('data:')) return '';
      if (url.startsWith('blob:')) return '';
      return new URL(url, location.href).href;
    } catch {
      return '';
    }
  }

  function getAutoOpenRules() {
    try {
      const raw = localStorage.getItem(UMR_AUTO_RULES_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(x => typeof x === 'string' && x.trim());
    } catch {
      return [];
    }
  }

  function saveAutoOpenRules(rules) {
    try {
      localStorage.setItem(UMR_AUTO_RULES_KEY, JSON.stringify(rules));
    } catch {}
  }

  function wildcardToRegex(pattern) {
    const escaped = String(pattern)
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`, 'i');
  }

  function matchesAutoOpenRule(url) {
    const rules = getAutoOpenRules();
    return rules.some(rule => {
      try {
        return wildcardToRegex(rule).test(url);
      } catch {
        return false;
      }
    });
  }

  async function requestMotionPermissionIfNeeded() {
    try {
      if (typeof DeviceMotionEvent === 'undefined') return false;
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        const result = await DeviceMotionEvent.requestPermission();
        return result === 'granted';
      }
      return true;
    } catch {
      return false;
    }
  }

  function getShakeConfig() {
    return SHAKE_CONFIG_MAP[STATE.shakeSensitivity] || SHAKE_CONFIG_MAP[3];
  }

  function resetShakeDetector() {
    STATE.shakeGravity = { x: 0, y: 0, z: 0 };
    STATE.shakeLastLinear = { x: 0, y: 0, z: 0 };
    STATE.shakeEnergy = 0;
    STATE.shakeWarmupFrames = 0;
    STATE.shakeLastMotionTime = 0;
    STATE.shakeLastTriggerTime = 0;
  }

  function onDeviceMotion(event) {
    if (!STATE.isOpen || !STATE.shakePagingEnabled) return;

    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc) return;

    const x = Number(acc.x || 0);
    const y = Number(acc.y || 0);
    const z = Number(acc.z || 0);

    const cfg = getShakeConfig();
    const alpha = 0.84;

    STATE.shakeGravity.x = alpha * STATE.shakeGravity.x + (1 - alpha) * x;
    STATE.shakeGravity.y = alpha * STATE.shakeGravity.y + (1 - alpha) * y;
    STATE.shakeGravity.z = alpha * STATE.shakeGravity.z + (1 - alpha) * z;

    const lx = x - STATE.shakeGravity.x;
    const ly = y - STATE.shakeGravity.y;
    const lz = z - STATE.shakeGravity.z;

    if (STATE.shakeWarmupFrames < 8) {
      STATE.shakeLastLinear = { x: lx, y: ly, z: lz };
      STATE.shakeWarmupFrames++;
      return;
    }

    const jx = lx - STATE.shakeLastLinear.x;
    const jy = ly - STATE.shakeLastLinear.y;
    const jz = lz - STATE.shakeLastLinear.z;

    STATE.shakeLastLinear = { x: lx, y: ly, z: lz };

    const jerkMagnitude = Math.sqrt(jx * jx + jy * jy + jz * jz);
    const linearMagnitude = Math.sqrt(lx * lx + ly * ly + lz * lz);
    const dominantAxis = Math.max(Math.abs(jx), Math.abs(jy), Math.abs(jz));

    const intervalMs = Math.max(12, Number(event.interval || 16));
    const dtFactor = Math.min(1.35, Math.max(0.75, 16 / intervalMs));

    const pulse = Math.max(
      jerkMagnitude * 0.95,
      dominantAxis * 1.12,
      linearMagnitude * 0.42
    ) * dtFactor;

    STATE.shakeEnergy = STATE.shakeEnergy * cfg.decay + pulse;
    STATE.shakeLastMotionTime = Date.now();

    const now = Date.now();
    const enoughCooldown = now - STATE.shakeLastTriggerTime > cfg.cooldown;
    const triggered =
      enoughCooldown &&
      (STATE.shakeEnergy >= cfg.burst || (pulse >= cfg.threshold && STATE.shakeEnergy >= cfg.threshold * 1.55));

    if (triggered) {
      STATE.shakeLastTriggerTime = now;
      STATE.shakeEnergy = 0;
      nextPage();
      return;
    }

    if (now - STATE.shakeLastMotionTime > 260) {
      STATE.shakeEnergy *= 0.65;
    }
  }

  function bindShakeMotionIfNeeded() {
    if (STATE.shakeHandlerBound) return;
    if (typeof window === 'undefined' || typeof DeviceMotionEvent === 'undefined') return;
    window.addEventListener('devicemotion', onDeviceMotion, { passive: true });
    STATE.shakeHandlerBound = true;
  }

  function saveReaderState() {
    try {
      const stateToSave = {
        mode: STATE.mode,
        autoNextEnabled: STATE.autoNextEnabled,
        autoPlayEnabled: STATE.autoPlayEnabled,
        autoPlayDelay: STATE.autoPlayDelay,
        shakePagingEnabled: STATE.shakePagingEnabled,
        shakeSensitivity: STATE.shakeSensitivity,
        uiHidden: !!STATE.overlay?.classList.contains('umr-ui-hidden'),
        lang: STATE.lang
      };
      sessionStorage.setItem(UMR_STATE_KEY, JSON.stringify(stateToSave));
    } catch {}
  }

  function loadReaderState() {
    STATE.restoreUiHidden = false;

    try {
      const raw = sessionStorage.getItem(UMR_STATE_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== 'object') return;

      if (saved.mode === 'single' || saved.mode === 'double') {
        STATE.mode = saved.mode;
      }

      if (typeof saved.autoNextEnabled === 'boolean') {
        STATE.autoNextEnabled = saved.autoNextEnabled;
      }

      if (typeof saved.autoPlayEnabled === 'boolean') {
        STATE.autoPlayEnabled = saved.autoPlayEnabled;
      }

      if ([3000, 5000, 7000, 10000].includes(saved.autoPlayDelay)) {
        STATE.autoPlayDelay = saved.autoPlayDelay;
      }

      if (typeof saved.shakePagingEnabled === 'boolean') {
        STATE.shakePagingEnabled = saved.shakePagingEnabled;
      }

      if (SHAKE_SENSITIVITY_LEVELS.includes(saved.shakeSensitivity)) {
        STATE.shakeSensitivity = saved.shakeSensitivity;
      }

      if (saved.lang === 'en' || saved.lang === 'zh') {
        STATE.lang = saved.lang;
      }

      if (saved.shakePagingEnabled && saved.autoPlayEnabled) {
        STATE.autoPlayEnabled = false;
      }

      STATE.restoreUiHidden = !!saved.uiHidden;
    } catch {}
  }

  function clearAutoNextTimer() {
    if (STATE.autoNextTimer) {
      clearTimeout(STATE.autoNextTimer);
      STATE.autoNextTimer = null;
    }
    STATE.autoNextTarget = null;
  }

  function clearAutoPlayTimer() {
    if (STATE.autoPlayTimer) {
      clearTimeout(STATE.autoPlayTimer);
      STATE.autoPlayTimer = null;
    }
  }

  function clearAllAsyncTimers() {
    clearAutoNextTimer();
    clearAutoPlayTimer();
  }

  function scheduleAutoNextIfNeeded() {
    clearAutoNextTimer();
    if (!STATE.isOpen || !STATE.autoNextEnabled || !isAtLastPage()) return;

    const candidate = findNextChapterCandidate();
    STATE.autoNextTarget = candidate;

    if (!candidate) {
      showToast(tf('toast_last_page_no_next'));
      return;
    }

    showToast(tf('toast_last_page_auto_next', { seconds: Math.round(STATE.autoNextDelay / 1000) }));
    STATE.autoNextTimer = setTimeout(() => {
      const latestCandidate = findNextChapterCandidate() || candidate;
      if (!latestCandidate) {
        showToast(tf('toast_auto_next_failed_no_target'));
        return;
      }
      const ok = jumpToNextChapter(latestCandidate);
      if (!ok) showToast(tf('toast_auto_next_failed_open'));
    }, STATE.autoNextDelay);
  }

  function scheduleAutoPlayIfNeeded() {
    clearAutoPlayTimer();
    if (!STATE.isOpen || !STATE.autoPlayEnabled || !STATE.pages.length) return;

    if (isAtLastPage()) {
      scheduleAutoNextIfNeeded();
      return;
    }

    STATE.autoPlayTimer = setTimeout(() => {
      if (!STATE.isOpen || !STATE.autoPlayEnabled) return;
      if (isAtLastPage()) {
        scheduleAutoNextIfNeeded();
        return;
      }
      nextPage(true);
    }, STATE.autoPlayDelay);
  }

  function updateTopbar() {
    if (!STATE.overlay) return;
    const title = STATE.overlay.querySelector('#umr-title');
    if (title) {
      title.textContent = tf('app_title_with_count', {
        title: document.title || tf('app_title'),
        count: STATE.pages.length
      });
    }
  }

  function updateControls() {
    if (!STATE.overlay) return;

    const autoPlayBtn = STATE.overlay.querySelector('#umr-auto-play');
    const autoPlayDelayBtn = STATE.overlay.querySelector('#umr-auto-play-delay');
    const moreBtn = STATE.overlay.querySelector('#umr-more-toggle');
    const modeBtn = STATE.overlay.querySelector('#umr-mode');
    const autoNextBtn = STATE.overlay.querySelector('#umr-auto-next');
    const shakeBtn = STATE.overlay.querySelector('#umr-shake-toggle');
    const shakeSensitivityBtn = STATE.overlay.querySelector('#umr-shake-sensitivity');
    const uiToggleBtn = STATE.overlay.querySelector('#umr-ui-toggle');
    const langBtn = STATE.overlay.querySelector('#umr-language-toggle');

    if (autoPlayBtn) autoPlayBtn.classList.toggle('umr-active', STATE.autoPlayEnabled);
    if (autoPlayBtn) autoPlayBtn.textContent = tf('auto_play');

    if (autoPlayDelayBtn) autoPlayDelayBtn.textContent = tf('btn_seconds', { seconds: Math.round(STATE.autoPlayDelay / 1000) });

    if (moreBtn) {
      moreBtn.classList.toggle('umr-active', STATE.moreOpen);
      moreBtn.textContent = tf('more');
    }

    if (modeBtn) modeBtn.textContent = STATE.mode === 'single' ? tf('mode_single') : tf('mode_double');
    if (autoNextBtn) {
      autoNextBtn.classList.toggle('umr-active', STATE.autoNextEnabled);
      autoNextBtn.textContent = tf('auto_next');
    }
    if (shakeBtn) {
      shakeBtn.classList.toggle('umr-active', STATE.shakePagingEnabled);
      shakeBtn.textContent = tf('shake_paging');
    }
    if (shakeSensitivityBtn) shakeSensitivityBtn.textContent = tf('shake_sensitivity', { level: STATE.shakeSensitivity });

    if (uiToggleBtn) {
      uiToggleBtn.textContent = STATE.overlay.classList.contains('umr-ui-hidden') ? tf('show_ui') : tf('hide_ui');
    }

    if (langBtn) {
      langBtn.textContent = `${tf('language')}: ${STATE.lang === 'en' ? tf('language_en') : tf('language_zh')}`;
    }

    const fullscreenBtn = STATE.overlay.querySelector('#umr-fullscreen');
    const closeBtn = STATE.overlay.querySelector('#umr-close');
    const uiUnlock = STATE.overlay.querySelector('#umr-ui-unlock');
    const helpToggle = STATE.overlay.querySelector('#umr-help-toggle');
    const autoOpenManager = STATE.overlay.querySelector('#umr-auto-open-manager');
    const ruleTitle = STATE.overlay.querySelector('#umr-rule-title');
    const ruleSave = STATE.overlay.querySelector('#umr-rule-save');
    const ruleCancel = STATE.overlay.querySelector('#umr-rule-cancel');
    const ruleDeleteCurrent = STATE.overlay.querySelector('#umr-rule-delete-current');
    const ruleTextarea = STATE.overlay.querySelector('#umr-rule-textarea');
    const help = STATE.overlay.querySelector('#umr-help');
    const ruleTip = STATE.overlay.querySelector('.umr-rule-tip');

    if (fullscreenBtn) fullscreenBtn.title = tf('btn_fullscreen_title');
    if (closeBtn) closeBtn.title = tf('btn_close_title');
    if (uiUnlock) uiUnlock.title = tf('btn_ui_unlock_title');
    if (helpToggle) helpToggle.textContent = tf('help');
    if (autoOpenManager) autoOpenManager.textContent = tf('auto_open_manager');
    if (ruleTitle) ruleTitle.textContent = tf('rule_dialog_title');
    if (ruleSave) ruleSave.textContent = tf('save');
    if (ruleCancel) ruleCancel.textContent = tf('cancel');
    if (ruleDeleteCurrent) ruleDeleteCurrent.textContent = tf('delete');
    if (ruleTextarea) ruleTextarea.placeholder = tf('rule_input_placeholder');
    if (help) help.innerHTML = tf('help_html');
    if (ruleTip) ruleTip.innerHTML = tf('rule_tip_html');
  }

  function updateProgress() {
    if (!STATE.overlay || !STATE.pages.length) return;

    const counter = STATE.overlay.querySelector('#umr-counter');
    const fill = STATE.overlay.querySelector('#umr-progress-fill');
    const handle = STATE.overlay.querySelector('#umr-progress-handle');

    const current = getCurrentVisibleLastPageIndex() + 1;
    const total = STATE.pages.length;
    const baseIndex = Math.min(STATE.index, total - 1);
    const ratio = total <= 1 ? 0 : baseIndex / (total - 1);
    const percent = ratio * 100;

    if (counter) counter.textContent = `${current} / ${total}`;
    if (fill) fill.style.width = `${percent}%`;
    if (handle) handle.style.left = `${percent}%`;
  }

  function renderRuleList() {
    if (!STATE.overlay) return;
    const listEl = STATE.overlay.querySelector('#umr-rule-list');
    if (!listEl) return;

    const rules = getAutoOpenRules();
    if (!rules.length) {
      listEl.innerHTML = `<div id="umr-rule-empty">${escapeHtml(tf('rule_empty'))}</div>`;
      return;
    }

    listEl.innerHTML = rules.map((rule, index) => `
      <div class="umr-rule-row">
        <div class="umr-rule-text">${escapeHtml(rule)}</div>
        <button class="umr-btn" data-rule-edit="${index}">${escapeHtml(tf('edit'))}</button>
        <button class="umr-btn umr-danger" data-rule-delete="${index}">${escapeHtml(tf('delete'))}</button>
      </div>
    `).join('');

    listEl.querySelectorAll('[data-rule-edit]').forEach(btn => {
      btn.addEventListener('click', () => startRuleEdit(Number(btn.getAttribute('data-rule-edit'))));
    });

    listEl.querySelectorAll('[data-rule-delete]').forEach(btn => {
      btn.addEventListener('click', () => deleteRule(Number(btn.getAttribute('data-rule-delete'))));
    });
  }

  function openRuleDialog() {
    if (!STATE.overlay) return;
    const backdrop = STATE.overlay.querySelector('#umr-rule-dialog-backdrop');
    if (!backdrop) return;
    STATE.ruleDialogOpen = true;
    backdrop.classList.add('show');
    renderRuleList();
    cancelRuleEdit();
  }

  function closeRuleDialog() {
    if (!STATE.overlay) return;
    const backdrop = STATE.overlay.querySelector('#umr-rule-dialog-backdrop');
    if (!backdrop) return;
    STATE.ruleDialogOpen = false;
    backdrop.classList.remove('show');
    cancelRuleEdit();
  }

  function startRuleEdit(index = -1) {
    if (!STATE.overlay) return;

    const editor = STATE.overlay.querySelector('#umr-rule-editor');
    const textarea = STATE.overlay.querySelector('#umr-rule-textarea');
    const deleteBtn = STATE.overlay.querySelector('#umr-rule-delete-current');

    if (!editor || !textarea || !deleteBtn) return;

    STATE.ruleEditIndex = index;

    if (index >= 0) {
      const rules = getAutoOpenRules();
      textarea.value = rules[index] || '';
      deleteBtn.style.display = 'inline-flex';
    } else {
      textarea.value = location.href;
      deleteBtn.style.display = 'none';
    }

    editor.classList.add('show');
    textarea.focus();
    textarea.select();
  }

  function cancelRuleEdit() {
    if (!STATE.overlay) return;
    const editor = STATE.overlay.querySelector('#umr-rule-editor');
    const textarea = STATE.overlay.querySelector('#umr-rule-textarea');
    if (!editor || !textarea) return;

    STATE.ruleEditIndex = -1;
    textarea.value = '';
    editor.classList.remove('show');
  }

  function saveRuleFromEditor() {
    if (!STATE.overlay) return;
    const textarea = STATE.overlay.querySelector('#umr-rule-textarea');
    if (!textarea) return;

    const value = textarea.value.trim();
    if (!value) {
      showToast(tf('toast_enter_rule'));
      return;
    }

    const rules = getAutoOpenRules();

    if (STATE.ruleEditIndex >= 0 && STATE.ruleEditIndex < rules.length) {
      rules[STATE.ruleEditIndex] = value;
    } else {
      rules.push(value);
    }

    saveAutoOpenRules(rules);
    renderRuleList();
    cancelRuleEdit();
    showToast(tf('toast_rule_saved'));
  }

  function deleteRule(index) {
    const rules = getAutoOpenRules();
    if (index < 0 || index >= rules.length) return;

    rules.splice(index, 1);
    saveAutoOpenRules(rules);
    renderRuleList();

    if (STATE.ruleEditIndex === index) {
      cancelRuleEdit();
    } else if (STATE.ruleEditIndex > index) {
      STATE.ruleEditIndex--;
    }

    showToast(tf('toast_rule_deleted'));
  }

  function deleteCurrentEditingRule() {
    if (STATE.ruleEditIndex < 0) return;
    deleteRule(STATE.ruleEditIndex);
  }

  function showToast(text, ms = 1800) {
    if (!STATE.overlay) return;
    const toast = STATE.overlay.querySelector('#umr-toast');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, ms);
  }

  function showLoader(text = tf('loader_processing')) {
    if (!STATE.overlay) return;
    const loader = STATE.overlay.querySelector('#umr-loader');
    const loaderText = STATE.overlay.querySelector('#umr-loader-text');
    if (loaderText) loaderText.textContent = text;
    if (loader) loader.style.display = 'flex';
  }

  function hideLoader() {
    if (!STATE.overlay) return;
    const loader = STATE.overlay.querySelector('#umr-loader');
    if (loader) loader.style.display = 'none';
  }

  function lockPageScroll() {
    if (STATE.scrollLocked) return;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    STATE.scrollLocked = true;
  }

  function unlockPageScroll() {
    if (!STATE.scrollLocked) return;
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    STATE.scrollLocked = false;
  }

  async function requestWakeLock() {
    if (!STATE.wakeLockSupported || document.visibilityState !== 'visible') return;
    try {
      STATE.wakeLockSentinel = await navigator.wakeLock.request('screen');
    } catch {}
  }

  async function releaseWakeLock() {
    try {
      await STATE.wakeLockSentinel?.release();
    } catch {}
    STATE.wakeLockSentinel = null;
  }

  async function refreshWakeLockOnVisibility() {
    if (!STATE.isOpen) return;
    if (document.visibilityState === 'visible') {
      await requestWakeLock();
    } else {
      await releaseWakeLock();
    }
  }

  function extractUrlsFromSrcset(srcset) {
    if (!srcset) return [];
    return String(srcset)
      .split(',')
      .map(part => {
        const m = part.trim().match(/^(.+?)(?:\s+\d+(?:\.\d+)?[wx])?$/);
        return normalizeUrl(m ? m[1].trim() : '');
      })
      .filter(Boolean);
  }

  function extractUrlsFromStyleBackground(styleText) {
    const result = [];
    if (!styleText) return result;
    const regex = /url\((['"]?)(.*?)\1\)/ig;
    let m;
    while ((m = regex.exec(styleText))) {
      const url = normalizeUrl(m[2]);
      if (url) result.push(url);
    }
    return result;
  }

  function uniquePush(list, seen, url) {
    if (!url || seen.has(url)) return;
    seen.add(url);
    list.push(url);
  }

  function collectCandidateUrlsFromImg(img) {
    const urls = [];
    const attrs = [
      img.currentSrc,
      img.src,
      img.getAttribute('data-src'),
      img.getAttribute('data-original'),
      img.getAttribute('data-lazy-src'),
      img.getAttribute('data-url'),
      img.getAttribute('data-echo'),
      img.getAttribute('data-cfsrc'),
      img.getAttribute('data-pagespeed-lazy-src'),
      img.getAttribute('data-lazy'),
      img.getAttribute('data-image'),
      img.getAttribute('data-file'),
      img.getAttribute('data-thumb')
    ];

    attrs.forEach(v => {
      const u = normalizeUrl(v);
      if (u) urls.push(u);
    });

    extractUrlsFromSrcset(img.srcset || img.getAttribute('data-srcset') || '').forEach(u => urls.push(u));
    return urls;
  }

  function collectCandidateUrlsFromDocument() {
    const urls = [];
    const seen = new Set();

    document.querySelectorAll('img').forEach(img => {
      collectCandidateUrlsFromImg(img).forEach(u => uniquePush(urls, seen, u));
    });

    document.querySelectorAll('source').forEach(source => {
      extractUrlsFromSrcset(source.srcset || source.getAttribute('data-srcset') || '').forEach(u => uniquePush(urls, seen, u));
    });

    document.querySelectorAll('[style]').forEach(el => {
      const styleAttr = el.getAttribute('style') || '';
      extractUrlsFromStyleBackground(styleAttr).forEach(u => uniquePush(urls, seen, u));
    });

    Array.from(document.querySelectorAll('a[href]')).forEach(a => {
      const href = normalizeUrl(a.getAttribute('href'));
      if (/\.(?:jpg|jpeg|png|webp|gif|bmp|avif)(?:$|\?)/i.test(href)) {
        uniquePush(urls, seen, href);
      }
    });

    const htmlText = document.documentElement?.outerHTML || '';
    const regex = /(["'`])((?:https?:)?\/\/[^"'`\s<>]+?\.(?:jpg|jpeg|png|webp|gif|bmp|avif)(?:\?[^"'`\s<>]*)?|\/[^"'`\s<>]+?\.(?:jpg|jpeg|png|webp|gif|bmp|avif)(?:\?[^"'`\s<>]*)?)\1/ig;
    let match;
    while ((match = regex.exec(htmlText))) {
      const u = normalizeUrl(match[2]);
      uniquePush(urls, seen, u);
    }

    return urls.slice(0, STATE.config.proactiveMaxCandidates);
  }

  async function ensureLazyImagesVisible() {
    const lazySelectors = [
      'img[loading="lazy"]',
      'img[data-src]',
      'img[data-original]',
      'img[data-lazy-src]',
      'img[data-url]',
      'img[data-echo]',
      'img[data-cfsrc]',
      'img[data-pagespeed-lazy-src]',
      'img[data-lazy]',
      'img[data-image]',
      'img[data-file]',
      'source[data-srcset]'
    ];

    document.querySelectorAll(lazySelectors.join(',')).forEach(el => {
      if (el.tagName === 'IMG') {
        const img = el;
        const candidates = [
          img.getAttribute('data-src'),
          img.getAttribute('data-original'),
          img.getAttribute('data-lazy-src'),
          img.getAttribute('data-url'),
          img.getAttribute('data-echo'),
          img.getAttribute('data-cfsrc'),
          img.getAttribute('data-pagespeed-lazy-src'),
          img.getAttribute('data-lazy'),
          img.getAttribute('data-image'),
          img.getAttribute('data-file')
        ].filter(Boolean);

        if ((!img.src || img.src.startsWith('data:')) && candidates[0]) img.src = candidates[0];
        if (!img.srcset && img.dataset?.srcset) img.srcset = img.dataset.srcset;
        try {
          img.loading = 'eager';
          img.decoding = 'sync';
          img.fetchPriority = 'high';
        } catch {}
      } else if (el.tagName === 'SOURCE') {
        const srcset = el.getAttribute('data-srcset');
        if (srcset && !el.srcset) el.srcset = srcset;
      }
    });

    const allImgs = Array.from(document.images);
    allImgs.forEach(img => {
      try {
        img.loading = 'eager';
        img.decoding = 'sync';
        img.fetchPriority = 'high';
      } catch {}
    });

    const originalY = window.scrollY;
    const maxScroll = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );
    const step = Math.max(480, Math.floor(window.innerHeight * 0.9));

    for (let y = 0; y <= maxScroll; y += step) {
      window.scrollTo(0, y);
      await sleep(40);
    }

    window.scrollTo(0, maxScroll);
    await sleep(120);
    window.scrollTo(0, originalY);
    await sleep(80);
  }

  function getPageImageLoadSummary() {
    const images = Array.from(document.images);
    let loaded = 0;
    let largeLoaded = 0;

    images.forEach(img => {
      const w = img.naturalWidth || img.width || 0;
      const h = img.naturalHeight || img.height || 0;
      if (w > 0 && h > 0) loaded++;
      if (w >= STATE.config.minWidth && h >= STATE.config.minHeight) largeLoaded++;
    });

    return { total: images.length, loaded, largeLoaded };
  }

  async function warmImageUrl(url, timeoutMs = 9000) {
    if (!url) return null;

    if (STATE.proactiveMetaMap.has(url)) {
      const cached = STATE.proactiveMetaMap.get(url);
      if (cached && cached.ok) return cached;
    }

    return new Promise(resolve => {
      const img = new Image();
      let settled = false;

      const done = (payload) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(payload);
      };

      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer-when-downgrade';

      img.onload = () => {
        const meta = {
          src: url,
          width: img.naturalWidth || 0,
          height: img.naturalHeight || 0,
          ok: true,
          fromProbe: true
        };
        STATE.proactiveMetaMap.set(url, meta);
        done(meta);
      };

      img.onerror = () => {
        const meta = { src: url, width: 0, height: 0, ok: false, fromProbe: true };
        STATE.proactiveMetaMap.set(url, meta);
        done(meta);
      };

      const timer = setTimeout(() => {
        const meta = { src: url, width: 0, height: 0, ok: false, fromProbe: true, timeout: true };
        STATE.proactiveMetaMap.set(url, meta);
        done(meta);
      }, timeoutMs);

      img.src = url;
    });
  }

  async function proactiveDiscoverAndWarmImages() {
    STATE.proactiveDoneCount = 0;
    STATE.proactiveCandidates = collectCandidateUrlsFromDocument();

    const total = STATE.proactiveCandidates.length;
    if (!total) return;

    const queue = STATE.proactiveCandidates.slice(0);
    const workers = [];
    const concurrency = Math.min(STATE.config.proactiveConcurrency, total);

    for (let i = 0; i < concurrency; i++) {
      workers.push((async () => {
        while (queue.length) {
          const url = queue.shift();
          if (!url) break;
          await warmImageUrl(url);
          STATE.proactiveDoneCount++;
          if (STATE.overlay) {
            showLoader(tf('loader_detecting_progress', { done: STATE.proactiveDoneCount, total }));
          }
        }
      })());
    }

    await Promise.all(workers);
  }

  function scoreContainerHint(el) {
    if (!el) return 0;
    const text = [
      el.className || '',
      el.id || '',
      el.getAttribute?.('data-role') || '',
      el.getAttribute?.('role') || ''
    ].join(' ');
    return /manga|comic|chapter|viewer|reader|page|content|image|img|post/i.test(text) ? 12 : 0;
  }

  function smartCollectMangaPages() {
    const seen = new Set();
    const result = [];
    const viewportArea = Math.max(1, window.innerWidth * window.innerHeight);
    const minArea = Math.min(STATE.config.minArea, Math.floor(viewportArea * 0.22));

    const allImgs = Array.from(document.images);

    allImgs.forEach((img, idx) => {
      const urls = collectCandidateUrlsFromImg(img);
      const src = urls.find(Boolean);
      if (!src || seen.has(src)) return;

      const width = img.naturalWidth || img.width || 0;
      const height = img.naturalHeight || img.height || 0;
      if (!width || !height) return;

      const area = width * height;
      const ratio = width / Math.max(1, height);

      if (width < STATE.config.minWidth) return;
      if (height < STATE.config.minHeight) return;
      if (area < minArea) return;
      if (ratio < STATE.config.aspectMin || ratio > STATE.config.aspectMax) return;

      const rect = img.getBoundingClientRect();
      const score =
        Math.min(area / 100000, 100) +
        (rect.top >= -window.innerHeight && rect.top <= document.documentElement.clientHeight * 3 ? 8 : 0) +
        scoreContainerHint(img.closest('[class],[id]')) +
        (/page|comic|manga|chapter|content|viewer|reader/i.test(
          [
            img.className,
            img.id,
            img.alt,
            img.closest('[class],[id]')?.className || '',
            img.closest('[class],[id]')?.id || ''
          ].join(' ')
        ) ? 12 : 0);

      result.push({
        src,
        alt: img.alt || '',
        width,
        height,
        score,
        order: idx,
        from: 'dom'
      });
      seen.add(src);
    });

    STATE.proactiveCandidates.forEach((src, idx) => {
      if (!src || seen.has(src)) return;
      const meta = STATE.proactiveMetaMap.get(src);
      if (!meta || !meta.ok) return;

      const width = meta.width || 0;
      const height = meta.height || 0;
      if (!width || !height) return;

      const area = width * height;
      const ratio = width / Math.max(1, height);

      if (width < STATE.config.minWidth) return;
      if (height < STATE.config.minHeight) return;
      if (area < minArea) return;
      if (ratio < STATE.config.aspectMin || ratio > STATE.config.aspectMax) return;

      let score = Math.min(area / 100000, 90);
      if (/chapter|comic|manga|page|reader|viewer/i.test(src)) score += 8;
      if (/\.webp|\.jpg|\.jpeg|\.png/i.test(src)) score += 4;

      result.push({
        src,
        alt: '',
        width,
        height,
        score,
        order: 100000 + idx,
        from: 'probe'
      });
      seen.add(src);
    });

    result.sort((a, b) => a.order - b.order);

    return result.filter((page, i, arr) => {
      const prev = arr[i - 1];
      if (!prev) return true;
      return page.src !== prev.src;
    });
  }

  function preloadAround(index) {
    if (!STATE.pages.length) return;
    const max = Math.min(STATE.pages.length - 1, index + STATE.preloadCount);
    const min = Math.max(0, index - 2);

    for (let i = min; i <= max; i++) {
      const src = STATE.pages[i]?.src;
      if (!src) continue;
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    }
  }

  function findNextChapterCandidate() {
    const keywords = [
      '下一章', '下页', '下一頁', '下一话', '下一話', '下一回', '下一卷',
      'next', 'next chapter', 'next page', 'older', '继续', '繼續'
    ];

    const selectors = [
      'a[href]',
      'button',
      '[role="button"]',
      '[onclick]'
    ];

    const nodes = Array.from(document.querySelectorAll(selectors.join(',')));
    let best = null;
    let bestScore = -Infinity;

    nodes.forEach(node => {
      const text = (node.textContent || node.getAttribute('aria-label') || node.title || '').trim();
      const href = node.href || node.getAttribute('href') || '';

      const hay = `${text} ${href}`.toLowerCase();
      if (!keywords.some(k => hay.includes(k.toLowerCase()))) return;

      const rect = node.getBoundingClientRect();
      let score = 0;

      if (keywords.some(k => text.toLowerCase().includes(k.toLowerCase()))) score += 40;
      if (/chapter|chap|page|next|下/.test(href.toLowerCase())) score += 20;
      if (rect.right > window.innerWidth * 0.55) score += 8;
      if (rect.top > window.innerHeight * 0.35) score += 5;
      if (node.offsetParent) score += 3;

      if (score > bestScore) {
        bestScore = score;
        best = node;
      }
    });

    return best;
  }

  function jumpToNextChapter(target) {
    if (!target) return false;

    try {
      sessionStorage.setItem(AUTO_NEXT_FLAG, '1');
    } catch {}

    try {
      if (target.href) {
        location.href = target.href;
        return true;
      }
      target.click();
      return true;
    } catch {
      return false;
    }
  }

  function computeDoublePageWidths(renderList, stageRect) {
    const gap = 8;
    const sidePadding = 24;
    const usableHeight = Math.max(100, stageRect.height || window.innerHeight);
    const availableWidth = Math.max(160, (stageRect.width || window.innerWidth) - sidePadding - gap);

    const naturalWidths = renderList.map(page => {
      const pw = Math.max(1, Number(page?.width || 1));
      const ph = Math.max(1, Number(page?.height || 1));
      return Math.max(60, (pw / ph) * usableHeight);
    });

    const totalNatural = naturalWidths.reduce((a, b) => a + b, 0);
    const scale = totalNatural > availableWidth ? availableWidth / totalNatural : 1;

    return naturalWidths.map(w => Math.max(60, Math.floor(w * scale)));
  }

  function getVisiblePages() {
    if (STATE.mode === 'single') return [STATE.pages[STATE.index]].filter(Boolean);
    const first = STATE.pages[STATE.index];
    const second = STATE.pages[STATE.index + 1];
    return [first, second].filter(Boolean);
  }

  function classifyPageShape(page, forceDouble = false) {
    if (!page) return 'portrait';
    const ratio = (page.width || 1) / (page.height || 1);

    if (forceDouble) {
      if (ratio > 1.2) return 'landscape';
      if (ratio > 0.88) return 'square';
      return 'portrait';
    }

    if (ratio > 1.05) return 'landscape';
    if (ratio > 0.9) return 'square';
    return 'portrait';
  }

  function renderPages(direction = '') {
    if (!STATE.overlay || !STATE.pages.length) return;

    const book = STATE.overlay.querySelector('#umr-book');
    const stage = STATE.overlay.querySelector('#umr-stage');
    if (!book || !stage) return;

    book.innerHTML = '';
    const renderList = getVisiblePages();
    const isDouble = STATE.mode === 'double';
    const stageRect = stage.getBoundingClientRect();
    const doubleWidths = isDouble ? computeDoublePageWidths(renderList, stageRect) : [];

    book.classList.toggle('umr-book-double', isDouble);

    renderList.forEach((page, i) => {
      const shape = classifyPageShape(page, isDouble);

      const wrap = document.createElement('div');
      wrap.className = [
        'umr-pageWrap',
        isDouble ? 'double' : 'single',
        shape,
        direction ? `turn-${direction}` : ''
      ].filter(Boolean).join(' ');

      if (isDouble) {
        const targetWidth = doubleWidths[i] || 120;
        wrap.style.width = `${targetWidth}px`;
        wrap.style.maxWidth = `${targetWidth}px`;
        wrap.style.flex = `0 0 ${targetWidth}px`;
      } else {
        wrap.style.width = '';
        wrap.style.maxWidth = '';
        wrap.style.flex = '';
      }

      const img = document.createElement('img');
      img.className = 'umr-page';
      img.src = page.src;
      img.alt = page.alt || `Page ${STATE.index + i + 1}`;
      img.draggable = false;
      img.decoding = 'async';
      img.loading = 'eager';

      const meta = document.createElement('div');
      meta.className = 'umr-pageMeta';
      meta.textContent = `${page.width}×${page.height}`;

      wrap.appendChild(img);
      wrap.appendChild(meta);
      book.appendChild(wrap);
    });

    updateTopbar();
    updateControls();
    updateProgress();
    preloadAround(STATE.index);

    clearAutoNextTimer();
    scheduleAutoPlayIfNeeded();

    if (!STATE.autoPlayEnabled && isAtLastPage()) {
      scheduleAutoNextIfNeeded();
    }
  }

  function nextPage(fromAutoPlay = false) {
    if (!STATE.pages.length) return;
    clearAutoNextTimer();
    clearAutoPlayTimer();

    const step = getCurrentStep();
    const next = Math.min(STATE.pages.length - 1, STATE.index + step);

    if (next === STATE.index) {
      if (!fromAutoPlay) showToast(tf('toast_already_last'));
      scheduleAutoNextIfNeeded();
      return;
    }

    STATE.index = next;
    renderPages('next');
  }

  function prevPage() {
    if (!STATE.pages.length) return;
    clearAllAsyncTimers();
    const step = getCurrentStep();
    const prev = Math.max(0, STATE.index - step);
    if (prev === STATE.index) {
      showToast(tf('toast_already_first'));
      return;
    }
    STATE.index = prev;
    renderPages('prev');
  }

  function goToPage(index) {
    const safeIndex = Math.max(0, Math.min(STATE.pages.length - 1, index));
    if (safeIndex === STATE.index) return;
    const direction = safeIndex > STATE.index ? 'next' : 'prev';
    clearAllAsyncTimers();
    STATE.index = safeIndex;
    renderPages(direction);
  }

  function isAtLastPage() {
    if (!STATE.pages.length) return false;
    if (STATE.mode === 'double') return STATE.index >= STATE.pages.length - 2 || STATE.index >= STATE.pages.length - 1;
    return STATE.index >= STATE.pages.length - 1;
  }

  function getCurrentStep() {
    return STATE.mode === 'double' ? 2 : 1;
  }

  function getCurrentVisibleLastPageIndex() {
    if (!STATE.pages.length) return 0;
    if (STATE.mode === 'double') return Math.min(STATE.pages.length - 1, STATE.index + 1);
    return STATE.index;
  }

  function toggleMode() {
    clearAllAsyncTimers();
    STATE.mode = STATE.mode === 'single' ? 'double' : 'single';
    saveReaderState();
    renderPages();
    showToast(STATE.mode === 'single' ? tf('toast_mode_single') : tf('toast_mode_double'));
  }

  function toggleUI(force) {
    if (!STATE.overlay) return;

    if (typeof force === 'boolean') {
      STATE.overlay.classList.toggle('umr-ui-hidden', force);
    } else {
      STATE.overlay.classList.toggle('umr-ui-hidden');
    }

    saveReaderState();
    updateControls();
  }

  function toggleMore(force) {
    if (!STATE.overlay) return;
    const panel = STATE.overlay.querySelector('#umr-more-panel');
    if (!panel) return;

    STATE.moreOpen = typeof force === 'boolean' ? force : !STATE.moreOpen;
    panel.classList.toggle('show', STATE.moreOpen);
    updateControls();
  }

  function toggleAutoNext() {
    STATE.autoNextEnabled = !STATE.autoNextEnabled;
    saveReaderState();
    updateControls();
    clearAutoNextTimer();

    if (!STATE.autoNextEnabled) {
      showToast(tf('toast_auto_next_off'));
      return;
    }

    showToast(tf('toast_auto_next_on'));
    if (isAtLastPage()) scheduleAutoNextIfNeeded();
  }

  function toggleAutoPlay() {
    STATE.autoPlayEnabled = !STATE.autoPlayEnabled;

    if (STATE.autoPlayEnabled && STATE.shakePagingEnabled) {
      STATE.shakePagingEnabled = false;
      resetShakeDetector();
      showToast(tf('toast_shake_off_due_autoplay'));
    }

    saveReaderState();
    updateControls();
    updateProgress();
    clearAutoPlayTimer();
    clearAutoNextTimer();

    if (!STATE.autoPlayEnabled) {
      showToast(tf('toast_auto_play_off'));
      return;
    }

    showToast(tf('toast_auto_play_on', { seconds: Math.round(STATE.autoPlayDelay / 1000) }));
    scheduleAutoPlayIfNeeded();
  }

  function cycleAutoPlayDelay() {
    const options = [3000, 5000, 7000, 10000];
    const idx = options.indexOf(STATE.autoPlayDelay);
    STATE.autoPlayDelay = options[(idx + 1) % options.length];

    saveReaderState();
    updateControls();
    updateProgress();

    if (STATE.autoPlayEnabled) {
      clearAutoPlayTimer();
      scheduleAutoPlayIfNeeded();
    }
  }

  async function toggleShakePaging() {
    if (!STATE.shakePagingEnabled) {
      const granted = await requestMotionPermissionIfNeeded();
      if (!granted) {
        showToast(tf('toast_motion_permission_denied'));
        return;
      }

      bindShakeMotionIfNeeded();

      if (STATE.autoPlayEnabled) {
        STATE.autoPlayEnabled = false;
        clearAutoPlayTimer();
      }

      STATE.shakePagingEnabled = true;
      resetShakeDetector();

      saveReaderState();
      updateControls();
      updateProgress();
      showToast(tf('toast_shake_on', { level: STATE.shakeSensitivity }));
      return;
    }

    STATE.shakePagingEnabled = false;
    resetShakeDetector();
    saveReaderState();
    updateControls();
    showToast(tf('toast_shake_off'));
  }

  function cycleShakeSensitivity() {
    const idx = SHAKE_SENSITIVITY_LEVELS.indexOf(STATE.shakeSensitivity);
    STATE.shakeSensitivity = SHAKE_SENSITIVITY_LEVELS[(idx + 1) % SHAKE_SENSITIVITY_LEVELS.length];
    resetShakeDetector();
    saveReaderState();
    updateControls();
    showToast(tf('toast_shake_sensitivity', { level: STATE.shakeSensitivity }));
  }

  async function toggleFullscreen() {
    if (!STATE.overlay) return;
    try {
      if (!document.fullscreenElement) {
        await STATE.overlay.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      showToast(tf('toast_fullscreen_fail'));
    }
  }

  function syncFullscreenState() {
    STATE.fullscreen = !!document.fullscreenElement;
    const btn = STATE.overlay?.querySelector('#umr-fullscreen');
    if (btn) btn.classList.toggle('umr-active', STATE.fullscreen);
  }

  function toggleLanguage() {
    STATE.lang = STATE.lang === 'en' ? 'zh' : 'en';
    saveLanguage(STATE.lang);
    saveReaderState();
    applyI18nToOverlay();
    renderRuleList();
    updateTopbar();
    updateControls();
    updateProgress();
    showToast(tf('toast_lang_switched', { lang: STATE.lang === 'en' ? tf('language_en') : tf('language_zh') }));
  }

  function applyI18nToOverlay() {
    if (!STATE.overlay) return;
    updateTopbar();
    updateControls();
    renderRuleList();
  }

  async function openReader() {
    createOverlay();
    if (!STATE.overlay) return;

    clearAllAsyncTimers();
    toggleMore(false);

    STATE.overlay.classList.remove('umr-hidden');
    STATE.isOpen = true;
    lockPageScroll();
    await requestWakeLock();

    showLoader(tf('loader_trigger_lazy'));
    await ensureLazyImagesVisible();

    const summary = getPageImageLoadSummary();
    console.log('[UMR] Initial image load summary:', summary);

    showLoader(tf('loader_detect_sources'));
    await proactiveDiscoverAndWarmImages();

    const finalSummary = getPageImageLoadSummary();
    console.log('[UMR] Final image load summary:', finalSummary, 'probe=', STATE.proactiveMetaMap.size);

    showLoader(tf('loader_analyzing_pages', {
      domCount: finalSummary.largeLoaded,
      probeCount: STATE.proactiveMetaMap.size
    }));
    STATE.pages = smartCollectMangaPages();

    if (!STATE.pages.length) {
      showLoader(tf('loader_no_pages'));
      showToast(tf('toast_not_found_pages'));
      return;
    }

    STATE.index = 0;
    loadReaderState();
    applyI18nToOverlay();
    bindShakeMotionIfNeeded();

    if (STATE.shakePagingEnabled) {
      resetShakeDetector();
    }

    hideLoader();
    renderPages();

    if (STATE.restoreUiHidden) {
      toggleUI(true);
    } else {
      toggleUI(false);
    }

    preloadAround(0);
    showToast(tf('toast_loaded_pages', { count: STATE.pages.length }));
  }

  async function closeReader() {
    saveReaderState();
    clearAllAsyncTimers();

    if (!STATE.overlay) return;

    STATE.isOpen = false;
    toggleMore(false);
    toggleUI(false);
    closeRuleDialog();
    STATE.overlay.classList.add('umr-hidden');
    unlockPageScroll();
    await releaseWakeLock();

    const help = STATE.overlay.querySelector('#umr-help');
    if (help) help.classList.remove('show');

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  function createOverlay() {
    if (STATE.overlay) return STATE.overlay;

    const overlay = document.createElement('div');
    overlay.id = 'umr-overlay';
    overlay.className = 'umr-hidden';

    overlay.innerHTML = `
      <div id="umr-topbar">
        <div class="umr-title" id="umr-title">${escapeHtml(tf('app_title'))}</div>
      </div>

      <div id="umr-stage">
        <div class="umr-nav-zone umr-nav-left"></div>
        <div class="umr-nav-center"></div>
        <div class="umr-nav-zone umr-nav-right"></div>

        <button id="umr-ui-unlock" class="umr-icon-btn" title="${escapeHtml(tf('btn_ui_unlock_title'))}">✕</button>

        <div id="umr-book"></div>
        <div id="umr-toast"></div>

        <div id="umr-loader">
          <div class="umr-spinner"></div>
          <div id="umr-loader-text">${escapeHtml(tf('loader_analyzing_current_page'))}</div>
        </div>

        <div id="umr-rule-dialog-backdrop">
          <div id="umr-rule-dialog">
            <div id="umr-rule-toolbar">
              <div id="umr-rule-title">${escapeHtml(tf('rule_dialog_title'))}</div>
              <button class="umr-btn" id="umr-rule-add">+</button>
              <button class="umr-btn umr-icon-btn" id="umr-rule-close" title="${escapeHtml(tf('close'))}">✕</button>
            </div>

            <div id="umr-rule-body">
              <div class="umr-rule-tip">${tf('rule_tip_html')}</div>

              <div id="umr-rule-list"></div>

              <div id="umr-rule-editor">
                <textarea id="umr-rule-textarea" spellcheck="false" placeholder="${escapeHtml(tf('rule_input_placeholder'))}"></textarea>
                <div class="umr-rule-editor-actions">
                  <button class="umr-btn" id="umr-rule-save">${escapeHtml(tf('save'))}</button>
                  <button class="umr-btn" id="umr-rule-cancel">${escapeHtml(tf('cancel'))}</button>
                  <button class="umr-btn umr-danger" id="umr-rule-delete-current">${escapeHtml(tf('delete'))}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="umr-bottombar">
        <div id="umr-more-panel">
          <div id="umr-help">${tf('help_html')}</div>

          <div id="umr-more-grid">
            <button class="umr-btn umr-more-item" id="umr-mode">${escapeHtml(tf('mode_single'))}</button>
            <button class="umr-btn umr-more-item umr-active" id="umr-auto-next">${escapeHtml(tf('auto_next'))}</button>
            <button class="umr-btn umr-more-item" id="umr-shake-toggle">${escapeHtml(tf('shake_paging'))}</button>
            <button class="umr-btn umr-more-item" id="umr-shake-sensitivity">${escapeHtml(tf('shake_sensitivity', { level: 3 }))}</button>
            <button class="umr-btn umr-more-item" id="umr-auto-open-manager">${escapeHtml(tf('auto_open_manager'))}</button>
            <button class="umr-btn umr-more-item" id="umr-language-toggle">${escapeHtml(tf('language'))}: ${escapeHtml(tf('language_en'))}</button>
            <button class="umr-btn umr-more-item" id="umr-help-toggle">${escapeHtml(tf('help'))}</button>
          </div>
        </div>

        <div id="umr-control-row">
          <button class="umr-btn" id="umr-auto-play">${escapeHtml(tf('auto_play'))}</button>
          <button class="umr-btn" id="umr-auto-play-delay">${escapeHtml(tf('btn_seconds', { seconds: 3 }))}</button>
          <button class="umr-btn" id="umr-ui-toggle">${escapeHtml(tf('hide_ui'))}</button>
          <button class="umr-btn umr-icon-btn" id="umr-fullscreen" title="${escapeHtml(tf('btn_fullscreen_title'))}">⛶</button>
          <button class="umr-btn umr-icon-btn" id="umr-close" title="${escapeHtml(tf('btn_close_title'))}">✕</button>
          <button class="umr-btn" id="umr-more-toggle">${escapeHtml(tf('more'))}</button>
        </div>

        <div id="umr-progress-row">
          <div id="umr-progress">
            <div id="umr-progress-fill"></div>
            <div id="umr-progress-handle"></div>
          </div>
          <div id="umr-counter">0 / 0</div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    STATE.overlay = overlay;
    bindOverlayEvents();
    applyI18nToOverlay();
    return overlay;
  }

  function bindOverlayEvents() {
    const overlay = document.getElementById('umr-overlay');
    if (!overlay) return;

    const stage = overlay.querySelector('#umr-stage');

    overlay.querySelector('#umr-close').addEventListener('click', closeReader);
    overlay.querySelector('#umr-auto-play').addEventListener('click', toggleAutoPlay);
    overlay.querySelector('#umr-auto-play-delay').addEventListener('click', cycleAutoPlayDelay);
    overlay.querySelector('#umr-auto-next').addEventListener('click', toggleAutoNext);
    overlay.querySelector('#umr-mode').addEventListener('click', toggleMode);
    overlay.querySelector('#umr-shake-toggle').addEventListener('click', toggleShakePaging);
    overlay.querySelector('#umr-shake-sensitivity').addEventListener('click', cycleShakeSensitivity);
    overlay.querySelector('#umr-auto-open-manager').addEventListener('click', openRuleDialog);
    overlay.querySelector('#umr-language-toggle').addEventListener('click', toggleLanguage);
    overlay.querySelector('#umr-fullscreen').addEventListener('click', toggleFullscreen);
    overlay.querySelector('#umr-ui-toggle').addEventListener('click', toggleUI);
    overlay.querySelector('#umr-more-toggle').addEventListener('click', () => toggleMore());
    overlay.querySelector('#umr-help-toggle').addEventListener('click', () => {
      overlay.querySelector('#umr-help').classList.toggle('show');
    });

    overlay.querySelector('#umr-ui-unlock').addEventListener('click', (e) => {
      e.stopPropagation();
      if (overlay.classList.contains('umr-ui-hidden')) {
        toggleUI(false);
      }
    });

    overlay.querySelector('#umr-rule-close').addEventListener('click', closeRuleDialog);
    overlay.querySelector('#umr-rule-add').addEventListener('click', () => startRuleEdit(-1));
    overlay.querySelector('#umr-rule-save').addEventListener('click', saveRuleFromEditor);
    overlay.querySelector('#umr-rule-cancel').addEventListener('click', cancelRuleEdit);
    overlay.querySelector('#umr-rule-delete-current').addEventListener('click', deleteCurrentEditingRule);
    overlay.querySelector('#umr-rule-dialog-backdrop').addEventListener('click', (e) => {
      if (e.target === overlay.querySelector('#umr-rule-dialog-backdrop')) {
        closeRuleDialog();
      }
    });

    overlay.querySelector('.umr-nav-left').addEventListener('click', () => prevPage());
    overlay.querySelector('.umr-nav-right').addEventListener('click', () => nextPage());
    overlay.querySelector('.umr-nav-center').addEventListener('click', () => toggleUI());

    const progress = overlay.querySelector('#umr-progress');
    progress.addEventListener('click', (e) => {
      if (!STATE.pages.length) return;
      const rect = progress.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const target = Math.round(ratio * Math.max(STATE.pages.length - 1, 0));
      goToPage(target);
    });

    stage.addEventListener('touchstart', (e) => {
      if (!e.touches[0]) return;
      STATE.touchStartX = e.touches[0].clientX;
      STATE.touchStartY = e.touches[0].clientY;
      STATE.touchMoved = false;
    }, { passive: true });

    stage.addEventListener('touchmove', (e) => {
      if (!e.touches[0]) return;
      const dx = e.touches[0].clientX - STATE.touchStartX;
      const dy = e.touches[0].clientY - STATE.touchStartY;
      if (Math.abs(dx) > 12 || Math.abs(dy) > 12) STATE.touchMoved = true;
    }, { passive: true });

    stage.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      if (!touch) return;

      const dx = touch.clientX - STATE.touchStartX;
      const dy = touch.clientY - STATE.touchStartY;

      if (!STATE.touchMoved) {
        const width = window.innerWidth;
        if (touch.clientX < width * 0.30) prevPage();
        else if (touch.clientX > width * 0.70) nextPage();
        else toggleUI();
        return;
      }

      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) nextPage();
        else prevPage();
      }
    }, { passive: true });

    if (!STATE.keyHandlerBound) {
      document.addEventListener('keydown', onKeydown, true);
      STATE.keyHandlerBound = true;
    }

    if (!STATE.resizeHandlerBound) {
      window.addEventListener('resize', debounce(() => {
        if (STATE.isOpen) renderPages();
      }, 80));
      STATE.resizeHandlerBound = true;
    }

    if (!STATE.fullscreenHandlerBound) {
      document.addEventListener('fullscreenchange', syncFullscreenState, true);
      STATE.fullscreenHandlerBound = true;
    }

    if (!STATE.visibilityHandlerBound) {
      document.addEventListener('visibilitychange', refreshWakeLockOnVisibility, true);
      STATE.visibilityHandlerBound = true;
    }
  }

  function onKeydown(e) {
    if (!STATE.isOpen) return;
    const key = String(e.key || '').toLowerCase();

    if (key === 'arrowright' || key === 'd' || key === ' ') {
      e.preventDefault();
      nextPage();
    } else if (key === 'arrowleft' || key === 'a') {
      e.preventDefault();
      prevPage();
    } else if (key === 'escape') {
      if (STATE.ruleDialogOpen) {
        e.preventDefault();
        closeRuleDialog();
        return;
      }
      e.preventDefault();
      closeReader();
    } else if (key === 'f') {
      e.preventDefault();
      toggleFullscreen();
    } else if (key === 'm') {
      e.preventDefault();
      toggleMode();
    } else if (key === 'u') {
      e.preventDefault();
      toggleUI();
    } else if (key === 'n') {
      e.preventDefault();
      toggleAutoNext();
    } else if (key === 'p') {
      e.preventDefault();
      toggleAutoPlay();
    } else if (key === 't') {
      e.preventDefault();
      cycleAutoPlayDelay();
    } else if (key === 'l') {
      e.preventDefault();
      toggleLanguage();
    }
  }

  async function bootAutoOpenIfNeeded() {
    let fromNext = false;
    try {
      fromNext = sessionStorage.getItem(AUTO_NEXT_FLAG) === '1';
      if (fromNext) sessionStorage.removeItem(AUTO_NEXT_FLAG);
    } catch {}

    const fromRule = matchesAutoOpenRule(location.href);
    if (!fromNext && !fromRule) return;

    await sleep(700);
    await openReader();
  }

  bootAutoOpenIfNeeded();
})();
