import { useState, useRef, useEffect } from 'react';
import { useConfig, type Localization, type DeviceType } from '../store/ConfigContext';
import { SCREEN_DIMENSIONS } from '../constants';
import { LOCALIZATION_PRESETS } from '../translations';
import { Plus, Sun, Moon, Trash2, Download, Layers, Smartphone, Tablet, Zap, ChevronDown, Check } from 'lucide-react';
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

  const handleExportSelected = async () => {
    setIsProcessing(true);
    setProcessingMessage(config.t('processing.capturing', { device: config.activeDeviceType }));
    await new Promise(resolve => setTimeout(resolve, 150));

    const zip = new JSZip();
    try {
      await captureCurrentScreens(zip, config.activeDeviceType);
      const deviceName = config.activeDeviceType === 'iPad' ? 'iPad_13' : 'iPhone_6.9';
      await triggerDownload(zip, `AppStore_${deviceName}_${config.activeLocalizationId}.zip`);
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
    const deviceName = config.activeDeviceType === 'iPad' ? 'iPad_13' : 'iPhone_6.9';
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
      await triggerDownload(zip, `AppStore_Bulk_${deviceName}.zip`);
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
      const devices: ('iPhone' | 'iPad')[] = ['iPhone', 'iPad'];
      for (const device of devices) {
        config.setActiveDeviceType(device);
        const deviceDir = device === 'iPad' ? 'iPad_13' : 'iPhone_6.9';
        for (const loc of config.localizations) {
          setProcessingMessage(config.t('processing.capturing.loc', { device, locale: loc.id }));
          config.setActiveLocalizationId(loc.id);
          await new Promise(resolve => setTimeout(resolve, 800));
          await captureCurrentScreens(zip, device, `${deviceDir}/${loc.id}`);
        }
      }
      config.setActiveDeviceType(originalDeviceType);
      config.setActiveLocalizationId(originalActiveId);

      await triggerDownload(zip, 'AppStore_Total_Assets.zip');
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
      const devices: ('iPhone' | 'iPad')[] = ['iPhone', 'iPad'];
      for (const device of devices) {
        config.setActiveDeviceType(device);
        setProcessingMessage(config.t('processing.capturing', { device }));
        await new Promise(resolve => setTimeout(resolve, 800));
        const deviceDir = device === 'iPad' ? 'iPad_13' : 'iPhone_6.9';
        await captureCurrentScreens(zip, device, deviceDir);
      }
      config.setActiveDeviceType(originalDeviceType);
      await triggerDownload(zip, `AppStore_Devices_${config.activeLocalizationId}.zip`);
    } catch (err) {
      console.error('[Export] Error:', err);
      alert('Export failed.');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  // --- Export Mode Configuration ---

  const EXPORT_MODES = {
    selected: {
      title: `${t('export.menu.item.selected')} (${config.activeLocalizationId})`,
      icon: <Download size={14} />,
      mainIcon: <Download size={18} />,
      handler: handleExportSelected,
      isEnabled: config.projectHasScreens
    },
    locales: {
      title: t('export.menu.item.all'),
      icon: <Layers size={14} />,
      mainIcon: <Layers size={18} />,
      handler: handleExportAll,
      isEnabled: config.projectHasScreens
    },
    devices: {
      title: `${t('export.menu.item.selected')} (${config.activeLocalizationId})`,
      icon: <Smartphone size={14} />,
      mainIcon: <Smartphone size={18} />,
      handler: handleExportDevices,
      isEnabled: config.projectHasScreens
    },
    full: {
      title: t('export.menu.full.title'),
      icon: <Zap size={14} />,
      mainIcon: <Zap size={18} />,
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

  const DEVICES = [
    { type: 'iPhone' as const, label: 'iPhone', Icon: Smartphone },
    { type: 'iPad' as const, label: 'iPad', Icon: Tablet },
  ];

  return (
    <div className="sidebar sidebar-left">
      <div className="sidebar-header" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
            <Layers size={28} color="white" />
          </div>
          <button
            onClick={config.toggleTheme}
            style={{
              marginLeft: 'auto',
              padding: '8px',
              background: 'var(--card-bg)',
              border: '1px solid var(--panel-border)',
              borderRadius: '8px',
              color: config.theme === 'dark' ? '#fbbf24' : '#64748b',
              cursor: 'pointer'
            }}
          >
            {config.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        <h1 className="branding-title">{t('app.title')}</h1>
        <p className="branding-subtitle">{t('app.subtitle')}</p>
      </div>

      <div className="sidebar-content">
        <div className="panel-group">

          {/* ── Level 1: Device Type ── */}
          <h3>{t('device.section')}</h3>
          <div style={{ display: 'flex', background: 'var(--input-bg)', padding: '4px', borderRadius: '10px', gap: '4px', marginBottom: '8px' }}>
            {DEVICES.map(({ type, Icon }) => {
              const isActive = config.activeDeviceType === type;
              return (
                <button
                  key={type}
                  onClick={() => config.setActiveDeviceType(type)}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    border: 'none',
                    background: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-muted)',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 2px 8px var(--accent-glow)' : 'none',
                  }}
                >
                  <Icon size={14} />
                  {t(`device.${type.toLowerCase()}`)}
                </button>
              );
            })}
          </div>

          {/* ── Divider ── */}
          <hr style={{ border: 'none', borderTop: '1px solid var(--panel-border)', margin: '4px -16px 12px' }} />

          {/* ── Level 2: Language ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1.2px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
              {t('language.section')}
            </span>
            <div style={{ position: 'relative' }}>
              <select
                onChange={(e) => {
                  const preset = LOCALIZATION_PRESETS.find(p => p.id === e.target.value);
                  if (preset) handleAddLocalization(preset);
                  e.target.value = '';
                }}
                disabled={isProcessing}
                value=""
                style={{
                  position: 'absolute',
                  opacity: 0,
                  width: '28px',
                  height: '28px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  zIndex: 2
                }}
              >
                <option value="" disabled>+</option>
                {LOCALIZATION_PRESETS.filter(p => !config.localizations.some(l => l.id === p.id)).map(p => (
                  <option key={p.id} value={p.id}>{p.flag} {p.name}</option>
                ))}
              </select>
              <button className="secondary-btn" style={{ width: '28px', height: '28px', padding: 0, borderRadius: '8px' }}>
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="loc-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {config.localizations.map(loc => {
              const isActive = config.activeLocalizationId === loc.id;
              return (
                <div
                  key={loc.id}
                  onClick={() => !isProcessing && config.setActiveLocalizationId(loc.id)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: isActive ? 'var(--accent)' : 'var(--card-bg)',
                    color: isActive ? 'white' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid var(--panel-border)',
                    opacity: isProcessing && !isActive ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>{loc.flag}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{loc.name}</span>
                  </div>
                  {loc.id !== 'en-US' && !isProcessing && (
                    <button
                      onClick={(e) => { e.stopPropagation(); config.removeLocalization(loc.id); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px',
                        color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      <div className="sidebar-footer">
        {processingMessage && (
          <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700, textAlign: 'center', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {processingMessage}
          </div>
        )}

        <div className="export-container" ref={menuRef}>
          {showExportMenu && !isProcessing && (
            <div className="export-dropdown">
              {/* --- Group: Selected Device --- */}
              <div className="dropdown-section">
                <div className="section-header">{t('export.menu.group.selected', { device: config.activeDeviceType })}</div>

                <div className={`dropdown-item ${exportMode === 'selected' ? 'active' : ''}`} onClick={() => { setExportMode('selected'); setShowExportMenu(false); }}>
                  <div className="item-icon">{exportMode === 'selected' ? <Check size={14} /> : <Download size={14} />}</div>
                  <div className="item-text single-line">
                    <span className="item-title">{EXPORT_MODES.selected.title}</span>
                  </div>
                </div>

                <div className={`dropdown-item ${exportMode === 'locales' ? 'active' : ''}`} onClick={() => { setExportMode('locales'); setShowExportMenu(false); }}>
                  <div className="item-icon">{exportMode === 'locales' ? <Check size={14} /> : <Layers size={14} />}</div>
                  <div className="item-text single-line">
                    <span className="item-title">{EXPORT_MODES.locales.title}</span>
                  </div>
                </div>
              </div>

              <div className="dropdown-divider" />

              {/* --- Group: All Devices --- */}
              <div className="dropdown-section">
                <div className="section-header">{t('export.menu.group.all')}</div>

                <div className={`dropdown-item ${exportMode === 'devices' ? 'active' : ''}`} onClick={() => { setExportMode('devices'); setShowExportMenu(false); }}>
                  <div className="item-icon">{exportMode === 'devices' ? <Check size={14} /> : <Download size={14} />}</div>
                  <div className="item-text single-line">
                    <span className="item-title">{EXPORT_MODES.devices.title}</span>
                  </div>
                </div>

                <div className={`dropdown-item primary-item ${exportMode === 'full' ? 'active' : ''}`} onClick={() => { setExportMode('full'); setShowExportMenu(false); }}>
                  <div className="item-icon">{exportMode === 'full' ? <Check size={14} /> : <Zap size={14} />}</div>
                  <div className="item-text single-line">
                    <span className="item-title">{EXPORT_MODES.full.title}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="export-split-button">
            <button
              className="primary main-action"
              onClick={handleMainExport}
              disabled={isProcessing || !currentMode.isEnabled}
            >
              {isProcessing ? (
                <span style={{ fontSize: '11px' }}>{t('processing.title')}...</span>
              ) : (
                <>{currentMode.mainIcon} {currentMode.title}</>
              )}
            </button>
            <button
              className="primary toggle-action"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isProcessing}
            >
              <ChevronDown size={20} style={{ transform: showExportMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
