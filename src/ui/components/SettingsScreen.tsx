export type SettingsScreenProps = {
  musicEnabled: boolean
  soundEnabled: boolean
  captionsEnabled: boolean
  textSpeedLabel: string
  onToggleMusic: () => void
  onToggleSound: () => void
  onToggleCaptions: () => void
  onChangeTextSpeed?: (direction: 'slower' | 'faster') => void
}

export function SettingsScreen({
  musicEnabled,
  soundEnabled,
  captionsEnabled,
  textSpeedLabel,
  onToggleMusic,
  onToggleSound,
  onToggleCaptions,
  onChangeTextSpeed,
}: SettingsScreenProps) {
  return (
    <section className="settings-screen" aria-label="设置">
      <header className="panel-header">
        <div>
          <p className="eyebrow">暂停</p>
          <h1>设置</h1>
        </div>
      </header>

      <div className="choice-list">
        <button type="button" aria-pressed={musicEnabled} onClick={onToggleMusic}>
          <span>音乐</span>
          <small>{musicEnabled ? '开启' : '关闭'}</small>
        </button>
        <button type="button" aria-pressed={soundEnabled} onClick={onToggleSound}>
          <span>音效</span>
          <small>{soundEnabled ? '开启' : '关闭'}</small>
        </button>
        <button type="button" aria-pressed={captionsEnabled} onClick={onToggleCaptions}>
          <span>字幕</span>
          <small>{captionsEnabled ? '开启' : '关闭'}</small>
        </button>
      </div>

      <section className="status-strip" aria-label="文本速度">
        <button type="button" disabled={!onChangeTextSpeed} onClick={() => onChangeTextSpeed?.('slower')}>
          慢一点
        </button>
        <span>{textSpeedLabel}</span>
        <button type="button" disabled={!onChangeTextSpeed} onClick={() => onChangeTextSpeed?.('faster')}>
          快一点
        </button>
      </section>
    </section>
  )
}
