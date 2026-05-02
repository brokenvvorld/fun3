export type MainMenuAction = {
  id: string
  label: string
  description?: string
  disabled?: boolean
}

export type MainMenuScreenProps = {
  title: string
  subtitle?: string
  actions: MainMenuAction[]
  footerText?: string
  onSelect: (actionId: string) => void
}

export function MainMenuScreen({ title, subtitle, actions, footerText, onSelect }: MainMenuScreenProps) {
  return (
    <section className="main-menu-screen" aria-label="游戏主菜单">
      <header className="panel-header">
        <div>
          <p className="eyebrow">避难所入口</p>
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </header>

      <nav className="choice-list" aria-label="菜单选项">
        {actions.map((action) => (
          <button key={action.id} type="button" disabled={action.disabled} onClick={() => onSelect(action.id)}>
            <span>{action.label}</span>
            {action.description ? <small>{action.description}</small> : null}
          </button>
        ))}
      </nav>

      {footerText ? <p className="location">{footerText}</p> : null}
    </section>
  )
}
