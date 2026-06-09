/**
 * DayNightModule — 日间/夜间主题管理器
 *
 * 功能：
 *   - 基于时间自动切换主题
 *   - 手动切换主题
 *   - localStorage 持久化用户偏好
 *   - 自动挂载切换按钮
 *   - 主题事件派发
 *
 * 对外接口：
 *   window.ThemeManager  — 构造函数
 *   window.themeManager  — 当前实例
 *
 * 事件：
 *   theme:initialized    — 初始化完成
 *   theme:themeChanged   — 主题切换
 *   theme:destroyed      — 销毁完成
 */
class ThemeManager {
  constructor(config = {}) {
    this.config = {
      dayStartHour: config.dayStartHour || 6,
      nightStartHour: config.nightStartHour || 18,
      storageKey: config.storageKey || 'theme-preference',
      autoUpdateInterval: config.autoUpdateInterval || 60000,
      enableManualOverride: config.enableManualOverride !== false,
    };

    this.currentTheme = null;
    this.updateTimer = null;

    // 存储事件监听器引用，便于 destroy 时清理
    this._onThemeChanged = null;

    this.init();
  }

  /* ------------------------------------------
     初始化
     ------------------------------------------ */
  init() {
    const savedTheme = this.getSavedTheme();

    if (savedTheme && this.config.enableManualOverride) {
      this.setTheme(savedTheme, false);
    } else {
      this.setThemeByTime();
    }

    if (this.config.autoUpdateInterval > 0) {
      this.startAutoUpdate();
    }

    this.dispatchEvent('initialized', { theme: this.currentTheme });
  }

  /* ------------------------------------------
     主题判断
     ------------------------------------------ */
  getThemeByTime() {
    const hour = new Date().getHours();
    const { dayStartHour, nightStartHour } = this.config;

    if (dayStartHour < nightStartHour) {
      // 正常区间，如 6 ~ 18
      return (hour >= dayStartHour && hour < nightStartHour) ? 'day' : 'night';
    } else {
      // 跨午夜区间，如 22 ~ 6
      return (hour >= dayStartHour || hour < nightStartHour) ? 'day' : 'night';
    }
  }

  setThemeByTime() {
    this.setTheme(this.getThemeByTime(), false);
  }

  /* ------------------------------------------
     主题切换
     ------------------------------------------ */
  setTheme(theme, savePreference = true) {
    if (this.currentTheme === theme) return;

    const oldTheme = this.currentTheme;
    this.currentTheme = theme;

    if (theme === 'night') {
      document.documentElement.setAttribute('data-theme', 'night');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    if (savePreference && this.config.enableManualOverride) {
      this.saveTheme(theme);
    }

    this.dispatchEvent('themeChanged', {
      oldTheme,
      newTheme: theme,
      isManual: savePreference,
    });
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'day' ? 'night' : 'day';
    this.setTheme(newTheme, true);
  }

  /* ------------------------------------------
     持久化
     ------------------------------------------ */
  saveTheme(theme) {
    try {
      localStorage.setItem(this.config.storageKey, theme);
    } catch (e) {
      console.warn('[ThemeManager] 保存偏好失败:', e);
    }
  }

  getSavedTheme() {
    try {
      return localStorage.getItem(this.config.storageKey);
    } catch (e) {
      console.warn('[ThemeManager] 读取偏好失败:', e);
      return null;
    }
  }

  clearSavedTheme() {
    try {
      localStorage.removeItem(this.config.storageKey);
    } catch (e) {
      console.warn('[ThemeManager] 清除偏好失败:', e);
    }
    this.setThemeByTime();
  }

  /* ------------------------------------------
     自动更新
     ------------------------------------------ */
  startAutoUpdate() {
    this.stopAutoUpdate();
    this.updateTimer = setInterval(() => {
      // 仅在无手动偏好时自动切换
      if (!this.getSavedTheme()) {
        this.setThemeByTime();
      }
    }, this.config.autoUpdateInterval);
  }

  stopAutoUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  /* ------------------------------------------
     事件
     ------------------------------------------ */
  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(`theme:${eventName}`, {
      detail: { ...detail, timestamp: new Date().toISOString() },
    });
    document.dispatchEvent(event);
  }

  /* ------------------------------------------
     查询
     ------------------------------------------ */
  getCurrentTheme() {
    return this.currentTheme;
  }

  getConfig() {
    return { ...this.config };
  }

  /* ------------------------------------------
     销毁
     ------------------------------------------ */
  destroy() {
    this.stopAutoUpdate();

    // 移除全局事件监听
    if (this._onThemeChanged) {
      document.removeEventListener('theme:themeChanged', this._onThemeChanged);
      this._onThemeChanged = null;
    }

    this.dispatchEvent('destroyed');
    this.currentTheme = null;
  }
}

/* ============================================
   自动初始化 IIFE
   ============================================ */
(function () {
  if (typeof window === 'undefined') return;

  window.ThemeManager = ThemeManager;

  /* ------------------------------------------
     从 <script> 标签读取 data-* 配置
     ------------------------------------------ */
  function getConfigFromScript() {
    const script = document.currentScript;
    if (!script) return {};

    const ds = script.dataset;
    const config = {};

    if (ds.dayStart) config.dayStartHour = parseInt(ds.dayStart, 10);
    if (ds.nightStart) config.nightStartHour = parseInt(ds.nightStart, 10);
    if (ds.interval) config.autoUpdateInterval = parseInt(ds.interval, 10);
    if (ds.storageKey) config.storageKey = ds.storageKey;
    if (ds.manualOverride) config.enableManualOverride = ds.manualOverride !== 'false';
    if (ds.autoInit) config.autoInit = ds.autoInit !== 'false';
    if (ds.autoButton) config.autoButton = ds.autoButton !== 'false';
    if (ds.buttonSelector) config.buttonSelector = ds.buttonSelector;

    return config;
  }

  /* ------------------------------------------
     创建切换按钮
     ------------------------------------------ */
  function createToggleButton(themeManager) {
    const button = document.createElement('button');
    button.className = 'dnm-toggle';
    button.setAttribute('aria-label', '切换日间/夜间主题');

    const icon = document.createElement('span');
    icon.className = 'dnm-toggle__icon';
    const text = document.createElement('span');
    text.className = 'dnm-toggle__text';

    button.appendChild(icon);
    button.appendChild(text);

    function updateButton(theme) {
      if (theme === 'night') {
        icon.textContent = '☀️';
        text.textContent = '日间';
      } else {
        icon.textContent = '🌙';
        text.textContent = '夜间';
      }
    }

    // 初始化按钮状态
    updateButton(themeManager.getCurrentTheme());

    // 点击切换
    button.addEventListener('click', () => {
      themeManager.toggleTheme();
    });

    // 监听主题变化更新按钮
    const onThemeChanged = (e) => updateButton(e.detail.newTheme);
    document.addEventListener('theme:themeChanged', onThemeChanged);

    // 保存引用，便于 destroy 时清理
    themeManager._onThemeChanged = onThemeChanged;

    return button;
  }

  /* ------------------------------------------
     初始化主题系统
     ------------------------------------------ */
  function initThemeSystem(config) {
    const themeManager = new ThemeManager(config);
    window.themeManager = themeManager;

    if (config.autoButton !== false) {
      const customButton = config.buttonSelector
        ? document.querySelector(config.buttonSelector)
        : null;

      if (customButton) {
        // 使用自定义按钮
        customButton.addEventListener('click', () => {
          themeManager.toggleTheme();
        });

        const onThemeChanged = (e) => {
          customButton.dataset.theme = e.detail.newTheme;
        };
        document.addEventListener('theme:themeChanged', onThemeChanged);
        themeManager._onThemeChanged = onThemeChanged;
      } else {
        // 自动创建按钮
        const button = createToggleButton(themeManager);
        document.body.appendChild(button);
      }
    }
  }

  /* ------------------------------------------
     入口
     ------------------------------------------ */
  function autoInit() {
    const config = getConfigFromScript();

    if (config.autoInit === false) return;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initThemeSystem(config));
    } else {
      initThemeSystem(config);
    }
  }

  autoInit();
})();
