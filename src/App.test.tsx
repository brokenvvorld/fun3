import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import type { InkStoryView } from './game/narrative/inkRuntime'
import { initialWorldState } from './game/simulation/state'
import { useGameStore } from './ui/store/gameStore'
import { clearSaveGame } from './ui/store/saveGame'

vi.mock('./ui/components/PhaserStage', () => ({
  PhaserStage: () => <div data-testid="phaser-stage" />,
}))

const storyView: InkStoryView = {
  title: '测试窗口',
  location: '测试大厅',
  paragraphs: ['窗口正在等待下一份材料。'],
  choices: [
    {
      id: '0',
      index: 0,
      label: '递交推进材料',
      kind: 'advance',
      group: 'decision',
      targetId: 'procedure',
      targetLabel: '手续',
      mode: 'advance',
      surface: 'next_step',
      repeatable: false,
    },
  ],
  notices: [],
  receipts: [],
  tags: [],
  isComplete: false,
}

describe('App game screen', () => {
  beforeEach(() => {
    clearSaveGame()
    useGameStore.setState({
      screen: 'playing',
      world: initialWorldState,
      storyView,
      storyStateJson: '{"state":true}',
      investigationFeedback: {},
      activeInvestigationTargetId: undefined,
      procedureLog: [
        {
          id: 'receipt-1',
          title: '手续回执',
          summary: '推进回执应入账',
        },
      ],
      debugVisible: false,
      hasSave: true,
      loading: false,
      error: undefined,
      settings: {
        musicEnabled: false,
        soundEnabled: true,
        captionsEnabled: true,
      },
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders the stored procedure receipt log in the playing screen', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: '测试窗口' })).toBeInTheDocument()
    const log = screen.getByRole('region', { name: '现场记录' })

    expect(within(log).getByText('1 条')).toBeInTheDocument()
    expect(within(log).queryByText('推进回执应入账')).not.toBeInTheDocument()

    fireEvent.click(within(log).getByRole('button', { name: /现场记录/ }))

    expect(within(log).getByRole('heading', { name: '手续回执' })).toBeInTheDocument()
    expect(within(log).getByText('推进回执应入账')).toBeInTheDocument()
  })
})
