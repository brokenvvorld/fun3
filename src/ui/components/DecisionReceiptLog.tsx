import { useState } from 'react'

export type ProcedureLogEntry = {
  id: string
  title: string
  summary: string
}

export type DecisionReceiptLogProps = {
  receipts: ProcedureLogEntry[]
  emptyText?: string
}

export function DecisionReceiptLog({ receipts, emptyText = '还没有留下现场记录。' }: DecisionReceiptLogProps) {
  const [expanded, setExpanded] = useState(false)
  const countLabel = receipts.length > 0 ? `${receipts.length} 条` : '无记录'
  const latestReceipt = receipts[0]

  return (
    <section className="event-log" aria-label="现场记录" data-expanded={expanded}>
      <button
        className="event-log__toggle"
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        <span>现场记录</span>
        <small>{expanded ? '收起' : countLabel}</small>
      </button>
      {!expanded && latestReceipt ? (
        <p className="event-log__latest" aria-label="最近现场记录">
          {latestReceipt.summary}
        </p>
      ) : null}
      {expanded ? (
        <div className="event-log__body">
          {receipts.length === 0 ? (
            <p>{emptyText}</p>
          ) : (
            receipts.map((receipt, index) => (
              <article key={`${receipt.id}-${index}`}>
                <header>
                  <h3>{receipt.title}</h3>
                </header>
                <p>{receipt.summary}</p>
              </article>
            ))
          )}
        </div>
      ) : null}
    </section>
  )
}
