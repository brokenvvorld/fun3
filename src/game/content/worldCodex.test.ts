import { describe, expect, it } from 'vitest'
import type { WorldCodexEntry } from './types'
import { buildWorldCodexViewEntries, worldCodexEntries } from './worldCodex'

const baseEntry: Omit<WorldCodexEntry, 'id' | 'title' | 'category' | 'preview'> = {
  dossierStatus: '登记观察',
  civicLine: '窗口办件',
  handlingProtocol: '登记观察',
  formTags: ['流程型'],
  body: '测试档案摘要。',
  trigger: '测试触发。',
  handling: '测试处置。',
  consequence: '测试后果。',
  echo: '测试回响。',
}

describe('buildWorldCodexViewEntries', () => {
  it('keeps discovered and handled receipt signals separate', () => {
    const [entry] = buildWorldCodexViewEntries(
      [
        {
          ...baseEntry,
          id: 'test-codex',
          title: '测试档案',
          category: '测试',
          preview: '测试预览。',
          discoveredReceipts: ['待确认回执'],
          handledReceipts: ['已确认回执'],
        },
      ],
      {
        discovered: ['LC-IX-TEST=待确认回执'],
        handled: ['测试记录仍未处置'],
      },
    )

    expect(entry.discoveryStatus).toBe('discovered')
  })

  it('preserves legacy discoveryReceipts behavior for unmigrated entries', () => {
    const [entry] = buildWorldCodexViewEntries(
      [
        {
          ...baseEntry,
          id: 'legacy-codex',
          title: '旧字段档案',
          category: '测试',
          preview: '旧字段预览。',
          discoveryReceipts: ['旧回执'],
        },
      ],
      {
        discovered: [],
        handled: ['旧回执已归档'],
      },
    )

    expect(entry.discoveryStatus).toBe('handled')
  })

  it('matches structured notice fields without relying on arbitrary substrings', () => {
    const [entry] = buildWorldCodexViewEntries(
      [
        {
          ...baseEntry,
          id: 'structured-codex',
          title: '结构化档案',
          category: '测试',
          preview: '结构化预览。',
          discoveredReceipts: ['notice:anomaly=LC-IX-013', '换乘箭头回环'],
          handledReceipts: ['换乘箭头回环已记录'],
        },
      ],
      {
        discovered: ['notice:anomaly=LC-IX-013,object=换乘箭头回环'],
        handled: [],
      },
    )

    expect(entry.discoveryStatus).toBe('discovered')
  })

  it('matches procedure summaries when a complete receipt phrase is wrapped in text', () => {
    const [entry] = buildWorldCodexViewEntries(
      [
        {
          ...baseEntry,
          id: 'procedure-codex',
          title: '手续档案',
          category: '测试',
          preview: '手续预览。',
          discoveredReceipts: ['LC-IX-013'],
          handledReceipts: ['换乘箭头回环已记录'],
        },
      ],
      {
        discovered: [],
        handled: ['手续回执 LC-IX-013 换乘箭头回环已记录'],
      },
    )

    expect(entry.discoveryStatus).toBe('handled')
  })

  it('matches compact codex summaries where the handled phrase follows the title', () => {
    const [entry] = buildWorldCodexViewEntries(
      [
        {
          ...baseEntry,
          id: 'compact-summary-codex',
          title: '紧凑摘要档案',
          category: '测试',
          preview: '紧凑摘要预览。',
          discoveredReceipts: ['LC-IX-012'],
          handledReceipts: ['实名切断'],
        },
      ],
      {
        discovered: [],
        handled: ['LC-IX-012 第一处机枢渗水点实名切断'],
      },
    )

    expect(entry.discoveryStatus).toBe('handled')
  })

  it('does not match short receipt fragments inside larger pending records', () => {
    const [entry] = buildWorldCodexViewEntries(
      [
        {
          ...baseEntry,
          id: 'pending-codex',
          title: '待签档案',
          category: '测试',
          preview: '待签预览。',
          discoveredReceipts: ['LC-IX-009'],
          handledReceipts: ['消防门'],
        },
      ],
      {
        discovered: ['LC-IX-009=消防门维修单待签'],
        handled: ['LC-IX-009=消防门维修单待签'],
      },
    )

    expect(entry.discoveryStatus).toBe('discovered')
  })

  it('does not match unrelated short phrases without a codex summary prefix', () => {
    const [entry] = buildWorldCodexViewEntries(
      [
        {
          ...baseEntry,
          id: 'generic-fragment-codex',
          title: '泛词档案',
          category: '测试',
          preview: '泛词预览。',
          discoveredReceipts: ['LC-IX-005'],
          handledReceipts: ['客服中心'],
        },
      ],
      {
        discovered: ['LC-IX-005=末日客服中心待核验'],
        handled: ['普通记录提到末日客服中心仍在派单'],
      },
    )

    expect(entry.discoveryStatus).toBe('discovered')
  })

  it('resolves LC-IX-013 transfer-arrow handled outcomes from world flags', () => {
    const transferArrowEntry = worldCodexEntries.find((entry) => entry.id === 'lc-ix-013')
    expect(transferArrowEntry).toBeDefined()

    const [entry] = buildWorldCodexViewEntries([transferArrowEntry as WorldCodexEntry], {
      discovered: ['notice:anomaly=LC-IX-013,object=换乘箭头回环'],
      handled: ['ch2_transfer_arrow_choice=tail_name_anchor'],
      outcomes: { ch2_transfer_arrow_choice: 'tail_name_anchor' },
    })

    expect(entry.discoveryStatus).toBe('handled')
    expect(entry.resolvedOutcome?.title).toBe('已给队尾留名')
    expect(entry.resolvedOutcome?.consequence).toContain('队尾居民获得人工核验锚点')
  })

  it('does not expose an outcome before the codex entry is handled', () => {
    const transferArrowEntry = worldCodexEntries.find((entry) => entry.id === 'lc-ix-013')
    expect(transferArrowEntry).toBeDefined()

    const [entry] = buildWorldCodexViewEntries([transferArrowEntry as WorldCodexEntry], {
      discovered: ['notice:anomaly=LC-IX-013,object=换乘箭头回环'],
      handled: [],
      outcomes: { ch2_transfer_arrow_choice: 'tail_name_anchor' },
    })

    expect(entry.discoveryStatus).toBe('discovered')
    expect(entry.resolvedOutcome).toBeUndefined()
  })

  it('keeps LC-IX-014 lost-and-found pending receipts in discovered state only', () => {
    const lostAndFoundEntry = worldCodexEntries.find((entry) => entry.id === 'lc-ix-014')
    expect(lostAndFoundEntry).toBeDefined()

    const [entry] = buildWorldCodexViewEntries([lostAndFoundEntry as WorldCodexEntry], {
      discovered: [
        'notice:anomaly=LC-IX-014,object=安检口失物招领',
        'LC-IX-014=安检口失物招领待核验',
      ],
      handled: ['LC-IX-014=安检口失物招领待核验'],
    })

    expect(entry.discoveryStatus).toBe('discovered')
    expect(entry.resolvedOutcome).toBeUndefined()
  })

  it('resolves LC-IX-014 lost-and-found handled outcomes from world flags', () => {
    const lostAndFoundEntry = worldCodexEntries.find((entry) => entry.id === 'lc-ix-014')
    expect(lostAndFoundEntry).toBeDefined()

    const [entry] = buildWorldCodexViewEntries([lostAndFoundEntry as WorldCodexEntry], {
      discovered: ['notice:anomaly=LC-IX-014,object=安检口失物招领'],
      handled: ['ch2_lost_found_choice=claim_items'],
      outcomes: { ch2_lost_found_choice: 'claim_items' },
    })

    expect(entry.discoveryStatus).toBe('handled')
    expect(entry.resolvedOutcome?.title).toBe('已领取并承接未完成事项')
    expect(entry.resolvedOutcome?.consequence).toContain('未完成事项转入玩家补办编号名下')
  })

  it('resolves all LC-IX-014 lost-and-found outcome values', () => {
    const lostAndFoundEntry = worldCodexEntries.find((entry) => entry.id === 'lc-ix-014')
    expect(lostAndFoundEntry).toBeDefined()

    const expectations = [
      ['claim_items', '已领取并承接未完成事项'],
      ['witness_refusal', '已拒领并留下见证'],
      ['transfer_authority', '已移交排队管理处收讫'],
    ] as const

    for (const [value, title] of expectations) {
      const [entry] = buildWorldCodexViewEntries([lostAndFoundEntry as WorldCodexEntry], {
        discovered: ['notice:anomaly=LC-IX-014,object=安检口失物招领'],
        handled: [`ch2_lost_found_choice=${value}`],
        outcomes: { ch2_lost_found_choice: value },
      })

      expect(entry.discoveryStatus).toBe('handled')
      expect(entry.resolvedOutcome?.title).toBe(title)
    }
  })

  it('keeps LC-IX-016 station-broadcast pending receipts in discovered state only', () => {
    const stationBroadcastEntry = worldCodexEntries.find((entry) => entry.id === 'lc-ix-016')
    expect(stationBroadcastEntry).toBeDefined()

    const [entry] = buildWorldCodexViewEntries([stationBroadcastEntry as WorldCodexEntry], {
      discovered: [
        'notice:anomaly=LC-IX-016,object=站厅广播同一句',
        'LC-IX-016=站厅广播同一句待核验',
      ],
      handled: ['LC-IX-016=站厅广播同一句待核验'],
    })

    expect(entry.discoveryStatus).toBe('discovered')
    expect(entry.resolvedOutcome).toBeUndefined()
  })

  it('resolves LC-IX-016 station-broadcast handled outcomes from world flags', () => {
    const stationBroadcastEntry = worldCodexEntries.find((entry) => entry.id === 'lc-ix-016')
    expect(stationBroadcastEntry).toBeDefined()

    const [entry] = buildWorldCodexViewEntries([stationBroadcastEntry as WorldCodexEntry], {
      discovered: ['notice:anomaly=LC-IX-016,object=站厅广播同一句'],
      handled: ['ch2_station_broadcast_choice=list_anchor'],
      outcomes: { ch2_station_broadcast_choice: 'list_anchor' },
    })

    expect(entry.discoveryStatus).toBe('handled')
    expect(entry.resolvedOutcome?.title).toBe('已由熟客名单锚定同行关系')
    expect(entry.resolvedOutcome?.consequence).toContain('林小满用熟客名单背面保住一批同行证明')
  })

  it('resolves all LC-IX-016 station-broadcast outcome values', () => {
    const stationBroadcastEntry = worldCodexEntries.find((entry) => entry.id === 'lc-ix-016')
    expect(stationBroadcastEntry).toBeDefined()

    const expectations = [
      ['full_headcount', '已逐项核对同行关系'],
      ['catch_safe_train', '已压缩登记赶上列车'],
      ['list_anchor', '已由熟客名单锚定同行关系'],
    ] as const

    for (const [value, title] of expectations) {
      const [entry] = buildWorldCodexViewEntries([stationBroadcastEntry as WorldCodexEntry], {
        discovered: ['notice:anomaly=LC-IX-016,object=站厅广播同一句'],
        handled: [`ch2_station_broadcast_choice=${value}`],
        outcomes: { ch2_station_broadcast_choice: value },
      })

      expect(entry.discoveryStatus).toBe('handled')
      expect(entry.resolvedOutcome?.title).toBe(title)
    }
  })
})
