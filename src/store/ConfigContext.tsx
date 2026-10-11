import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { TRANSLATIONS, LOCALIZATION_PRESETS } from '../translations';
import { DEVICE_TYPES, isDeviceType, type DeviceType } from '../shared/layout';
import type { ScreenFontId } from '../shared/fonts';
import { createScreen, LOCALIZED_DEFAULTS } from './screenFactory';
import { CURRENT_VERSION } from '../releaseNotes';

/** Style a screen can share with others: colours, typography (not the text itself). */
const SHARED_STYLE_KEYS = [
  'bgType', 'bgColor', 'bgGradientStart', 'bgGradientEnd',
  'titleColor', 'subtitleColor', 'titleFont', 'subtitleFont', 'titleSize', 'subtitleSize',
  'titleBold', 'subtitleBold', 'titleItalic', 'subtitleItalic', 'titleUnderline', 'subtitleUnderline',
  'titleAlign', 'subtitleAlign',
] as const satisfies readonly (keyof ScreenConfig)[];

const pickLayout = (s: ScreenConfig): Partial<ScreenConfig> => ({
  bezelName: s.bezelName, scale: s.scale, rotation: s.rotation, offsetX: s.offsetX, offsetY: s.offsetY, positioning: s.positioning,
});

export interface ScreenConfig {
  id: string;
  imageObjUrl: string | null;
  bezelName: string;
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  title: string;
  subtitle: string;
  bgType: 'color' | 'gradient';
  bgColor: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  titleAlign?: 'left' | 'center' | 'right';
  subtitleAlign?: 'left' | 'center' | 'right';
  positioning?: 'center' | 'bottom' | 'top';
  titleColor?: string;
  subtitleColor?: string;
  titleSize?: number;
  subtitleSize?: number;
  titleItalic?: boolean;
  titleUnderline?: boolean;
  subtitleItalic?: boolean;
  subtitleUnderline?: boolean;
  titleBold?: boolean;
  subtitleBold?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  /** Typefaces from src/shared/fonts.ts; unset means the defaults (Outfit / Inter). */
  titleFont?: ScreenFontId;
  subtitleFont?: ScreenFontId;
}

// Localization no longer owns deviceType or screens directly
export interface Localization {
  id: string;
  name: string;
  flag: string;
}

export type { DeviceType };
export type MobileTab = 'setup' | 'editor' | 'customize';

// Key pattern: "iPhone-en-US", "iPad-de-DE", etc.
export type ScreenSetKey = string;
const makeKey = (device: DeviceType, locId: string): ScreenSetKey => `${device}-${locId}`;

export interface AppContextType {
  // Device (top-level)
  activeDeviceType: DeviceType;
  setActiveDeviceType: (dt: DeviceType) => void;

  // Localizations (device-agnostic)
  localizations: Localization[];
  activeLocalizationId: string;
  setActiveLocalizationId: (id: string) => void;
  addLocalization: (loc: Localization) => void;
  removeLocalization: (id: string) => void;

  // Screens for the current device×locale combination
  screens: ScreenConfig[];
  addScreen: () => void;
  removeScreen: (id: string) => void;
  updateScreen: (id: string, updates: Partial<ScreenConfig>) => void;
  batchAddScreens: (newScreens: ScreenConfig[]) => void;
  reorderScreens: (startIndex: number, endIndex: number) => void;

  rightSidebarTab: 'layout' | 'style' | 'content';
  setRightSidebarTab: (tab: 'layout' | 'style' | 'content') => void;

  selectedScreenId: string | null;
  setSelectedScreenId: (id: string | null) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  canvasZoom: number;
  setCanvasZoom: (zoom: number | ((prev: number) => number)) => void;
  expandedSections: string[];
  setExpandedSections: React.Dispatch<React.SetStateAction<string[]>>;
  getDefaultTypography: (locId: string) => { title: string; subtitle: string };
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  processingMessage: string;
  setProcessingMessage: (val: string) => void;
  mobileTab: MobileTab;
  setMobileTab: (tab: MobileTab) => void;
  showTutorial: boolean;
  setShowTutorial: (val: boolean) => void;
  showWhatsNew: boolean;
  setShowWhatsNew: (val: boolean) => void;
  /** Copies background, text style, frame and placement from one screen to every screen. Returns how many changed. */
  applyStyleToAll: (sourceId: string) => number;
  uiLanguage: string;
  t: (key: string, params?: Record<string, string>) => string;
  projectHasScreens: boolean;
  /** Number of screens for a device, in one language or (without locId) in all of them. */
  screenCount: (device: DeviceType, locId?: string) => number;
  mobileSheetHeight: number;
  setMobileSheetHeight: (val: number) => void;
  appError: string | null;
  setAppError: (msg: string | null) => void;
}

const ConfigContext = createContext<AppContextType | null>(null);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [activeDeviceType, setActiveDeviceType] = useState<DeviceType>(() => {
    const saved = localStorage.getItem('activeDeviceType');
    return isDeviceType(saved) ? saved : 'iPhone';
  });

  // Detect system language and find best match in presets
  const getInitialLocalization = (): Localization => {
    const sysLang = navigator.language.toLowerCase();
    const match = LOCALIZATION_PRESETS.find(p => 
      sysLang.startsWith(p.id.split('-')[0].toLowerCase())
    );
    return match || LOCALIZATION_PRESETS[0]; // Fallback to en-US
  };

  const [uiLanguage] = useState<string>(() => getInitialLocalization().id);

  const [localizations, setLocalizations] = useState<Localization[]>(() => {
    const saved = localStorage.getItem('localizations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved localizations', e);
      }
    }
    const initial = getInitialLocalization();
    const defaults = [{ id: 'en-US', name: 'English (US)', flag: '🇺🇸' }];
    if (initial.id !== 'en-US') {
      defaults.push(initial);
    }
    return defaults;
  });

  const [activeLocalizationId, setActiveLocalizationId] = useState(() => {
    const saved = localStorage.getItem('activeLocalizationId');
    if (saved) return saved;
    return getInitialLocalization().id;
  });

  // All screens stored as device×locale keyed map
  const [screenSets, setScreenSets] = useState<Record<ScreenSetKey, ScreenConfig[]>>(() => {
    const saved = localStorage.getItem('screenSets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clear blob URLs as they are invalid after reload
        Object.keys(parsed).forEach(key => {
          parsed[key] = parsed[key].map((s: ScreenConfig) => ({ ...s, imageObjUrl: null }));
        });
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved screenSets', e);
      }
    }
    return {};
  });

  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [rightSidebarTab, setRightSidebarTab] = useState<'layout' | 'style' | 'content'>('content');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });
  const [canvasZoom, setCanvasZoom] = useState<number>(1.0);
  const [expandedSections, setExpandedSections] = useState<string[]>(['title']);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingMessage, setProcessingMessage] = useState<string>('');
  const [mobileTab, setMobileTab] = useState<MobileTab>('editor');
  const [mobileSheetHeight, setMobileSheetHeight] = useState<number>(50);
  const [appError, setAppError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(() => {
    return localStorage.getItem('tutorialCompleted') !== 'true';
  });

  useEffect(() => {
    document.documentElement.classList.remove('light-mode', 'dark-mode');
    document.documentElement.classList.add(`${theme}-mode`);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('localizations', JSON.stringify(localizations));
  }, [localizations]);

  useEffect(() => {
    localStorage.setItem('activeLocalizationId', activeLocalizationId);
  }, [activeLocalizationId]);

  useEffect(() => {
    localStorage.setItem('activeDeviceType', activeDeviceType);
  }, [activeDeviceType]);

  useEffect(() => {
    // Save screenSets to localStorage, but without blob URLs
    const toSave: Record<string, ScreenConfig[]> = {};
    Object.keys(screenSets).forEach(key => {
      toSave[key] = screenSets[key].map(s => ({ ...s, imageObjUrl: null }));
    });
    localStorage.setItem('screenSets', JSON.stringify(toSave));
  }, [screenSets]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Derive active screens from the current device×locale key
  const activeKey = makeKey(activeDeviceType, activeLocalizationId);
  const screens = screenSets[activeKey] ?? [];

  const projectHasScreens = Object.values(screenSets).some(set => set.length > 0);

  const screenCount = (device: DeviceType, locId?: string) =>
    locId !== undefined
      ? screenSets[makeKey(device, locId)]?.length ?? 0
      : localizations.reduce((n, l) => n + (screenSets[makeKey(device, l.id)]?.length ?? 0), 0);

  const updateCurrentScreens = (updater: (prev: ScreenConfig[]) => ScreenConfig[]) => {
    setScreenSets(prev => ({ ...prev, [activeKey]: updater(prev[activeKey] ?? []) }));
  };

  const getDefaultTypography = (locId: string) => 
    LOCALIZED_DEFAULTS[locId] || LOCALIZED_DEFAULTS['en-US'];

  const addScreen = () => {
    const newScreen = createScreen(activeDeviceType, getDefaultTypography(activeLocalizationId));
    updateCurrentScreens(prev => [...prev, newScreen]);
    setSelectedScreenId(newScreen.id);
  };

  const removeScreen = (id: string) => {
    updateCurrentScreens(prev => prev.filter(s => s.id !== id));
    if (selectedScreenId === id) setSelectedScreenId(null);
  };

  const updateScreen = (id: string, updates: Partial<ScreenConfig>) => {
    updateCurrentScreens(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const batchAddScreens = (newScreens: ScreenConfig[]) => {
    updateCurrentScreens(prev => [...prev, ...newScreens]);
    if (newScreens.length > 0) setSelectedScreenId(newScreens[0].id);
  };

  const reorderScreens = (startIndex: number, endIndex: number) => {
    updateCurrentScreens(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const addLocalization = (loc: Localization) => {
    if (localizations.some(l => l.id === loc.id)) return;
    setLocalizations(prev => [...prev, loc]);
    setActiveLocalizationId(loc.id);
  };

  const removeLocalization = (id: string) => {
    if (id === 'en-US') return;
    setLocalizations(prev => prev.filter(l => l.id !== id));
    // Clean up all device×locale screen sets for this locale
    setScreenSets(prev => {
      const next = { ...prev };
      for (const device of DEVICE_TYPES) delete next[makeKey(device, id)];
      return next;
    });
    if (activeLocalizationId === id) setActiveLocalizationId('en-US');
  };

  // When switching device type, deselect screen (may not exist in new set)
  const handleSetActiveDeviceType = (dt: DeviceType) => {
    setActiveDeviceType(dt);
    setSelectedScreenId(null);
  };

  // Returning users see "What's New" once per release; first-time users get the tutorial instead.
  const [showWhatsNew, setShowWhatsNewState] = useState<boolean>(() =>
    localStorage.getItem('tutorialCompleted') === 'true' && localStorage.getItem('lastSeenVersion') !== CURRENT_VERSION);
  const setShowWhatsNew = (val: boolean) => {
    setShowWhatsNewState(val);
    if (!val) localStorage.setItem('lastSeenVersion', CURRENT_VERSION);
  };

  const applyStyleToAll = (sourceId: string) => {
    const source = screens.find(s => s.id === sourceId);
    if (!source) return 0;
    const style = Object.fromEntries(SHARED_STYLE_KEYS.map(key => [key, source[key]])) as Partial<ScreenConfig>;
    const changed = Object.values(screenSets).reduce((n, set) => n + set.filter(s => s.id !== sourceId).length, 0);
    setScreenSets(prev => Object.fromEntries(Object.entries(prev).map(([key, set]) => {
      // Frame, size and placement only make sense on the same device.
      const sameDevice = key.startsWith(`${activeDeviceType}-`);
      return [key, set.map(s => s.id === sourceId ? s : { ...s, ...style, ...(sameDevice ? pickLayout(source) : {}) })];
    })));
    return changed;
  };

  const handleSetShowTutorial = (val: boolean) => {
    setShowTutorial(val);
    if (!val) {
      localStorage.setItem('tutorialCompleted', 'true');
    }
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const lang = uiLanguage || 'en-US';
    let text = TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en-US']?.[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };

  return (
    <ConfigContext.Provider value={{
      activeDeviceType, setActiveDeviceType: handleSetActiveDeviceType,
      localizations, activeLocalizationId, setActiveLocalizationId,
      addLocalization, removeLocalization,
      screens, addScreen, removeScreen, updateScreen, batchAddScreens, reorderScreens,
      selectedScreenId, setSelectedScreenId,
      rightSidebarTab, setRightSidebarTab,
      theme, toggleTheme,
      canvasZoom, setCanvasZoom,
      expandedSections, setExpandedSections,
      getDefaultTypography,
      isProcessing, setIsProcessing,
      processingMessage, setProcessingMessage,
      mobileTab, setMobileTab,
      showTutorial, setShowTutorial: handleSetShowTutorial,
      showWhatsNew, setShowWhatsNew,
      applyStyleToAll,
      uiLanguage,
      t,
      projectHasScreens,
      screenCount,
      mobileSheetHeight,
      setMobileSheetHeight,
      appError,
      setAppError
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfig must be used within a ConfigProvider');
  return context;
};
