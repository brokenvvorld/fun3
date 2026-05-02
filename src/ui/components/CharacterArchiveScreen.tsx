export type CharacterArchiveEntry = {
  id: string
  name: string
  role: string
  status?: string
  note?: string
}

export type CharacterArchiveScreenProps = {
  title?: string
  characters: CharacterArchiveEntry[]
  selectedId?: string
  onSelect?: (characterId: string) => void
}

export function CharacterArchiveScreen({
  title = '人物档案',
  characters,
  selectedId,
  onSelect,
}: CharacterArchiveScreenProps) {
  return (
    <section className="character-archive-screen" aria-label="人物档案">
      <header className="panel-header">
        <div>
          <p className="eyebrow">同行者</p>
          <h1>{title}</h1>
        </div>
      </header>

      <div className="intel-grid">
        {characters.map((character) => {
          const selected = character.id === selectedId
          return (
            <article key={character.id} aria-current={selected ? 'true' : undefined}>
              <h2>{character.name}</h2>
              <p>{character.role}</p>
              {character.status ? <p>{character.status}</p> : null}
              {character.note ? <p>{character.note}</p> : null}
              {onSelect ? (
                <button type="button" onClick={() => onSelect(character.id)}>
                  查看
                </button>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}
