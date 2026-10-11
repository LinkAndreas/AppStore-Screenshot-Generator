import React from 'react';
import { MousePointerClick, Palette, Smartphone, Type, Copy, Check } from 'lucide-react';
import { checkScreenshot } from '../utils/imageValidation';
import { useConfig } from '../store/ConfigContext';
import { TextPanel } from './inspector/TextPanel';
import { BackgroundPanel } from './inspector/BackgroundPanel';
import { DevicePanel } from './inspector/DevicePanel';

export const RightSidebar = () => {
  const {
    screens,
    selectedScreenId,
    updateScreen,
    rightSidebarTab,
    setRightSidebarTab,
    applyStyleToAll,
    mobileSheetHeight,
    setMobileSheetHeight,
    setAppError,
    activeDeviceType,
    t
  } = useConfig();

  const [isDragging, setIsDragging] = React.useState(false);
  const [dragHeight, setDragHeight] = React.useState(mobileSheetHeight);

  // Constants for snap points
  const SNAP_POINTS = [25, 50, 75];

  const calculateHeightPct = (clientY: number) => {
    const newHeightPct = ((window.innerHeight - clientY) / window.innerHeight) * 100;
    return Math.max(10, Math.min(95, newHeightPct));
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;
    setDragHeight(calculateHeightPct(clientY));
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const closest = SNAP_POINTS.reduce((prev, curr) =>
      Math.abs(curr - dragHeight) < Math.abs(prev - dragHeight) ? curr : prev
    );

    setMobileSheetHeight(closest);
    setDragHeight(closest);
  };

  // Touch handlers
  const handleTouchStart = () => handleDragStart();
  const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientY);
  const handleTouchEnd = () => handleDragEnd();

  // Mouse handlers via window listeners for smooth drag-out
  React.useEffect(() => {
    if (!isDragging) {
      document.body.style.userSelect = '';
      return;
    }

    // Prevent text selection globally while dragging
    document.body.style.userSelect = 'none';

    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientY);
    const onMouseUp = () => handleDragEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragHeight]);

  const selectedScreen = screens.find(s => s.id === selectedScreenId);
  const [appliedCount, setAppliedCount] = React.useState<number | null>(null);

  // Clear the "applied" confirmation after a moment or when another screen is selected.
  React.useEffect(() => {
    if (appliedCount === null) return;
    const id = window.setTimeout(() => setAppliedCount(null), 2500);
    return () => window.clearTimeout(id);
  }, [appliedCount]);
  React.useEffect(() => setAppliedCount(null), [selectedScreenId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedScreen) {
      const problem = await checkScreenshot(file, activeDeviceType);
      if (problem) setAppError(t('error.dimension', problem));
      else updateScreen(selectedScreen.id, { imageObjUrl: URL.createObjectURL(file) });
    }
    e.target.value = '';
  };

  const TABS = [
    { id: 'content' as const, label: t('tabs.content'), Icon: Type },
    { id: 'style' as const, label: t('tabs.style'), Icon: Palette },
    { id: 'layout' as const, label: t('tabs.layout'), Icon: Smartphone },
  ];

  return (
    <div
      className={`sidebar sidebar-right ${isDragging ? 'dragging' : ''}`}
      style={{
        '--sheet-height': isDragging ? `${dragHeight}dvh` : undefined,
        transition: isDragging ? 'none' : undefined,
        display: 'flex',
        flexDirection: 'column'
      } as React.CSSProperties}
    >
      {/* Mobile drag handle */}
      <div
        className="mobile-drag-handle"
        onMouseDown={handleDragStart}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        <span />
      </div>

      {!selectedScreen ? (
        <div className="empty-state" style={{ flex: 1, justifyContent: 'center', padding: '40px 28px' }}>
          <div className="empty-icon" style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--fill)', color: 'var(--text-muted)', boxShadow: 'none' }}>
            <MousePointerClick size={26} strokeWidth={1.75} />
          </div>
          <h2 style={{ fontSize: '17px', fontWeight: 600 }}>{t('sidebar.selectScreen')}</h2>
          <p style={{ fontSize: '13px', margin: 0 }}>{t('sidebar.selectDesc')}</p>
        </div>
      ) : (
        <>
          <div className="tabs segmented" role="tablist">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={rightSidebarTab === id}
                className={rightSidebarTab === id ? 'active' : ''}
                onClick={() => setRightSidebarTab(id)}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          <div className="sidebar-content">
            {rightSidebarTab === 'content' && (
              <TextPanel screen={selectedScreen} device={activeDeviceType} update={u => updateScreen(selectedScreen.id, u)} t={t} />
            )}
            {rightSidebarTab === 'style' && (
              <BackgroundPanel screen={selectedScreen} update={u => updateScreen(selectedScreen.id, u)} t={t} />
            )}
            {rightSidebarTab === 'layout' && (
              <DevicePanel screen={selectedScreen} device={activeDeviceType} update={u => updateScreen(selectedScreen.id, u)} onUpload={handleImageUpload} t={t} />
            )}
          </div>

          <div className="inspector-footer">
            <button
              className="secondary-btn"
              onClick={() => setAppliedCount(applyStyleToAll(selectedScreen.id))}
              title={t('apply.hint')}
            >
              {appliedCount !== null
                ? <><Check size={15} /> {t('apply.done', { n: String(appliedCount) })}</>
                : <><Copy size={14} /> {t('apply.all')}</>}
            </button>
            <p className="hint" style={{ textAlign: 'center' }}>{t('apply.hint')}</p>
          </div>
        </>
      )}
    </div>
  );
};
