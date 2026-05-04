import type { CodexDiscoveryStatus, WorldCodexViewEntry } from '../../game/content/types'

export type WorldCodexScreenProps = {
  title?: string
  entries: WorldCodexViewEntry[]
  activeCategory?: string
  onSelectCategory?: (category?: string) => void
}

export function WorldCodexScreen({
  title = '世界手记',
  entries,
  activeCategory,
  onSelectCategory,
}: WorldCodexScreenProps) {
  const categories = Array.from(new Set(entries.map((entry) => entry.category)))
  const visibleEntries = activeCategory ? entries.filter((entry) => entry.category === activeCategory) : entries

  return (
    <section className="world-codex-screen" aria-label="世界手记">
      <header className="panel-header">
        <div>
          <p className="eyebrow">已知线索</p>
          <h1>{title}</h1>
        </div>
      </header>

      {categories.length > 0 ? (
        <nav className="status-strip" aria-label="条目分类">
          <button type="button" aria-pressed={activeCategory === undefined} onClick={() => onSelectCategory?.()}>
            全部
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={category === activeCategory}
              onClick={() => onSelectCategory?.(category)}
            >
              {category}
            </button>
          ))}
        </nav>
      ) : null}

      <div className="story-copy">
        {visibleEntries.map((entry) => {
          const isLocked = entry.discoveryStatus === 'undiscovered'

          return (
            <article key={entry.id} className={isLocked ? 'codex-entry codex-entry--locked' : 'codex-entry'}>
              <p className="location">{entry.category}</p>
              <div className="codex-title-row">
                <h2>{entry.title}</h2>
                <span className="codex-discovery-badge">{DISCOVERY_STATUS_LABELS[entry.discoveryStatus]}</span>
              </div>
              {isLocked ? <LockedCodexEntry entry={entry} /> : <OpenCodexEntry entry={entry} />}
            </article>
          )
        })}
      </div>
    </section>
  )
}

const DISCOVERY_STATUS_LABELS: Record<CodexDiscoveryStatus, string> = {
  available: '公开',
  undiscovered: '未发现',
  discovered: '已发现',
  handled: '已处置',
}

function LockedCodexEntry({ entry }: { entry: WorldCodexViewEntry }) {
  return (
    <section className="codex-summary">
      <h3>待核验摘要</h3>
      <p>{entry.preview}</p>
      <p>取得对应现场回执后，完整档案将开放查阅。</p>
    </section>
  )
}

function OpenCodexEntry({ entry }: { entry: WorldCodexViewEntry }) {
  const consequence = entry.discoveryStatus === 'handled' && entry.resolvedOutcome ? entry.resolvedOutcome.consequence : entry.consequence
  const echo = entry.discoveryStatus === 'handled' && entry.resolvedOutcome ? entry.resolvedOutcome.echo : entry.echo
  const isDiscoveredOnly = entry.discoveryStatus === 'discovered'

  return (
    <>
      <dl className="codex-meta">
        <div>
          <dt>档案状态</dt>
          <dd>{entry.dossierStatus}</dd>
        </div>
        <div>
          <dt>涉事条线</dt>
          <dd>{entry.civicLine}</dd>
        </div>
        <div>
          <dt>处置口径</dt>
          <dd>{entry.handlingProtocol}</dd>
        </div>
        <div>
          <dt>形态标签</dt>
          <dd>{entry.formTags.join(' / ')}</dd>
        </div>
      </dl>
      <section className="codex-summary">
        <h3>摘要</h3>
        <p>{entry.body}</p>
      </section>
      {entry.discoveryStatus === 'handled' && entry.resolvedOutcome ? (
        <section className="codex-outcome">
          <h3>处置结果</h3>
          <p>{entry.resolvedOutcome.title}</p>
        </section>
      ) : null}
      <div className="codex-detail-grid">
        <section>
          <h3>触发条件</h3>
          <p>{entry.trigger}</p>
        </section>
        <section>
          <h3>处置建议</h3>
          <p>{entry.handling}</p>
        </section>
        {isDiscoveredOnly ? (
          <section>
            <h3>处置记录</h3>
            <p>尚未形成现场回执。完成处置后，结果记录将开放查阅。</p>
          </section>
        ) : (
          <>
            <section>
              <h3>已知后果</h3>
              <p>{consequence}</p>
            </section>
            <section>
              <h3>后续回响</h3>
              <p>{echo}</p>
            </section>
          </>
        )}
      </div>
    </>
  )
}
