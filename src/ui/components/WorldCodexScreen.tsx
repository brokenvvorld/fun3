export type WorldCodexEntry = {
  id: string
  title: string
  category: string
  body: string
}

export type WorldCodexScreenProps = {
  title?: string
  entries: WorldCodexEntry[]
  activeCategory?: string
  onSelectCategory?: (category: string) => void
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
        {visibleEntries.map((entry) => (
          <article key={entry.id}>
            <p className="location">{entry.category}</p>
            <h2>{entry.title}</h2>
            <p>{entry.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
