import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getDefaultBezel } from '../constants';
import { TRANSLATIONS, LOCALIZATION_PRESETS } from '../translations';

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
}

// Localization no longer owns deviceType or screens directly
export interface Localization {
  id: string;
  name: string;
  flag: string;
}

export type DeviceType = 'iPhone' | 'iPad';
export type MobileTab = 'setup' | 'editor' | 'customize';

// Key pattern: "iPhone-en-US", "iPad-de-DE", etc.
export type ScreenSetKey = string;
const makeKey = (device: DeviceType, locId: string): ScreenSetKey => `${device}-${locId}`;

const LOCALIZED_DEFAULTS: Record<string, { title: string; subtitle: string }> = {
  'en-US': { title: 'Feature Title', subtitle: 'A short description here' },
  'de-DE': { title: 'Feature Titel', subtitle: 'Kurze Beschreibung hier' },
  'fr-FR': { title: 'Titre du Feature', subtitle: 'Description courte ici' },
  'es-ES': { title: 'Título', subtitle: 'Breve descripción aquí' },
  'it-IT': { title: 'Titolo', subtitle: 'Breve descrizione' },
  'ja-JP': { title: 'タイトル', subtitle: 'ここに簡単な説明' },
  'zh-CN': { title: '标题', subtitle: '在此输入简短描述' },
};

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
  uiLanguage: string;
  t: (key: string, params?: Record<string, string>) => string;
  projectHasScreens: boolean;
  mobileSheetHeight: number;
  setMobileSheetHeight: (val: number) => void;
  appError: string | null;
  setAppError: (msg: string | null) => void;
}

const ConfigContext = createContext<AppContextType | null>(null);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [activeDeviceType, setActiveDeviceType] = useState<DeviceType>('iPhone');

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
    const initial = getInitialLocalization();
    const defaults = [{ id: 'en-US', name: 'English (US)', flag: '🇺🇸' }];
    if (initial.id !== 'en-US') {
      defaults.push(initial);
    }
    return defaults;
  });

  const [activeLocalizationId, setActiveLocalizationId] = useState(() => {
    return getInitialLocalization().id;
  });

  // All screens stored as device×locale keyed map
  const [screenSets, setScreenSets] = useState<Record<ScreenSetKey, ScreenConfig[]>>({});

  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [rightSidebarTab, setRightSidebarTab] = useState<'layout' | 'style' | 'content'>('layout');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
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
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Derive active screens from the current device×locale key
  const activeKey = makeKey(activeDeviceType, activeLocalizationId);
  const screens = screenSets[activeKey] ?? [];

  const projectHasScreens = Object.values(screenSets).some(set => set.length > 0);

  const updateCurrentScreens = (updater: (prev: ScreenConfig[]) => ScreenConfig[]) => {
    setScreenSets(prev => ({ ...prev, [activeKey]: updater(prev[activeKey] ?? []) }));
  };

  const getDefaultBezelForDevice = (device: DeviceType) =>
    device === 'iPad' ? 'iPad Pro 13 - M4 - Silver - Portrait' : getDefaultBezel();

  const getDefaultTypography = (locId: string) => 
    LOCALIZED_DEFAULTS[locId] || LOCALIZED_DEFAULTS['en-US'];

  const addScreen = () => {
    const id = crypto.randomUUID();
    const newScreen: ScreenConfig = {
      id,
      imageObjUrl: null,
      bezelName: getDefaultBezelForDevice(activeDeviceType),
      scale: activeDeviceType === 'iPad' ? 1.5 : 1.0,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      positioning: 'top',
      ...getDefaultTypography(activeLocalizationId),
      titleAlign: 'center',
      subtitleAlign: 'center',
      titleSize: activeDeviceType === 'iPad' ? 144 : 120,
      subtitleSize: activeDeviceType === 'iPad' ? 72 : 60,
      titleBold: true,
      subtitleBold: false,
      bgType: 'gradient',
      bgColor: '#ffffff',
      bgGradientStart: '#0f172a',
      bgGradientEnd: '#3b82f6',
      titleColor: '#ffffff',
      subtitleColor: '#ffffff',
      showTitle: true,
      showSubtitle: true,
    };
    updateCurrentScreens(prev => [...prev, newScreen]);
    setSelectedScreenId(id);
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
      delete next[makeKey('iPhone', id)];
      delete next[makeKey('iPad', id)];
      return next;
    });
    if (activeLocalizationId === id) setActiveLocalizationId('en-US');
  };

  // When switching device type, deselect screen (may not exist in new set)
  const handleSetActiveDeviceType = (dt: DeviceType) => {
    setActiveDeviceType(dt);
    setSelectedScreenId(null);
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
      uiLanguage,
      t,
      projectHasScreens,
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
