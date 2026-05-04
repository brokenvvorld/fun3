import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { InkChoiceView } from '../../game/narrative/inkRuntime'
import {
  InvestigationFeedbackPopover,
  InvestigationWindow,
  NextStepPanel,
  SceneObjectPanel,
} from './SceneInteractionPanels'

function choice(overrides: Partial<InkChoiceView>): InkChoiceView {
  return {
    id: '0',
    index: 0,
    label: '调查',
    kind: 'inspect',
    group: 'document',
    targetId: 'document',
    targetLabel: '文件',
    mode: 'inspect',
    surface: 'modal',
    repeatable: true,
    ...overrides,
  }
}

describe('scene interaction panels', () => {
  it('omits the object panel when a scene has no investigation targets', () => {
    const { container } = render(<SceneObjectPanel choices={[]} onOpenTarget={vi.fn()} />)

    expect(within(container).queryByRole('region', { name: '场景对象' })).not.toBeInTheDocument()
    expect(container).toBeEmptyDOMElement()
  })

  it('keeps a stable object label when one target has multiple actions', () => {
    const onOpenTarget = vi.fn()

    render(
      <SceneObjectPanel
        choices={[
          choice({
            id: '0',
            label: '逐项核对维修单抬头',
            targetId: 'fire_door_order',
            targetLabel: '维修单',
          }),
          choice({
            id: '1',
            index: 1,
            label: '把维修单举到灯下',
            targetId: 'fire_door_order',
            targetLabel: '印章水印',
          }),
        ]}
        onOpenTarget={onOpenTarget}
      />,
    )

    const objectPanel = screen.getByRole('region', { name: '场景对象' })
    const objectButton = within(objectPanel).getByRole('button', { name: '维修单文件 / 2' })

    expect(within(objectPanel).queryByRole('button', { name: '印章水印文件 / 2' })).not.toBeInTheDocument()
    fireEvent.click(objectButton)
    expect(onOpenTarget).toHaveBeenCalledWith('fire_door_order')
  })

  it('shows investigation actions inside the floating window', () => {
    const onChoose = vi.fn()
    const onClose = vi.fn()

    render(
      <InvestigationWindow
        targetId="fire_door_order"
        choices={[
          choice({
            id: '0',
            label: '逐项核对维修单抬头',
            targetId: 'fire_door_order',
            targetLabel: '维修单',
          }),
          choice({
            id: '1',
            index: 1,
            label: '翻到维修单背面',
            targetId: 'fire_door_order',
            targetLabel: '责任说明',
          }),
        ]}
        onChoose={onChoose}
        onClose={onClose}
      />,
    )

    const investigationWindow = screen.getByRole('complementary', { name: '维修单调查窗口' })

    fireEvent.click(within(investigationWindow).getByRole('button', { name: '逐项核对维修单抬头' }))
    expect(onChoose).toHaveBeenCalledWith('0')
    expect(within(investigationWindow).queryByText('抬头写的是老王楼栋。')).not.toBeInTheDocument()

    fireEvent.click(within(investigationWindow).getByRole('button', { name: '关闭调查窗口' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows investigation feedback as a dismissible popover', () => {
    const onDismiss = vi.fn()

    const { container } = render(
      <InvestigationFeedbackPopover feedback={['抬头写的是老王楼栋。']} onDismiss={onDismiss} />,
    )

    expect(screen.getByRole('complementary', { name: '调查结果' })).toHaveTextContent('抬头写的是老王楼栋。')

    fireEvent.click(container.querySelector('.investigation-feedback-layer')!)
    expect(onDismiss).toHaveBeenCalled()
  })

  it('keeps next-step actions separate from investigation actions', () => {
    const onChoose = vi.fn()

    render(
      <NextStepPanel
        choices={[
          choice({
            id: '7',
            index: 7,
            label: '拿起笔，进入消防门维修单签字环节',
            kind: 'advance',
            group: 'decision',
            targetLabel: '签字环节',
            mode: 'advance',
            surface: 'next_step',
            repeatable: false,
          }),
        ]}
        onChoose={onChoose}
      />,
    )

    const nextStepPanel = screen.getByRole('region', { name: '下一步' })

    fireEvent.click(within(nextStepPanel).getByRole('button', { name: /拿起笔，进入消防门维修单签字环节/ }))
    expect(onChoose).toHaveBeenCalledWith('7')
    expect(within(nextStepPanel).queryByText('第一章现场记录已归档。')).not.toBeInTheDocument()
  })

  it('shows only an archive message when there are no next-step actions', () => {
    const onChoose = vi.fn()

    const { container } = render(<NextStepPanel choices={[]} onChoose={onChoose} />)

    const nextStepPanel = within(container).getByRole('region', { name: '下一步' })

    expect(within(nextStepPanel).getByText('第一章现场记录已归档。')).toBeInTheDocument()
    expect(within(nextStepPanel).queryByRole('button')).not.toBeInTheDocument()
  })
})
