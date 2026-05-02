export type ChoiceItem = {
  id: string
  label: string
  detail?: string
  disabled?: boolean
  kind?: 'advance' | 'inspect'
}

export type ChoiceListProps = {
  choices: ChoiceItem[]
  feedback?: string[]
  emptyText?: string
  onChoose: (choiceId: string) => void
}

export function ChoiceList({ choices, feedback = [], emptyText = '暂时没有可执行的选择。', onChoose }: ChoiceListProps) {
  if (choices.length === 0) {
    return (
      <section className="choice-list choice-list--action-docket" aria-label="可选行动">
        <header className="choice-list__header">
          <span>下一步</span>
          <small>待执行回执</small>
        </header>
        <p className="choice-list__empty">{emptyText}</p>
      </section>
    )
  }

  return (
    <section className="choice-list choice-list--action-docket" aria-label="可选行动">
      <header className="choice-list__header">
        <span>下一步</span>
        <small>待执行回执</small>
      </header>
      {feedback.length > 0 ? (
        <div className="choice-list__feedback" aria-live="polite">
          {feedback.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}
      {choices.map((choice, index) => (
        <button
          key={choice.id}
          type="button"
          data-kind={choice.kind ?? 'advance'}
          disabled={choice.disabled}
          onClick={() => onChoose(choice.id)}
        >
          <span>{choice.label}</span>
          {choice.detail ? <small>{choice.detail}</small> : null}
          <i aria-hidden="true">
            <b>{choice.kind === 'inspect' ? '查' : '续'}</b>
            {String(index + 1).padStart(2, '0')}
          </i>
        </button>
      ))}
    </section>
  )
}
