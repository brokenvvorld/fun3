import { act, fireEvent, render, screen, within } from '@testing-library/react'
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
    {
      id: '1',
      index: 1,
      label: '查看窗口材料',
      kind: 'inspect',
      group: 'document',
      targetId: 'documents',
      targetLabel: '窗口材料',
      mode: 'inspect',
      surface: 'modal',
      repeatable: true,
    },
  ],
  notices: ['LC-IX-TEST=内部测试告示'],
  receipts: ['内部回执不应直接显示'],
  tags: [
    'choice:0:surface=next_step',
    'notice:LC-IX-TEST=内部测试告示',
    'receipt:内部回执不应直接显示',
  ],
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
      pendingNewGame: false,
      hasSave: true,
      loading: false,
      error: undefined,
      settings: {
        musicEnabled: false,
        soundEnabled: true,
        captionsEnabled: true,
        textSpeed: 'standard',
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the stored procedure receipt log in the playing screen', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: '测试窗口' })).toBeInTheDocument()
    const workbench = screen.getByRole('region', { name: '现场工作台' })
    expect(within(workbench).getByText('当前手续')).toBeInTheDocument()
    expect(within(workbench).getByText('测试窗口')).toBeInTheDocument()
    expect(within(workbench).getByText('1 项调查 / 1 项推进')).toBeInTheDocument()
    expect(within(workbench).getByText('推进回执应入账')).toBeInTheDocument()

    const log = screen.getByRole('region', { name: '现场记录' })

    expect(within(log).getByText('1 条')).toBeInTheDocument()
    expect(within(log).getByLabelText('最近现场记录')).toHaveTextContent('推进回执应入账')
    expect(within(log).queryByRole('heading', { name: '手续回执' })).not.toBeInTheDocument()

    fireEvent.click(within(log).getByRole('button', { name: /现场记录/ }))

    expect(within(log).getByRole('heading', { name: '手续回执' })).toBeInTheDocument()
    expect(within(log).getByText('推进回执应入账')).toBeInTheDocument()
  })

  it('does not render internal story metadata in the playing screen', () => {
    render(<App />)

    expect(screen.queryByText(/choice:0:surface/)).not.toBeInTheDocument()
    expect(screen.queryByText(/notice:LC-IX-TEST/)).not.toBeInTheDocument()
    expect(screen.queryByText(/receipt:内部回执/)).not.toBeInTheDocument()
    expect(screen.queryByText('LC-IX-TEST=内部测试告示')).not.toBeInTheDocument()
    expect(screen.queryByText('内部回执不应直接显示')).not.toBeInTheDocument()
  })

  it('returns the story text scroll container to the top when the story copy changes', () => {
    const { container } = render(<App />)
    const narrativeScroll = container.querySelector<HTMLDivElement>('.narrative-scroll')

    expect(narrativeScroll).toBeTruthy()
    if (!narrativeScroll) return

    narrativeScroll.scrollTop = 240

    act(() => {
      useGameStore.setState({
        storyView: {
          ...storyView,
          title: '下一段手续',
          paragraphs: ['新文本从这里开始。'],
        },
      })
    })

    expect(narrativeScroll.scrollTop).toBe(0)
  })

  it('keeps developer controls out of the visible settings screen', () => {
    useGameStore.setState({ screen: 'settings' })

    render(<App />)

    expect(screen.getByRole('heading', { name: '设置' })).toBeInTheDocument()
    expect(screen.queryByText(/开发/)).not.toBeInTheDocument()
    expect(screen.queryByText(/调试/)).not.toBeInTheDocument()
  })

  it('keeps the debug panel available through a hidden developer shortcut', () => {
    render(<App />)

    expect(screen.queryByRole('complementary', { name: '调试面板' })).not.toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true })

    expect(screen.getByRole('complementary', { name: '调试面板' })).toBeInTheDocument()
  })

  it('returns from auxiliary screens to the playing scene when opened in game', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '角色档案' }))

    expect(screen.getByRole('heading', { name: '人物档案' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '返回现场' }))

    expect(screen.getByRole('heading', { name: '测试窗口' })).toBeInTheDocument()
    expect(screen.getByText('窗口正在等待下一份材料。')).toBeInTheDocument()
  })

  it('returns from auxiliary screens to the main menu when opened from the menu', () => {
    useGameStore.setState({ screen: 'mainMenu', storyView: null, hasSave: false })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /世界图鉴/ }))

    expect(screen.getByRole('heading', { name: '世界手记' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '返回主界面' }))

    expect(screen.getByRole('heading', { name: '临川：九号枢纽区' })).toBeInTheDocument()
  })

  it('filters world codex entries by category with an accessible selected state', () => {
    useGameStore.setState({ screen: 'codex', returnScreen: undefined })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    expect(within(categoryNav).getByRole('button', { name: '全部', pressed: true })).toBeInTheDocument()
    expect(screen.getByText('LC-IX-001 配给盖章机')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-012 第一处机枢渗水点')).toBeInTheDocument()
    expect(screen.getByText('市政回声')).toBeInTheDocument()

    fireEvent.click(within(categoryNav).getByRole('button', { name: '势力' }))

    expect(within(categoryNav).getByRole('button', { name: '势力', pressed: true })).toBeInTheDocument()
    expect(screen.queryByText('LC-IX-001 配给盖章机')).not.toBeInTheDocument()
    expect(screen.queryByText('LC-IX-012 第一处机枢渗水点')).not.toBeInTheDocument()
    expect(screen.getByText('市政回声')).toBeInTheDocument()

    fireEvent.click(within(categoryNav).getByRole('button', { name: '全部' }))

    expect(within(categoryNav).getByRole('button', { name: '全部', pressed: true })).toBeInTheDocument()
    expect(screen.getByText('LC-IX-001 配给盖章机')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-012 第一处机枢渗水点')).toBeInTheDocument()
  })

  it('keeps undiscovered first-chapter codex dossiers from exposing consequences', () => {
    useGameStore.setState({ screen: 'codex', returnScreen: undefined })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    fireEvent.click(within(categoryNav).getByRole('button', { name: '第一章现场档案' }))

    expect(screen.getByText('LC-IX-001 配给盖章机')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-002 临时通行条复印件')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-004 临期酸奶清点表')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-007 叫号屏倒序')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-008 物业群第404条消息')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-009 消防门维修单')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-010 排水井回执')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-011 熟客名单缺页')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-012 第一处机枢渗水点')).toBeInTheDocument()
    expect(screen.getAllByText('未发现')).toHaveLength(12)
    expect(screen.getAllByText('待核验摘要')).toHaveLength(12)
    expect(screen.queryByText('档案状态')).not.toBeInTheDocument()
    expect(screen.queryByText('处置建议')).not.toBeInTheDocument()
    expect(screen.queryByText('已知后果')).not.toBeInTheDocument()
    expect(screen.queryByText('后续回响')).not.toBeInTheDocument()
    expect(screen.queryByText(/签字前必须核对两边仍有活人/)).not.toBeInTheDocument()
    expect(screen.queryByText(/下游居民已“自愿承压”/)).not.toBeInTheDocument()
    expect(screen.queryByText(/终章代办窗口和全局暴露结算/)).not.toBeInTheDocument()
  })

  it('keeps second-chapter codex dossiers gated before field receipts exist', () => {
    useGameStore.setState({ screen: 'codex', returnScreen: undefined })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    fireEvent.click(within(categoryNav).getByRole('button', { name: '第二章现场档案' }))

    expect(screen.getByText('LC-IX-013 换乘箭头回环')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-014 安检口失物招领')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-016 站厅广播同一句')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-019 备用电池借条')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-020 轨道下方的湿脚印')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-022 免费奇迹券')).toBeInTheDocument()
    expect(screen.getAllByText('未发现')).toHaveLength(6)
    expect(screen.getAllByText('待核验摘要')).toHaveLength(6)
    expect(screen.queryByText('档案状态')).not.toBeInTheDocument()
    expect(screen.queryByText('已知后果')).not.toBeInTheDocument()
    expect(screen.queryByText('后续回响')).not.toBeInTheDocument()
    expect(screen.queryByText(/每多绕一圈，队尾就少一名/)).not.toBeInTheDocument()
    expect(screen.queryByText(/领取者会继承原持有人的未完成事项/)).not.toBeInTheDocument()
    expect(screen.queryByText(/第四章库存算法和小小幸存条件/)).not.toBeInTheDocument()
  })

  it('opens discovered second-chapter codex dossiers without exposing final consequences', () => {
    useGameStore.setState({
      screen: 'codex',
      returnScreen: undefined,
      storyView: {
        ...storyView,
        notices: ['anomaly=LC-IX-013,object=换乘箭头回环'],
        receipts: ['LC-IX-013=换乘箭头回环待核验'],
        tags: ['notice:anomaly=LC-IX-013,object=换乘箭头回环'],
      },
      procedureLog: [],
    })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    fireEvent.click(within(categoryNav).getByRole('button', { name: '第二章现场档案' }))

    expect(screen.getByText('LC-IX-013 换乘箭头回环')).toBeInTheDocument()
    expect(screen.getByText('已发现')).toBeInTheDocument()
    expect(screen.getByText(/高架换乘站的箭头会把队伍绕回同一处栏杆/)).toBeInTheDocument()
    expect(screen.getByText(/尚未形成现场回执/)).toBeInTheDocument()
    expect(screen.queryByText('处置结果')).not.toBeInTheDocument()
    expect(screen.queryByText('已知后果')).not.toBeInTheDocument()
    expect(screen.queryByText('后续回响')).not.toBeInTheDocument()
    expect(screen.queryByText(/第三章广播井会读取谁抵达过回环路线/)).not.toBeInTheDocument()
  })

  it('opens the discovered lost-and-found dossier without treating pending receipts as handled', () => {
    useGameStore.setState({
      screen: 'codex',
      returnScreen: undefined,
      storyView: {
        ...storyView,
        notices: ['anomaly=LC-IX-014,object=安检口失物招领'],
        receipts: ['LC-IX-014=安检口失物招领待核验'],
        tags: ['notice:anomaly=LC-IX-014,object=安检口失物招领'],
      },
      procedureLog: [],
    })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    fireEvent.click(within(categoryNav).getByRole('button', { name: '第二章现场档案' }))

    expect(screen.getByText('LC-IX-014 安检口失物招领')).toBeInTheDocument()
    expect(screen.getByText('已发现')).toBeInTheDocument()
    expect(screen.getByText(/安检口失物招领处会把第一章死者或失踪者的钥匙/)).toBeInTheDocument()
    expect(screen.getByText(/尚未形成现场回执/)).toBeInTheDocument()
    expect(screen.queryByText('处置结果')).not.toBeInTheDocument()
    expect(screen.queryByText('已知后果')).not.toBeInTheDocument()
    expect(screen.queryByText('后续回响')).not.toBeInTheDocument()
    expect(screen.queryByText(/取回物资能缓解眼前药品/)).not.toBeInTheDocument()
    expect(screen.queryByText(/第五章销号柜台/)).not.toBeInTheDocument()
  })

  it('opens the discovered station-broadcast dossier without treating pending receipts as handled', () => {
    useGameStore.setState({
      screen: 'codex',
      returnScreen: undefined,
      storyView: {
        ...storyView,
        notices: ['anomaly=LC-IX-016,object=站厅广播同一句'],
        receipts: ['LC-IX-016=站厅广播同一句待核验'],
        tags: ['notice:anomaly=LC-IX-016,object=站厅广播同一句'],
      },
      procedureLog: [{ id: 'pending-016', title: '现场待核验', summary: 'LC-IX-016=站厅广播同一句待核验' }],
    })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    fireEvent.click(within(categoryNav).getByRole('button', { name: '第二章现场档案' }))

    expect(screen.getByText('LC-IX-016 站厅广播同一句')).toBeInTheDocument()
    expect(screen.getByText('已发现')).toBeInTheDocument()
    expect(screen.getByText(/站厅广播反复播放“请照看好同行人员”/)).toBeInTheDocument()
    expect(screen.getByText(/尚未形成现场回执/)).toBeInTheDocument()
    expect(screen.queryByText('处置结果')).not.toBeInTheDocument()
    expect(screen.queryByText('已知后果')).not.toBeInTheDocument()
    expect(screen.queryByText('后续回响')).not.toBeInTheDocument()
    expect(screen.queryByText(/林小满用熟客名单背面保住一批同行证明/)).not.toBeInTheDocument()
    expect(screen.queryByText(/第三章广播井和第五章低风险撤离口/)).not.toBeInTheDocument()
  })

  it('keeps pending codex discoveries from saved procedure receipts after leaving the scene', () => {
    useGameStore.setState({
      screen: 'codex',
      returnScreen: undefined,
      storyView: null,
      procedureLog: [{ id: 'pending-016', title: '现场待核验', summary: 'LC-IX-016=站厅广播同一句待核验' }],
    })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    fireEvent.click(within(categoryNav).getByRole('button', { name: '第二章现场档案' }))

    expect(screen.getByText('LC-IX-016 站厅广播同一句')).toBeInTheDocument()
    expect(screen.getByText('已发现')).toBeInTheDocument()
    expect(screen.getByText(/尚未形成现场回执/)).toBeInTheDocument()
    expect(screen.queryByText('处置结果')).not.toBeInTheDocument()
    expect(screen.queryByText('已处置')).not.toBeInTheDocument()
  })

  it('renders handled second-chapter codex dossiers from procedure receipts', () => {
    useGameStore.setState({
      screen: 'codex',
      returnScreen: undefined,
      procedureLog: [
        { id: 'codex-013', title: '手续回执', summary: 'LC-IX-013 换乘箭头回环已记录' },
      ],
    })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    fireEvent.click(within(categoryNav).getByRole('button', { name: '第二章现场档案' }))

    expect(screen.getByText('LC-IX-013 换乘箭头回环')).toBeInTheDocument()
    expect(screen.getByText('已处置')).toBeInTheDocument()
    expect(screen.getAllByText('未发现')).toHaveLength(5)
    expect(screen.getByText('档案状态')).toBeInTheDocument()
    expect(screen.getByText('已知后果')).toBeInTheDocument()
    expect(screen.getByText('后续回响')).toBeInTheDocument()
    expect(screen.getByText(/公开规则能保住部分队尾/)).toBeInTheDocument()
    expect(screen.getByText(/第五章低风险撤离口会读取第二章路线稳定度/)).toBeInTheDocument()
  })

  it('renders the selected transfer-arrow outcome in the handled codex dossier', () => {
    useGameStore.setState({
      screen: 'codex',
      returnScreen: undefined,
      world: {
        ...initialWorldState,
        flags: {
          ...initialWorldState.flags,
          ch2_transfer_arrow_choice: 'public_warning',
          ch2_route_stability: 'public_contested',
        },
      },
      procedureLog: [
        { id: 'codex-013', title: '手续回执', summary: 'LC-IX-013 换乘箭头回环已记录：公开警示' },
      ],
    })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    fireEvent.click(within(categoryNav).getByRole('button', { name: '第二章现场档案' }))

    expect(screen.getByText('LC-IX-013 换乘箭头回环')).toBeInTheDocument()
    expect(screen.getByText('已处置')).toBeInTheDocument()
    expect(screen.getByText('已公开喊停导向箭头')).toBeInTheDocument()
    expect(screen.getByText(/玩家补办编号记入扰动记录/)).toBeInTheDocument()
    expect(screen.getByText(/排队管理处后续会把玩家列入需要解释路线异常的人/)).toBeInTheDocument()
    expect(screen.queryByText(/路线记录转为慢速稳定/)).not.toBeInTheDocument()
    expect(screen.queryByText(/队尾居民获得人工核验锚点/)).not.toBeInTheDocument()
  })

  it('renders the selected lost-and-found outcome in the handled codex dossier', () => {
    useGameStore.setState({
      screen: 'codex',
      returnScreen: undefined,
      world: {
        ...initialWorldState,
        flags: {
          ...initialWorldState.flags,
          ch2_lost_found_choice: 'transfer_authority',
          ch2_lost_found_debt: 'transferred_to_queue_management',
        },
      },
      procedureLog: [
        { id: 'codex-014', title: '手续回执', summary: 'LC-IX-014 安检口失物招领已记录：移交收讫' },
      ],
    })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    fireEvent.click(within(categoryNav).getByRole('button', { name: '第二章现场档案' }))

    expect(screen.getByText('LC-IX-014 安检口失物招领')).toBeInTheDocument()
    expect(screen.getByText('已处置')).toBeInTheDocument()
    expect(screen.getByText('已移交排队管理处收讫')).toBeInTheDocument()
    expect(screen.getByText(/排队管理处关系转为交易/)).toBeInTheDocument()
    expect(screen.getByText(/优先读取排队管理处证据/)).toBeInTheDocument()
    expect(screen.queryByText(/未完成事项转入玩家补办编号名下/)).not.toBeInTheDocument()
    expect(screen.queryByText(/见证单阻止系统把/)).not.toBeInTheDocument()
  })

  it('renders the selected station-broadcast outcome in the handled codex dossier', () => {
    useGameStore.setState({
      screen: 'codex',
      returnScreen: undefined,
      world: {
        ...initialWorldState,
        flags: {
          ...initialWorldState.flags,
          ch2_station_broadcast_choice: 'list_anchor',
          ch2_broadcast_companion_state: 'lin_list_anchor',
        },
      },
      procedureLog: [
        { id: 'codex-016', title: '手续回执', summary: 'LC-IX-016 站厅广播同一句已记录：名单锚定' },
      ],
    })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    fireEvent.click(within(categoryNav).getByRole('button', { name: '第二章现场档案' }))

    expect(screen.getByText('LC-IX-016 站厅广播同一句')).toBeInTheDocument()
    expect(screen.getByText('已处置')).toBeInTheDocument()
    expect(screen.getByText('已由熟客名单锚定同行关系')).toBeInTheDocument()
    expect(screen.getByText(/林小满用熟客名单背面保住一批同行证明/)).toBeInTheDocument()
    expect(screen.getByText(/第三章名单校验会读取这页背面的手写关系/)).toBeInTheDocument()
    expect(screen.queryByText(/队伍停在站厅柱列下重新核对关系/)).not.toBeInTheDocument()
    expect(screen.queryByText(/未被报出的同行关系被压缩成无效边缘/)).not.toBeInTheDocument()
  })

  it('keeps discovered but unresolved codex dossiers from exposing handled outcomes', () => {
    useGameStore.setState({
      screen: 'codex',
      returnScreen: undefined,
      storyView: {
        ...storyView,
        notices: ['anomaly=LC-IX-012,object=第一处机枢渗水点'],
        receipts: ['LC-IX-012=维护节点记录待封存'],
        tags: ['notice:anomaly=LC-IX-012,object=第一处机枢渗水点'],
      },
      procedureLog: [],
    })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    fireEvent.click(within(categoryNav).getByRole('button', { name: '第一章现场档案' }))

    expect(screen.getByText('LC-IX-012 第一处机枢渗水点')).toBeInTheDocument()
    expect(screen.getByText('已发现')).toBeInTheDocument()
    expect(screen.getByText('处置记录')).toBeInTheDocument()
    expect(screen.getByText(/尚未形成现场回执/)).toBeInTheDocument()
    expect(screen.queryByText('处置结果')).not.toBeInTheDocument()
    expect(screen.queryByText('已知后果')).not.toBeInTheDocument()
    expect(screen.queryByText('后续回响')).not.toBeInTheDocument()
    expect(screen.queryByText(/终章代办窗口和全局暴露结算/)).not.toBeInTheDocument()
    expect(screen.queryByText(/假声音被掐断/)).not.toBeInTheDocument()
  })

  it('opens newly discovered supplemental codex dossiers without leaking final consequences', () => {
    useGameStore.setState({
      screen: 'codex',
      returnScreen: undefined,
      storyView: {
        ...storyView,
        notices: ['anomaly=LC-IX-010,object=排水井回执'],
        receipts: ['LC-IX-010=排水井回执待确认'],
        tags: ['notice:anomaly=LC-IX-010,object=排水井回执'],
      },
      procedureLog: [],
    })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    fireEvent.click(within(categoryNav).getByRole('button', { name: '第一章现场档案' }))

    expect(screen.getByText('LC-IX-010 排水井回执')).toBeInTheDocument()
    expect(screen.getByText('已发现')).toBeInTheDocument()
    expect(screen.getByText(/排水井回执声称下游居民已“自愿承压”/)).toBeInTheDocument()
    expect(screen.getByText(/尚未形成现场回执/)).toBeInTheDocument()
    expect(screen.queryByText(/签收能打开地下撤离线索/)).not.toBeInTheDocument()
    expect(screen.queryByText(/第二章地下商业街和第四章资源模型/)).not.toBeInTheDocument()
  })

  it('does not treat pending fire-door receipts as handled codex outcomes', () => {
    useGameStore.setState({
      screen: 'codex',
      returnScreen: undefined,
      storyView: {
        ...storyView,
        notices: ['anomaly=LC-IX-009,object=消防门维修单'],
        receipts: ['LC-IX-009=消防门维修单待签'],
        tags: ['notice:anomaly=LC-IX-009,object=消防门维修单'],
      },
      procedureLog: [],
    })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    fireEvent.click(within(categoryNav).getByRole('button', { name: '第一章现场档案' }))

    expect(screen.getByText('LC-IX-009 消防门维修单')).toBeInTheDocument()
    expect(screen.getByText('已发现')).toBeInTheDocument()
    expect(screen.getByText(/尚未形成现场回执/)).toBeInTheDocument()
    expect(screen.queryByText('处置结果')).not.toBeInTheDocument()
    expect(screen.queryByText('已知后果')).not.toBeInTheDocument()
    expect(screen.queryByText(/一边获得实际救援/)).not.toBeInTheDocument()
    expect(screen.queryByText(/已由补办编号承接责任栏/)).not.toBeInTheDocument()
  })

  it('opens first-chapter short observation codex dossiers without exposing handled echoes', () => {
    useGameStore.setState({
      screen: 'codex',
      returnScreen: undefined,
      storyView: {
        ...storyView,
        notices: ['LC-IX-008=物业群第404条消息/社区楼院/挂起待查'],
        receipts: ['物业群第404条消息=无群名无发送人'],
        tags: ['notice:LC-IX-008=物业群第404条消息/社区楼院/挂起待查'],
      },
      procedureLog: [],
    })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    fireEvent.click(within(categoryNav).getByRole('button', { name: '第一章现场档案' }))

    expect(screen.getByText('LC-IX-008 物业群第404条消息')).toBeInTheDocument()
    expect(screen.getByText('已发现')).toBeInTheDocument()
    expect(screen.getByText(/没有群名、没有发送人的物业群消息/)).toBeInTheDocument()
    expect(screen.getByText(/尚未形成现场回执/)).toBeInTheDocument()
    expect(screen.queryByText(/传播消息会提高警戒/)).not.toBeInTheDocument()
    expect(screen.queryByText(/第三章物业群截图打印机/)).not.toBeInTheDocument()
  })

  it('keeps customer-list discovery separate from its irreversible handling flag', () => {
    useGameStore.setState({
      screen: 'codex',
      returnScreen: undefined,
      storyView: {
        ...storyView,
        notices: ['anomaly=LC-IX-011,object=熟客名单缺页'],
        receipts: ['LC-IX-011=熟客名单缺页待处理'],
        tags: ['notice:anomaly=LC-IX-011,object=熟客名单缺页'],
      },
      procedureLog: [],
    })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    fireEvent.click(within(categoryNav).getByRole('button', { name: '第一章现场档案' }))

    expect(screen.getByText('LC-IX-011 熟客名单缺页')).toBeInTheDocument()
    expect(screen.getByText('已发现')).toBeInTheDocument()
    expect(screen.getByText(/林小满的熟客名单被户籍柜裁走一页/)).toBeInTheDocument()
    expect(screen.getByText(/尚未形成现场回执/)).toBeInTheDocument()
    expect(screen.queryByText(/更正能保住真相/)).not.toBeInTheDocument()
    expect(screen.queryByText(/第三章校验失败、第四章便利店模型/)).not.toBeInTheDocument()
  })

  it('renders handled first-chapter codex dossiers with structured civic fields', () => {
    useGameStore.setState({
      screen: 'codex',
      returnScreen: undefined,
      world: {
        ...initialWorldState,
        flags: {
          ...initialWorldState.flags,
          ch1_queue_screen_record: 'queue_maintained_with_proxy',
          ch1_property_message_record: 'copied_to_doors',
          ch1_customer_list_choice: 'truth_by_lin_xiaoman',
        },
        irreversibleFlags: {
          ...initialWorldState.irreversibleFlags,
          ch1_customer_list_repair: 'truth_by_lin_xiaoman',
        },
      },
      procedureLog: [
        { id: 'codex-001', title: '手续回执', summary: 'LC-IX-001 配给登记更正页已贴封' },
        { id: 'codex-002', title: '手续回执', summary: 'LC-IX-002 通行条复印限制记录已登记' },
        { id: 'codex-003', title: '手续回执', summary: 'LC-IX-003 夜间值守签名页已归档' },
        { id: 'codex-004', title: '手续回执', summary: 'LC-IX-004 酸奶发放签收页已留底' },
        { id: 'codex-005', title: '手续回执', summary: 'LC-IX-005 末日客服中心急件封袋已登记' },
        { id: 'codex-006', title: '手续回执', summary: 'LC-IX-006 地下档案室水线完成错峰限行' },
        { id: 'codex-009', title: '手续回执', summary: 'LC-IX-009 消防门维修单已签入补办编号' },
        { id: 'codex-010', title: '手续回执', summary: 'LC-IX-010 排水井回执已确认' },
        { id: 'codex-012', title: '手续回执', summary: 'LC-IX-012 第一处机枢渗水点实名切断' },
      ],
    })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    fireEvent.click(within(categoryNav).getByRole('button', { name: '第一章现场档案' }))

    expect(screen.getByText('LC-IX-001 配给盖章机')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-002 临时通行条复印件')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-003 值班表空格')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-004 临期酸奶清点表')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-005 末日客服中心')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-006 地下档案室水线')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-007 叫号屏倒序')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-008 物业群第404条消息')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-009 消防门维修单')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-010 排水井回执')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-011 熟客名单缺页')).toBeInTheDocument()
    expect(screen.getByText('LC-IX-012 第一处机枢渗水点')).toBeInTheDocument()
    expect(screen.queryByText('市政回声')).not.toBeInTheDocument()

    expect(screen.getAllByText('已处置')).toHaveLength(12)
    expect(screen.getAllByText('档案状态')).toHaveLength(12)
    expect(screen.getAllByText('摘要')).toHaveLength(12)
    expect(screen.getAllByText('处置建议')).toHaveLength(12)
    expect(screen.getAllByText('已知后果')).toHaveLength(12)
    expect(screen.getAllByText('后续回响')).toHaveLength(12)
    expect(screen.getByText(/签字前必须核对两边仍有活人/)).toBeInTheDocument()
    expect(screen.getByText(/第二章地下商业街和第四章资源模型/)).toBeInTheDocument()
    expect(screen.getByText(/后续名单校验会承认这页是真实伤口/)).toBeInTheDocument()
    expect(screen.getByText(/终章代办窗口和全局暴露结算/)).toBeInTheDocument()
  })

  it('renders the selected fire-door outcome in the handled codex dossier', () => {
    useGameStore.setState({
      screen: 'codex',
      returnScreen: undefined,
      world: {
        ...initialWorldState,
        flags: {
          ...initialWorldState.flags,
          ch1_fire_door_choice: 'protagonist_liability',
        },
        irreversibleFlags: {
          ...initialWorldState.irreversibleFlags,
          ch1_fire_door_rescue: 'protagonist_liability',
        },
      },
    })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    fireEvent.click(within(categoryNav).getByRole('button', { name: '第一章现场档案' }))

    expect(screen.getByText('LC-IX-009 消防门维修单')).toBeInTheDocument()
    expect(screen.getByText('已由补办编号承接责任栏')).toBeInTheDocument()
    expect(screen.getByText(/两边救援都被改成“待个人复核”/)).toBeInTheDocument()
    expect(screen.getByText(/后续工单会绕过窗口直接追索玩家编号/)).toBeInTheDocument()
    expect(screen.queryByText(/老王楼栋方向的消防门被优先打开/)).not.toBeInTheDocument()
    expect(screen.queryByText(/档案柜后的隔门打开/)).not.toBeInTheDocument()
  })

  it('renders the selected core-leak outcome in the handled codex dossier', () => {
    useGameStore.setState({
      screen: 'codex',
      returnScreen: undefined,
      world: {
        ...initialWorldState,
        flags: {
          ...initialWorldState.flags,
          ch1_core_leak_choice: 'false_voice_continues',
        },
        irreversibleFlags: {
          ...initialWorldState.irreversibleFlags,
          ch1_first_core_leak: 'false_voice_continues',
        },
      },
    })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    fireEvent.click(within(categoryNav).getByRole('button', { name: '第一章现场档案' }))

    expect(screen.getByText('LC-IX-012 第一处机枢渗水点')).toBeInTheDocument()
    expect(screen.getByText('已放任假声音继续指挥')).toBeInTheDocument()
    expect(screen.getByText(/假声音存下玩家声线/)).toBeInTheDocument()
    expect(screen.getByText(/终章会追问有多少撤离命令来自假声音/)).toBeInTheDocument()
    expect(screen.queryByText(/假声音被掐断/)).not.toBeInTheDocument()
    expect(screen.queryByText(/每次指令都被迫附带真实代价/)).not.toBeInTheDocument()
  })

  it('renders the selected drain-receipt outcome in the handled codex dossier', () => {
    useGameStore.setState({
      screen: 'codex',
      returnScreen: undefined,
      world: {
        ...initialWorldState,
        flags: {
          ...initialWorldState.flags,
          ch1_underground_route_seed: 'conditional',
        },
        irreversibleFlags: {
          ...initialWorldState.irreversibleFlags,
          ch1_drain_receipt: 'merged_with_fire_order',
        },
      },
    })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    fireEvent.click(within(categoryNav).getByRole('button', { name: '第一章现场档案' }))

    expect(screen.getByText('LC-IX-010 排水井回执')).toBeInTheDocument()
    expect(screen.getByText('已并入消防门维修单')).toBeInTheDocument()
    expect(screen.getByText(/路线既未关闭也未真正开放/)).toBeInTheDocument()
    expect(screen.getByText(/市政回声更容易把玩家视作可追索的并单责任人/)).toBeInTheDocument()
    expect(screen.queryByText(/下游片区被写成“自愿承压”/)).not.toBeInTheDocument()
    expect(screen.queryByText(/井盖沉回原位/)).not.toBeInTheDocument()
  })

  it('renders the selected customer-list outcome in the handled codex dossier', () => {
    useGameStore.setState({
      screen: 'codex',
      returnScreen: undefined,
      world: {
        ...initialWorldState,
        flags: {
          ...initialWorldState.flags,
          ch1_customer_list_choice: 'submitted_to_queue_authority',
        },
        irreversibleFlags: {
          ...initialWorldState.irreversibleFlags,
          ch1_customer_list_repair: 'submitted_to_queue_authority',
        },
      },
    })

    render(<App />)

    const categoryNav = screen.getByRole('navigation', { name: '条目分类' })
    fireEvent.click(within(categoryNav).getByRole('button', { name: '第一章现场档案' }))

    expect(screen.getByText('LC-IX-011 熟客名单缺页')).toBeInTheDocument()
    expect(screen.getByText('已移交排队管理处')).toBeInTheDocument()
    expect(screen.getByText(/缺页原件离开林小满和玩家控制/)).toBeInTheDocument()
    expect(screen.getByText(/排队管理处获得更多谈判空间/)).toBeInTheDocument()
    expect(screen.queryByText(/被恢复的人重新拥有可查证痕迹/)).not.toBeInTheDocument()
    expect(screen.queryByText(/页脚多出玩家补办编号/)).not.toBeInTheDocument()
  })

  it('keeps codex copy in player-facing Chinese civic terms', () => {
    useGameStore.setState({ screen: 'codex', returnScreen: undefined })

    render(<App />)

    expect(screen.queryByText(/\bstatus\b/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/\bsummary\b/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/\brecommendation\b/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/SCP|Control/)).not.toBeInTheDocument()
    expect(screen.queryByText(/幽默|生存压力|主线/)).not.toBeInTheDocument()
  })

  it('lets the visible text speed controls change their label', () => {
    useGameStore.setState({ screen: 'settings' })

    render(<App />)

    const speedControls = screen.getByRole('region', { name: '文本速度' })
    const slower = within(speedControls).getByRole('button', { name: '慢一点' })
    const faster = within(speedControls).getByRole('button', { name: '快一点' })

    expect(faster).toBeEnabled()
    expect(within(speedControls).getByText('标准')).toBeInTheDocument()

    fireEvent.click(faster)
    expect(within(speedControls).getByText('快速')).toBeInTheDocument()

    fireEvent.click(slower)
    fireEvent.click(slower)
    expect(within(speedControls).getByText('慢速')).toBeInTheDocument()
  })
})
