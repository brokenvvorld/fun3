export type StoryPanelProps = {
  title: string
  location?: string
  timeLabel?: string
  paragraphs: string[]
  aside?: string
}

export function StoryPanel({ title, location, timeLabel, paragraphs, aside }: StoryPanelProps) {
  return (
    <section className="story-panel" aria-label="当前故事">
      <header className="panel-header">
        <div>
          {location ? <p className="location">{location}</p> : null}
          <h1>{title}</h1>
        </div>
        {timeLabel ? <p className="eyebrow">{timeLabel}</p> : null}
      </header>

      <div className="story-copy">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {aside ? <p className="location">{aside}</p> : null}
    </section>
  )
}
