import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StoryPanel } from './StoryPanel'

describe('StoryPanel', () => {
  it('renders story location and paragraphs without a time slot', () => {
    render(
      <StoryPanel
        title="第一章：补办窗口不会等人"
        location="临时避难点一号窗口"
        paragraphs={['你只是来补办通行条。', '窗口把流程推到你面前。']}
        aside="手续仍在运行。"
      />,
    )

    expect(screen.getByRole('region', { name: '当前故事' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '第一章：补办窗口不会等人' })).toBeInTheDocument()
    expect(screen.getByText('临时避难点一号窗口')).toBeInTheDocument()
    expect(screen.getByText('你只是来补办通行条。')).toBeInTheDocument()
    expect(screen.getByText('窗口把流程推到你面前。')).toBeInTheDocument()
    expect(screen.queryByText(/08:|第 1 天|时间/)).not.toBeInTheDocument()
  })
})
