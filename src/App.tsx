import { useEffect, useState } from 'react'
import { CharacterArchiveScreen } from './ui/components/CharacterArchiveScreen'
import { DebugPanel, type DebugMetric } from './ui/components/DebugPanel'
import { DecisionReceiptLog } from './ui/components/DecisionReceiptLog'
import { MainMenuScreen } from './ui/components/MainMenuScreen'
import { PhaserStage } from './ui/components/PhaserStage'
import { InvestigationWindow, NextStepPanel, SceneObjectPanel } from './ui/components/SceneInteractionPanels'
import { SettingsScreen } from './ui/components/SettingsScreen'
import { StoryPanel } from './ui/components/StoryPanel'
import { WorldCodexScreen } from './ui/components/WorldCodexScreen'
import { useGameStore } from './ui/store/gameStore'
import './index.css'

function App() {
  const screen = useGameStore((state) => state.screen)
  const boot = useGameStore((state) => state.boot)

  useEffect(() => {
    boot()
  }, [boot])

  return (
    <main className="game-shell">
      <section className="world-layer" aria-label="临川市九号枢纽区">
        <PhaserStage />
      </section>
      <section className="narrative-panel" aria-label="游戏界面">
        {screen === 'mainMenu' ? <MainMenu /> : null}
        {screen === 'identity' ? <IdentityScreen /> : null}
        {screen === 'playing' ? <GameScreen /> : null}
        {screen === 'archive' ? <ArchiveScreen /> : null}
        {screen === 'codex' ? <CodexScreen /> : null}
        {screen === 'settings' ? <SettingsPanel /> : null}
      </section>
    </main>
  )
}

function MainMenu() {
  const hasSave = useGameStore((state) => state.hasSave)
  const loading = useGameStore((state) => state.loading)
  const error = useGameStore((state) => state.error)
  const startNewGame = useGameStore((state) => state.startNewGame)
  const continueGame = useGameStore((state) => state.continueGame)
  const openScreen = useGameStore((state) => state.openScreen)

  return (
    <>
      <MainMenuScreen
        title="临川：九号枢纽区"
        subtitle="长昼没有结束，窗口仍在叫号。"
        footerText={error ?? (loading ? '正在核验通行记录。' : '大厅广播仍在重复同一张号票。')}
        actions={[
          { id: 'new', label: '新游戏', description: '从第一章补办窗口开始' },
          {
            id: 'continue',
            label: '继续游戏',
            description: hasSave ? '读取本机保存的现场记录' : '未找到可用记录',
            disabled: !hasSave,
          },
          { id: 'archive', label: '角色档案', description: '查看林小满与同行者记录' },
          { id: 'codex', label: '世界图鉴', description: '查看市政背景、异常线索与势力说明' },
          { id: 'settings', label: '设置', description: '音频、字幕和阅读速度' },
        ]}
        onSelect={(actionId) => {
          if (actionId === 'new') void startNewGame()
          if (actionId === 'continue') void continueGame()
          if (actionId === 'archive') openScreen('archive')
          if (actionId === 'codex') openScreen('codex')
          if (actionId === 'settings') openScreen('settings')
        }}
      />
    </>
  )
}

function IdentityScreen() {
  const world = useGameStore((state) => state.world)
  const loading = useGameStore((state) => state.loading)
  const setProtagonistName = useGameStore((state) => state.setProtagonistName)
  const backToMenu = useGameStore((state) => state.backToMenu)
  const [draftName, setDraftName] = useState('')
  const registryPreview = draftName.trim() || '未核验姓名'

  return (
    <section className="story-panel" aria-label="登记姓名">
      <header className="panel-header">
        <div>
          <p className="eyebrow">一号窗口登记</p>
          <h1>补办窗口登记姓名</h1>
        </div>
      </header>
      <div className="story-copy">
        <p>窗口只认登记姓名、补办编号和临时通行条。别的身份在长昼里暂时没有办理入口。</p>
        <p>窗口会记录一个登记姓名；后续档案可能读取、误写或覆盖它。</p>
      </div>
      <form
        className="identity-form"
        onSubmit={(event) => {
          event.preventDefault()
          const formData = new FormData(event.currentTarget)
          setProtagonistName(String(formData.get('displayName') ?? ''))
        }}
      >
        <div className="identity-console">
          <div className="identity-console__header" aria-hidden="true">
            <span className="identity-console__light" />
            <span>LC-IX TEMP REGISTRY</span>
            <span className="identity-console__code">FORM 01-A</span>
          </div>
          <label className="identity-input-field">
            <span className="identity-input-field__label">登记姓名</span>
            <span className="identity-input-frame">
              <span className="identity-input-frame__prefix" aria-hidden="true">
                #
              </span>
              <input
                name="displayName"
                placeholder="不填写则保持未核验"
                value={draftName}
                maxLength={12}
                autoComplete="off"
                spellCheck={false}
                onChange={(event) => setDraftName(event.target.value)}
              />
              <span className="identity-input-frame__scanline" aria-hidden="true" />
            </span>
          </label>
          <div className="identity-registry-preview" aria-live="polite">
            <span>REC</span>
            <strong>{registryPreview}</strong>
            <small>{draftName.trim() ? '待窗口核验' : '将以未核验身份进入'}</small>
          </div>
        </div>
        <div className="footer-actions">
          <button type="submit" disabled={loading}>
            {loading ? '正在核验' : '提交登记并开始'}
          </button>
          <button type="button" onClick={backToMenu}>
            返回主界面
          </button>
        </div>
      </form>
      <p className="location">
        当前状态：{world.protagonist.registryNameStatus} / {world.protagonist.permitStatus}
      </p>
    </section>
  )
}

function GameScreen() {
  const storyView = useGameStore((state) => state.storyView)
  const investigationFeedback = useGameStore((state) => state.investigationFeedback)
  const activeInvestigationTargetId = useGameStore((state) => state.activeInvestigationTargetId)
  const procedureLog = useGameStore((state) => state.procedureLog)
  const world = useGameStore((state) => state.world)
  const debugVisible = useGameStore((state) => state.debugVisible)
  const selectAction = useGameStore((state) => state.selectAction)
  const openInvestigation = useGameStore((state) => state.openInvestigation)
  const closeInvestigation = useGameStore((state) => state.closeInvestigation)
  const openScreen = useGameStore((state) => state.openScreen)
  const backToMenu = useGameStore((state) => state.backToMenu)

  if (!storyView) {
    return (
      <div className="story-copy">
        <p>第一章档案尚未载入。</p>
        <button type="button" onClick={backToMenu}>
          返回主界面
        </button>
      </div>
    )
  }

  const investigationChoices = storyView.choices.filter((choice) => choice.surface !== 'next_step')
  const nextStepChoices = storyView.choices.filter((choice) => choice.surface === 'next_step')
  const activeInvestigationChoices = investigationChoices.filter(
    (choice) => choice.targetId === activeInvestigationTargetId,
  )

  return (
    <section className="game-screen" aria-label="current game">
      <div className="status-strip civic-status" aria-label="手续状态">
        <span>{world.protagonist.displayName}</span>
        <span>{world.protagonist.permitStatus}</span>
        <span>{storyView.location}</span>
        <span>压力 {world.anomalyExposure.global}</span>
      </div>
      <div className="narrative-scroll">
        <StoryPanel title={storyView.title} location={storyView.location} paragraphs={storyView.paragraphs} />
        <DebugPanel visible={debugVisible} metrics={buildDebugMetrics()} />
      </div>
      <SceneObjectPanel
        choices={investigationChoices}
        activeTargetId={activeInvestigationTargetId}
        onOpenTarget={openInvestigation}
      />
      <InvestigationWindow
        targetId={activeInvestigationTargetId}
        choices={activeInvestigationChoices}
        feedback={activeInvestigationTargetId ? (investigationFeedback[activeInvestigationTargetId] ?? []) : []}
        onChoose={selectAction}
        onClose={closeInvestigation}
      />
      <NextStepPanel choices={nextStepChoices} onChoose={selectAction} />
      <DecisionReceiptLog receipts={procedureLog} />
      <nav className="footer-actions" aria-label="界面操作">
        <button type="button" onClick={() => openScreen('archive')}>
          角色档案
        </button>
        <button type="button" onClick={() => openScreen('codex')}>
          世界图鉴
        </button>
        <button type="button" onClick={() => openScreen('settings')}>
          设置
        </button>
      </nav>
    </section>
  )
}

function ArchiveScreen() {
  const world = useGameStore((state) => state.world)
  const openScreen = useGameStore((state) => state.openScreen)
  const lin = world.companions.lin_xiaoman

  return (
    <>
      <CharacterArchiveScreen
        characters={[
          {
            id: world.protagonist.registryNumber,
            name: world.protagonist.displayName,
            role: '临时通行条申请人',
            status: world.protagonist.registryNameStatus,
            note: `${world.protagonist.registryNumber} / ${world.protagonist.permitStatus}`,
          },
          {
            id: lin.id,
            name: lin.name,
            role: '便利店前副店长 / 第一位同伴',
            status: lin.condition,
            note: lin.notes[0],
          },
        ]}
      />
      <BackActions onBack={() => openScreen('mainMenu')} />
    </>
  )
}

function CodexScreen() {
  const openScreen = useGameStore((state) => state.openScreen)

  return (
    <>
      <WorldCodexScreen
        entries={[
          {
            id: 'world-linchuan',
            title: '临川市与九号枢纽区',
            category: '地点',
            body: '长昼之后，通行、配给、排水、广播和登记仍在运行，只是每一道手续都开始反过来处理人。',
          },
          {
            id: 'system-civic-anomaly',
            title: '市政运行异常线索',
            category: '背景线索',
            body: '异常依附在普通市政载体上，故事里的手续、广播、回执和窗口都会把压力推回到具体的人。',
          },
          {
            id: 'faction-municipal-echo',
            title: '市政回声',
            category: '势力',
            body: '旧系统残留的自动工作流仍在派单、纠错和归档，它能提供秩序，也会把人变成流程的附件。',
          },
        ]}
      />
      <BackActions onBack={() => openScreen('mainMenu')} />
    </>
  )
}

function SettingsPanel() {
  const settings = useGameStore((state) => state.settings)
  const toggleSetting = useGameStore((state) => state.toggleSetting)
  const toggleDebugPanel = useGameStore((state) => state.toggleDebugPanel)
  const openScreen = useGameStore((state) => state.openScreen)

  return (
    <>
      <SettingsScreen
        musicEnabled={settings.musicEnabled}
        soundEnabled={settings.soundEnabled}
        captionsEnabled={settings.captionsEnabled}
        textSpeedLabel="标准"
        onToggleMusic={() => toggleSetting('musicEnabled')}
        onToggleSound={() => toggleSetting('soundEnabled')}
        onToggleCaptions={() => toggleSetting('captionsEnabled')}
      />
      <button className="wide-action" type="button" onClick={toggleDebugPanel}>
        切换开发记录面板
      </button>
      <BackActions onBack={() => openScreen('mainMenu')} />
    </>
  )
}

function BackActions({ onBack }: { onBack: () => void }) {
  return (
    <nav className="footer-actions" aria-label="返回">
      <button type="button" onClick={onBack}>
        返回主界面
      </button>
    </nav>
  )
}

function buildDebugMetrics(): DebugMetric[] {
  const state = useGameStore.getState()
  return [
    { id: 'identity', label: '登记姓名', value: state.world.protagonist.displayName },
    { id: 'registry', label: '登记状态', value: state.world.protagonist.registryNameStatus },
    { id: 'exposure', label: '市政异常压力', value: state.world.anomalyExposure.global },
    { id: 'floor', label: '压力下限', value: state.world.anomalyExposure.floor },
    { id: 'flags', label: '临时事实', value: Object.keys(state.world.flags).length },
    { id: 'irreversible', label: '锁定事实', value: Object.keys(state.world.irreversibleFlags).join(', ') || '无' },
    {
      id: 'districts',
      label: '街区状态',
      value: Object.values(state.world.districts)
        .map((district) => `${district.name}:${district.status}`)
        .join(' / '),
    },
    {
      id: 'factions',
      label: '势力关系',
      value: Object.values(state.world.factions)
        .map((faction) => `${faction.name}:${faction.relation}`)
        .join(' / '),
    },
    {
      id: 'lin',
      label: '林小满',
      value: `${state.world.companions.lin_xiaoman.condition} / 信任 ${state.world.companions.lin_xiaoman.trust}`,
    },
    { id: 'story', label: 'Ink 状态', value: state.storyStateJson ? '已保存' : '未保存' },
  ]
}

export default App
