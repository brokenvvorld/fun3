export type StoryPanelProps = {
  title: string
  location?: string
  paragraphs: string[]
  aside?: string
}

export function StoryPanel({ title, location, paragraphs, aside }: StoryPanelProps) {
  return (
    <section className="story-panel" aria-label="当前故事">
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
    </section>
  )
}
