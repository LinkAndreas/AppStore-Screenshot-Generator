import { useState, useRef, useEffect } from 'react';
import { useConfig, type Localization, type DeviceType } from '../store/ConfigContext';
import { SCREEN_DIMENSIONS } from '../constants';
import { LOCALIZATION_PRESETS } from '../translations';
import { Plus, Sun, Moon, Trash2, Download, Layers, Smartphone, Tablet, Package, ChevronDown, Check, Laptop, Watch, BookOpen, type LucideIcon } from 'lucide-react';
import { DEVICES, DEVICE_EXPORT_NAMES, DEVICE_TYPES, type DeviceType as Device } from '../shared/layout';
import { CURRENT_VERSION } from '../releaseNotes';
import { BrandMark } from './BrandMark';
import { APP_NAME } from '../brand';

const DEVICE_ICONS: Record<Device, LucideIcon> = {
  iPhone: Smartphone,
  iPhoneDuoInner: BookOpen,
  iPhoneDuoOuter: Smartphone,
  iPad: Tablet,
  Mac: Laptop,
  WatchUltra: Watch,
  Watch: Watch,
};
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { toBlob } from 'html-to-image';

export const LeftSidebar = () => {
  const config = useConfig();
  const { isProcessing, setIsProcessing, processingMessage, setProcessingMessage, t } = config;

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportMode, setExportMode] = useState<'selected' | 'locales' | 'devices' | 'full'>('full');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddLocalization = (loc: Localization) => {
    config.addLocalization(loc);
  };

  // --- Export Capture Logic ---

  const sanitizeFilename = (name: string) => {
    // Remove dots and other characters except final extension to prevent Chrome "Safe Browsing" renaming
    const base = name.replace(/\.zip$/i, '').replace(/[^a-z0-9_-]/gi, '_');
    return `${base}.zip`;
  };

  const captureCurrentScreens = async (zip: JSZip, device: DeviceType, folderName?: string) => {
    console.log(`[Export] Capturing ${device} set...`);
    const sequenceNode = document.getElementById('sequence-container');
    if (!sequenceNode) return;

    const screensElems = Array.from(sequenceNode.querySelectorAll('.app-screen')) as HTMLElement[];
    if (screensElems.length === 0) {
      console.warn(`[Export] No screens found for ${device}.`);
      return;
    }

    const { width, height } = SCREEN_DIMENSIONS[device];

    for (let i = 0; i < screensElems.length; i++) {
      const screen = screensElems[i];
      try {
        const blob = await toBlob(screen, {
          canvasWidth: width,
          canvasHeight: height,
          width: width,
          height: height,
          quality: 1.0,
          pixelRatio: 1,
          style: { transform: 'scale(1)', margin: '0', transformOrigin: 'top left' }
        });

        if (blob) {
          const filename = `screen_${i + 1}.png`;
          if (folderName) {
            zip.file(`${folderName}/${filename}`, blob);
          } else {
            zip.file(filename, blob);
          }
        }
      } catch (err) {
        console.error(`[Export] Failed to capture screen ${i + 1}:`, err);
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };

  const triggerDownload = async (zip: JSZip, filename: string) => {
    const cleanName = sanitizeFilename(filename);
    console.log(`[Export] Preparing download for: ${cleanName}`);
    
    // Standard ZIP generation
    const content = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/zip',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    
    console.log(`[Export] ZIP generated (${(content.size / 1024).toFixed(1)} KB). Calling FileSaver...`);

    try {
      // Use FileSaver's saveAs which handles Chrome's strange blob naming internally
      FileSaver.saveAs(content, cleanName);
    } catch (e) {
      console.warn('[Export] FileSaver failed, using anchor fallback', e);
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = cleanName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  /** Devices with screens (in one language, or in any), so exports skip empty folders. */
  const exportDevices = (locId?: string) => DEVICE_TYPES.filter(d => config.screenCount(d, locId) > 0);

  const handleExportSelected = async () => {
    setIsProcessing(true);
    setProcessingMessage(config.t('processing.capturing', { device: config.activeDeviceType }));
    await new Promise(resolve => setTimeout(resolve, 150));

    const zip = new JSZip();
    try {
      await captureCurrentScreens(zip, config.activeDeviceType);
      await triggerDownload(zip, `${APP_NAME}_${DEVICE_EXPORT_NAMES[config.activeDeviceType]}_${config.activeLocalizationId}.zip`);
    } catch (err) {
      console.error('[Export] Error:', err);
      alert('Export failed. Check console.');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const handleExportAll = async () => {
    setIsProcessing(true);
    const deviceName = DEVICE_EXPORT_NAMES[config.activeDeviceType];
    setProcessingMessage(config.t('processing.preparing.device', { device: deviceName }));
    await new Promise(resolve => setTimeout(resolve, 150));

    const zip = new JSZip();
    const originalActiveId = config.activeLocalizationId;
    try {
      for (const loc of config.localizations) {
        setProcessingMessage(config.t('processing.capturing.loc', { device: deviceName, locale: loc.id }));
        config.setActiveLocalizationId(loc.id);
        await new Promise(resolve => setTimeout(resolve, 800)); // Increased wait for render
        await captureCurrentScreens(zip, config.activeDeviceType, loc.id);
      }
      config.setActiveLocalizationId(originalActiveId);
      await triggerDownload(zip, `${APP_NAME}_${deviceName}_All_Languages.zip`);
    } catch (err) {
      console.error('[Export] Error:', err);
      alert('Bulk export failed.');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const handleExportEverything = async () => {
    setIsProcessing(true);
    setProcessingMessage(config.t('processing.preparing.full'));
    await new Promise(resolve => setTimeout(resolve, 200));

    const zip = new JSZip();
    const originalActiveId = config.activeLocalizationId;
    const originalDeviceType = config.activeDeviceType;

    try {
      for (const device of exportDevices()) {
        config.setActiveDeviceType(device);
        const deviceDir = DEVICE_EXPORT_NAMES[device];
        for (const loc of config.localizations) {
          if (config.screenCount(device, loc.id) === 0) continue;
          setProcessingMessage(config.t('processing.capturing.loc', { device, locale: loc.id }));
          config.setActiveLocalizationId(loc.id);
          await new Promise(resolve => setTimeout(resolve, 800));
          await captureCurrentScreens(zip, device, `${deviceDir}/${loc.id}`);
        }
      }
      config.setActiveDeviceType(originalDeviceType);
      config.setActiveLocalizationId(originalActiveId);

      await triggerDownload(zip, `${APP_NAME}_All_Screenshots.zip`);
    } catch (err) {
      console.error('[Export] Error:', err);
      alert('Total asset export failed.');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const handleExportDevices = async () => {
    setIsProcessing(true);
    setProcessingMessage(config.t('processing.preparing.all', { locale: config.activeLocalizationId }));
    await new Promise(resolve => setTimeout(resolve, 150));

    const zip = new JSZip();
    const originalDeviceType = config.activeDeviceType;
    try {
      for (const device of exportDevices(config.activeLocalizationId)) {
        config.setActiveDeviceType(device);
        setProcessingMessage(config.t('processing.capturing', { device: DEVICES[device].label }));
        await new Promise(resolve => setTimeout(resolve, 800));
        const deviceDir = DEVICE_EXPORT_NAMES[device];
        await captureCurrentScreens(zip, device, deviceDir);
      }
      config.setActiveDeviceType(originalDeviceType);
      await triggerDownload(zip, `${APP_NAME}_All_Devices_${config.activeLocalizationId}.zip`);
    } catch (err) {
      console.error('[Export] Error:', err);
      alert('Export failed.');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  // --- Export Mode Configuration ---

  const activeLanguage = config.localizations.find(l => l.id === config.activeLocalizationId)?.name ?? config.activeLocalizationId;
  const deviceName = t(`device.${config.activeDeviceType}`);
  const bothDevices = t('export.allDevices');

  // Each mode reads as "what" · "which languages", e.g. "All devices · All languages".
  const EXPORT_MODES = {
    selected: {
      title: `${deviceName} · ${activeLanguage}`,
      icon: <Download size={14} />,
      handler: handleExportSelected,
      isEnabled: config.projectHasScreens
    },
    locales: {
      title: `${deviceName} · ${t('export.allLanguages')}`,
      icon: <Layers size={14} />,
      handler: handleExportAll,
      isEnabled: config.projectHasScreens
    },
    devices: {
      title: `${bothDevices} · ${activeLanguage}`,
      icon: <Smartphone size={14} />,
      handler: handleExportDevices,
      isEnabled: config.projectHasScreens
    },
    full: {
      title: `${bothDevices} · ${t('export.allLanguages')}`,
      icon: <Package size={14} />,
      handler: handleExportEverything,
      isEnabled: config.projectHasScreens
    }
  };

  const currentMode = EXPORT_MODES[exportMode];

  const handleMainExport = () => {
    if (currentMode.isEnabled && !isProcessing) {
      currentMode.handler();
    }
  };


  return (
    <div className="sidebar sidebar-left">
      <div className="sidebar-header">
        <BrandMark size={40} className="brand-mark" />
        <div className="branding">
          <h1 className="branding-title">{APP_NAME}</h1>
          <p className="branding-subtitle">{t('app.tagline')}</p>
        </div>
        <button
          className="icon-btn"
          onClick={config.toggleTheme}
          title={config.theme === 'dark' ? t('theme.light') : t('theme.dark')}
          aria-label={config.theme === 'dark' ? t('theme.light') : t('theme.dark')}
        >
          {config.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>

      <div className="sidebar-content">
        <div className="panel-group">
          <h3>{t('device.section')}</h3>
          <div className="card flush loc-list" role="listbox" aria-label={t('device.section')}>
            {DEVICE_TYPES.map(device => {
              const isActive = config.activeDeviceType === device;
              const Icon = DEVICE_ICONS[device];
              const count = config.screenCount(device, config.activeLocalizationId);
              return (
                <div
                  key={device}
                  role="option"
                  aria-selected={isActive}
                  className={`loc-row device-row ${isActive ? 'active' : ''}`}
                  onClick={() => config.setActiveDeviceType(device)}
                >
                  <span className="device-icon"><Icon size={17} /></span>
                  <span className="device-text">
                    <span className="loc-name">{t(`device.${device}`)}</span>
                    <span className="device-size">{SCREEN_DIMENSIONS[device].width} × {SCREEN_DIMENSIONS[device].height}</span>
                  </span>
                  {count > 0 && <span className="device-count">{count}</span>}
                  {isActive && <span className="loc-check"><Check size={16} strokeWidth={2.5} /></span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel-group">
          <div className="section-title-row">
            <h3 className="section-title">{t('language.section')}</h3>
            <div className="add-locale">
              <select
                onChange={(e) => {
                  const preset = LOCALIZATION_PRESETS.find(p => p.id === e.target.value);
                  if (preset) handleAddLocalization(preset);
                  e.target.value = '';
                }}
                disabled={isProcessing}
                value=""
                aria-label={t('language.add')}
                title={t('language.add')}
              >
                <option value="" disabled>{t('language.add')}</option>
                {LOCALIZATION_PRESETS.filter(p => !config.localizations.some(l => l.id === p.id)).map(p => (
                  <option key={p.id} value={p.id}>{p.flag} {p.name}</option>
                ))}
              </select>
              <button className="icon-btn small accent" tabIndex={-1} disabled={isProcessing}>
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="card flush loc-list">
            {config.localizations.map(loc => {
              const isActive = config.activeLocalizationId === loc.id;
              return (
                <div
                  key={loc.id}
                  className={`loc-row ${isActive ? 'active' : ''} ${isProcessing && !isActive ? 'disabled' : ''}`}
                  onClick={() => !isProcessing && config.setActiveLocalizationId(loc.id)}
                >
                  <span className="loc-flag">{loc.flag}</span>
                  <span className="loc-name">{loc.name}</span>
                  {loc.id !== 'en-US' && !isProcessing && (
                    <button
                      className="loc-remove"
                      onClick={(e) => { e.stopPropagation(); config.removeLocalization(loc.id); }}
                      aria-label={`Remove ${loc.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  {isActive && <span className="loc-check"><Check size={16} strokeWidth={2.5} /></span>}
                </div>
              );
            })}
          </div>
          <p className="hint" style={{ padding: '0 4px' }}>{t('language.hint')}</p>
        </div>
      </div>

      <div className="sidebar-footer">

        <div className="export-container" ref={menuRef}>
          {showExportMenu && !isProcessing && (
            <div className="export-dropdown" role="menu">
              <div className="section-header">{t('export.menu.heading')}</div>
              {(Object.keys(EXPORT_MODES) as (keyof typeof EXPORT_MODES)[]).map(mode => (
                <div
                  key={mode}
                  role="menuitemradio"
                  aria-checked={exportMode === mode}
                  className={`dropdown-item ${exportMode === mode ? 'active' : ''}`}
                  onClick={() => { setExportMode(mode); setShowExportMenu(false); }}
                >
                  <div className="item-icon">{exportMode === mode ? <Check size={14} strokeWidth={2.5} /> : EXPORT_MODES[mode].icon}</div>
                  <div className="item-text">{EXPORT_MODES[mode].title}</div>
                </div>
              ))}
            </div>
          )}

          <div className="export-split-button">
            <button
              className="primary main-action"
              onClick={handleMainExport}
              disabled={isProcessing || !currentMode.isEnabled}
            >
              {isProcessing ? (
                <><span className="spinner-mini" /> {t('processing.title')}…</>
              ) : (
                <><Download size={15} /> {t('export.button')}</>
              )}
            </button>
            <button
              className="primary toggle-action"
              aria-label={t('export.menu.heading')}
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isProcessing}
            >
              <ChevronDown size={16} style={{ transform: showExportMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
          </div>
        </div>
        <div className="export-status">
          {processingMessage || currentMode.title}
        </div>
        <button className="whats-new-link" onClick={() => config.setShowWhatsNew(true)}>
          {APP_NAME} {CURRENT_VERSION} · {t('whatsNew.link')}
        </button>
      </div>
    </div>
  );
};
