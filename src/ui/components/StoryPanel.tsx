export type StoryPanelProps = {
  title: string
  location?: string
  paragraphs: string[]
  aside?: string
  canContinue?: boolean
  onContinue?: () => void
}

export function StoryPanel({ title, location, paragraphs, aside, canContinue = false, onContinue }: StoryPanelProps) {
  return (
    <section
      className="story-panel story-panel--reading"
      aria-label="当前故事"
      data-can-continue={canContinue}
      onClick={canContinue ? onContinue : undefined}
    >
      <header className="panel-header">
        <div>
          {location ? <p className="location">{location}</p> : null}
          <h1>{title}</h1>
        </div>
      </header>

      <div className="story-copy">
        {paragraphs.map((paragraph, index) => (
          <p key={`${index}-${paragraph}`}>{paragraph}</p>
        ))}
      </div>

      {aside ? <p className="location">{aside}</p> : null}
      {canContinue ? (
        <button
          className="reading-continue"
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onContinue?.()
          }}
        >
          继续阅读
        </button>
      ) : null}
    </section>
  )
}
