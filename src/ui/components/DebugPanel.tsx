export type DebugMetric = {
  id: string
  label: string
  value: string | number | boolean
}

export type DebugAction = {
  id: string
  label: string
  disabled?: boolean
}

export type DebugPanelProps = {
  title?: string
  visible: boolean
  metrics: DebugMetric[]
  actions?: DebugAction[]
  onAction?: (actionId: string) => void
}

export function DebugPanel({ title = '调试面板', visible, metrics, actions = [], onAction }: DebugPanelProps) {
  if (!visible) {
    return null
  }

  return (
    <aside className="debug-panel" aria-label="调试面板">
      <header className="panel-header">
        <div>
          <p className="eyebrow">开发工具</p>
          <h2>{title}</h2>
        </div>
      </header>

      <dl>
        {metrics.map((metric) => (
          <div key={metric.id}>
            <dt>{metric.label}</dt>
            <dd>{String(metric.value)}</dd>
          </div>
        ))}
      </dl>

      {actions.length > 0 ? (
        <div className="choice-list" aria-label="调试操作">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={action.disabled}
              onClick={() => onAction?.(action.id)}
            >
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </aside>
  )
}
