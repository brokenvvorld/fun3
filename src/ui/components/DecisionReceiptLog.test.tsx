import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DecisionReceiptLog } from './DecisionReceiptLog'

describe('DecisionReceiptLog', () => {
  afterEach(() => {
    cleanup()
  })

  it('keeps receipt details collapsed until the player opens them', () => {
    render(
      <DecisionReceiptLog
        receipts={[
          {
            id: 'receipt-1',
            title: '手续回执',
            summary: '排水井回执已确认，地下路线线索开启',
          },
        ]}
      />,
    )

    const log = screen.getByRole('region', { name: '现场记录' })
    expect(within(log).getByRole('button', { name: /现场记录/ })).toHaveAttribute('aria-expanded', 'false')
    expect(within(log).getByText('1 条')).toBeInTheDocument()
    expect(within(log).queryByText('排水井回执已确认，地下路线线索开启')).not.toBeInTheDocument()

    fireEvent.click(within(log).getByRole('button', { name: /现场记录/ }))

    expect(within(log).getByRole('button', { name: /现场记录/ })).toHaveAttribute('aria-expanded', 'true')
    expect(within(log).getByRole('heading', { name: '手续回执' })).toBeInTheDocument()
    expect(within(log).getByText('排水井回执已确认，地下路线线索开启')).toBeInTheDocument()
  })

  it('shows the empty state only after opening the log', () => {
    render(<DecisionReceiptLog receipts={[]} />)

    const log = screen.getByRole('region', { name: '现场记录' })
    expect(within(log).getByText('无记录')).toBeInTheDocument()
    expect(within(log).queryByText('还没有留下现场记录。')).not.toBeInTheDocument()

    fireEvent.click(within(log).getByRole('button', { name: /现场记录/ }))

    expect(within(log).getByText('还没有留下现场记录。')).toBeInTheDocument()
  })
})
