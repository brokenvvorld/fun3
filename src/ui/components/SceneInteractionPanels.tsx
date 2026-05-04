import type { InkChoiceView } from '../../game/narrative/inkRuntime'

type SceneObjectPanelProps = {
  choices: InkChoiceView[]
  activeTargetId?: string
  onOpenTarget: (targetId: string) => void
}

type InvestigationWindowProps = {
  targetId?: string
  choices: InkChoiceView[]
  onChoose: (choiceId: string) => void
  onClose: () => void
}

type InvestigationFeedbackPopoverProps = {
  feedback: string[]
  onDismiss: () => void
}

type NextStepPanelProps = {
  choices: InkChoiceView[]
  emptyText?: string
  onChoose: (choiceId: string) => void
}

const GROUP_LABELS: Record<InkChoiceView['group'], string> = {
  person: '人物',
  machine: '设备',
  document: '文件',
  place: '地点',
  procedure: '手续',
  decision: '推进',
}

export function SceneObjectPanel({ choices, activeTargetId, onOpenTarget }: SceneObjectPanelProps) {
  const targets = Array.from(
    choices
      .reduce((targetMap, choice) => {
        const existing = targetMap.get(choice.targetId)
        targetMap.set(choice.targetId, {
          id: choice.targetId,
          label: existing?.label ?? choice.targetLabel,
          group: existing?.group ?? choice.group,
          count: (existing?.count ?? 0) + 1,
        })
        return targetMap
      }, new Map<string, { id: string; label: string; group: InkChoiceView['group']; count: number }>())
      .values(),
  )

  if (targets.length === 0) return null

  return (
    <section className="scene-object-panel" aria-label="场景对象">
      <header className="choice-list__header">
        <span>现场物件</span>
        <small>{targets.length} 项</small>
      </header>
      <div className="scene-object-grid">
        {targets.map((target) => (
          <button
            key={target.id}
            type="button"
            data-active={target.id === activeTargetId}
            onClick={() => onOpenTarget(target.id)}
          >
            <span>{target.label}</span>
            <small>
              {GROUP_LABELS[target.group]} / {target.count}
            </small>
          </button>
        ))}
      </div>
    </section>
  )
}

export function InvestigationWindow({
  targetId,
  choices,
  onChoose,
  onClose,
}: InvestigationWindowProps) {
  if (!targetId) return null

  const targetLabel = choices[0]?.targetLabel ?? '调查记录'

  return (
    <aside className="investigation-window" aria-label={`${targetLabel}调查窗口`}>
      <header className="investigation-window__header">
        <div>
          <p className="eyebrow">现场调查</p>
          <h2>{targetLabel}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="关闭调查窗口">
          关闭
        </button>
      </header>
      <div className="investigation-window__actions">
        {choices.length > 0 ? (
          choices.map((choice) => (
            <button key={choice.id} type="button" onClick={() => onChoose(choice.id)}>
              {choice.label}
            </button>
          ))
        ) : (
          <p>这个对象暂时没有新的可调查动作。</p>
        )}
      </div>
    </aside>
  )
}

export function InvestigationFeedbackPopover({ feedback, onDismiss }: InvestigationFeedbackPopoverProps) {
  if (feedback.length === 0) return null

  return (
    <div className="investigation-feedback-layer" onClick={onDismiss}>
      <aside
        className="investigation-feedback-popover"
        aria-label="调查结果"
        aria-live="polite"
        onClick={(event) => event.stopPropagation()}
      >
        {feedback.map((paragraph, index) => (
          <p key={`${index}-${paragraph}`}>{paragraph}</p>
        ))}
      </aside>
    </div>
  )
}

export function NextStepPanel({ choices, emptyText = '第一章现场记录已归档。', onChoose }: NextStepPanelProps) {
  return (
    <section className="choice-list choice-list--action-docket" aria-label="下一步">
      <header className="choice-list__header">
        <span>关键行动</span>
        <small>{choices.length > 0 ? `${choices.length} 项` : '归档'}</small>
      </header>
      {choices.length === 0 ? <p className="choice-list__empty">{emptyText}</p> : null}
      {choices.map((choice, index) => (
        <button key={choice.id} type="button" data-kind={choice.kind} onClick={() => onChoose(choice.id)}>
          <span>{choice.label}</span>
          <i aria-hidden="true">
            <b>续</b>
            {String(index + 1).padStart(2, '0')}
          </i>
        </button>
      ))}
    </section>
  )
}
