
import { useConfig, type Localization, type DeviceType } from '../store/ConfigContext';
import { SCREEN_DIMENSIONS } from '../constants';
import { LOCALIZATION_PRESETS } from '../translations';
import { Plus, Sun, Moon, Trash2, Download, Layers, Smartphone, Tablet } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';

export const LeftSidebar = () => {
  const config = useConfig();
  const { isProcessing, setIsProcessing, processingMessage, setProcessingMessage, t } = config;

  const handleAddLocalization = (loc: Localization) => {
    config.addLocalization(loc);
  };

  const captureCurrentScreens = async (zip: JSZip, device: DeviceType, folderName?: string) => {
    const sequenceNode = document.getElementById('sequence-container');
    if (!sequenceNode) return;

    const screensElems = Array.from(sequenceNode.querySelectorAll('.app-screen')) as HTMLElement[];
    const { width, height } = SCREEN_DIMENSIONS[device];

    for (let i = 0; i < screensElems.length; i++) {
      const screen = screensElems[i];
      const dataUrl = await toPng(screen, {
        canvasWidth: width,
        canvasHeight: height,
        width: width,
        height: height,
        quality: 1.0,
        pixelRatio: 1, // We set exact width/height, pixelRatio 1 is enough
        style: { transform: 'scale(1)', margin: '0', transformOrigin: 'top left' }
      });
      const base64 = dataUrl.split(',')[1];
      const filename = `screen_${i + 1}.png`;
      if (folderName) {
        zip.file(`${folderName}/${filename}`, base64, { base64: true });
      } else {
        zip.file(filename, base64, { base64: true });
      }

      // Mandatory yield to main thread to breathe the UI/Spinner
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };

  const handleExportSelected = async () => {
    setIsProcessing(true);
    setProcessingMessage(`Capturing ${config.activeDeviceType} (${config.activeLocalizationId})...`);
    // Yield to main thread to ensure overlay renders
    await new Promise(resolve => setTimeout(resolve, 100));

    const zip = new JSZip();
    try {
      await captureCurrentScreens(zip, config.activeDeviceType);
      const content = await zip.generateAsync({ type: 'blob' });
      const deviceName = config.activeDeviceType === 'iPad' ? 'iPad_13' : 'iPhone_6.9';
      saveAs(content, `AppStore_${deviceName}_${config.activeLocalizationId}.zip`);
    } catch (err) {
      console.error('Failed to export:', err);
      alert('Failed to export screens.');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const handleExportAll = async () => {
    setIsProcessing(true);
    const deviceName = config.activeDeviceType === 'iPad' ? 'iPad_13' : 'iPhone_6.9';
    setProcessingMessage(`Preparing ${deviceName} Export...`);
    // Yield to main thread to ensure overlay renders
    await new Promise(resolve => setTimeout(resolve, 150));

    const zip = new JSZip();
    const originalActiveId = config.activeLocalizationId;
    try {
      for (let i = 0; i < config.localizations.length; i++) {
        const loc = config.localizations[i];
        setProcessingMessage(`Capturing ${deviceName} - ${loc.id} (${i + 1}/${config.localizations.length})...`);
        config.setActiveLocalizationId(loc.id);
        await new Promise(resolve => setTimeout(resolve, 500));
        await captureCurrentScreens(zip, config.activeDeviceType, loc.id);
      }
      config.setActiveLocalizationId(originalActiveId);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `AppStore_Bulk_${deviceName}.zip`);
    } catch (err) {
      console.error('Failed to bulk export:', err);
      alert('Failed to bulk export screens.');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const handleExportEverything = async () => {
    setIsProcessing(true);
    setProcessingMessage('Preparing Full Asset Export...');
    // Yield to main thread to ensure overlay renders
    await new Promise(resolve => setTimeout(resolve, 200));

    const zip = new JSZip();
    const originalActiveId = config.activeLocalizationId;
    const originalDeviceType = config.activeDeviceType;

    try {
      const devices: ('iPhone' | 'iPad')[] = ['iPhone', 'iPad'];

      for (const device of devices) {
        config.setActiveDeviceType(device);
        const deviceDir = device === 'iPad' ? 'iPad_13' : 'iPhone_6.9';

        for (let i = 0; i < config.localizations.length; i++) {
          const loc = config.localizations[i];
          setProcessingMessage(`Capturing ${device} - ${loc.id}...`);
          config.setActiveLocalizationId(loc.id);
          // Wait for DOM to adjust to new device/locale
          await new Promise(resolve => setTimeout(resolve, 600));
          await captureCurrentScreens(zip, device, `${deviceDir}/${loc.id}`);
        }
      }

      // Cleanup
      config.setActiveDeviceType(originalDeviceType);
      config.setActiveLocalizationId(originalActiveId);

      setProcessingMessage('Generating ZIP...');
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `AppStore_Total_Assets.zip`);
    } catch (err) {
      console.error('Failed All Device Export:', err);
      alert('Export failed.');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
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

      <div className="sidebar-footer" style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '16px', background: 'transparent' }}>
        {processingMessage && (
          <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700, textAlign: 'center', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {processingMessage}
          </div>
        )}
        <button
          className="secondary-btn"
          onClick={handleExportSelected}
          disabled={isProcessing}
          style={{ width: '100%', marginBottom: '8px', justifyContent: 'center', gap: '8px', height: '36px' }}
        >
          {isProcessing && processingMessage.includes(`(${config.activeLocalizationId})`) ? (
            <span style={{ fontSize: '11px' }}>{t('export.selected', { device: config.activeDeviceType, locale: config.activeLocalizationId }).split(' ')[0]}...</span>
          ) : (
            <><Download size={14} /> {t('export.selected', { device: config.activeDeviceType, locale: config.activeLocalizationId })}</>
          )}
        </button>
        <button
          className="secondary-btn"
          onClick={handleExportAll}
          disabled={isProcessing}
          style={{ width: '100%', marginBottom: '12px', gap: '8px', justifyContent: 'center', height: '36px' }}
        >
          {isProcessing && processingMessage.includes('Locales') ? (
            <span style={{ fontSize: '11px' }}>{t('export.allLocales', { device: config.activeDeviceType }).split(' ')[0]}...</span>
          ) : (
            <><Layers size={14} /> {t('export.allLocales', { device: config.activeDeviceType })}</>
          )}
        </button>
        <button
          className="primary"
          onClick={handleExportEverything}
          disabled={isProcessing}
          style={{ width: '100%', gap: '8px', justifyContent: 'center', height: '42px', boxShadow: '0 4px 15px var(--accent-glow)' }}
        >
          {isProcessing && processingMessage.includes('Capturing') && !processingMessage.includes('Locales') ? (
            <span style={{ fontSize: '11px' }}>{t('export.allAssets').split(' ')[0]}...</span>
          ) : (
            <><Smartphone size={18} /> {t('export.allAssets')}</>
          )}
        </button>
      </div>
    </div>
  );
};
