import type { CodexDiscoveryStatus, WorldCodexEntry, WorldCodexViewEntry } from './types'

export type CodexDiscoverySignals = {
  discovered: string[]
  handled: string[]
  outcomes?: Record<string, unknown>
}

export function buildWorldCodexViewEntries(
  entries: WorldCodexEntry[],
  signals: CodexDiscoverySignals,
): WorldCodexViewEntry[] {
  return entries.map((entry) => {
    const discoveryStatus = getCodexDiscoveryStatus(entry, signals)

    return {
      ...entry,
      discoveryStatus,
      resolvedOutcome: discoveryStatus === 'handled' ? getResolvedCodexOutcome(entry, signals) : undefined,
    }
  })
}

function getCodexDiscoveryStatus(entry: WorldCodexEntry, signals: CodexDiscoverySignals): CodexDiscoveryStatus {
  const discoveredReceipts = entry.discoveredReceipts ?? entry.discoveryReceipts ?? []
  const handledReceipts = entry.handledReceipts ?? entry.discoveryReceipts ?? []
  if (!discoveredReceipts.length && !handledReceipts.length) return 'available'
  if (matchesAnySignal(handledReceipts, signals.handled)) return 'handled'
  if (matchesAnySignal(discoveredReceipts, signals.discovered)) return 'discovered'
  return 'undiscovered'
}

function matchesAnySignal(receipts: string[], signals: string[]) {
  return receipts.some((receipt) => signals.some((signal) => matchesSignalReceipt(receipt, signal)))
}

function matchesSignalReceipt(receipt: string, signal: string) {
  const normalizedReceipt = receipt.trim()
  const normalizedSignal = signal.trim()
  if (!normalizedReceipt || !normalizedSignal) return false
  if (normalizedReceipt === normalizedSignal) return true
  if (tokenizeSignal(normalizedSignal).includes(normalizedReceipt)) return true
  return hasBoundedPhrase(normalizedSignal, normalizedReceipt)
}

function tokenizeSignal(signal: string) {
  return signal.split(/[\s,;，；、/|()[\]{}"'“”‘’<>《》:=：]+/).filter(Boolean)
}

function hasBoundedPhrase(signal: string, receipt: string) {
  let startIndex = signal.indexOf(receipt)
  while (startIndex >= 0) {
    const endIndex = startIndex + receipt.length
    const before = startIndex === 0 ? '' : signal[startIndex - 1]
    const after = endIndex >= signal.length ? '' : signal[endIndex]
    const isDelimitedPhrase = isSignalBoundary(before) && (isSignalBoundary(after) || canMatchAsReceiptPrefix(receipt))
    const isCodexSummarySuffix = hasCodexIdBefore(signal, startIndex) && receipt.length >= 4 && (isSignalBoundary(after) || canMatchAsReceiptPrefix(receipt))
    if (isDelimitedPhrase || isCodexSummarySuffix) {
      return true
    }
    startIndex = signal.indexOf(receipt, startIndex + 1)
  }
  return false
}

function isSignalBoundary(char: string) {
  return char === '' || /[\s,;，；、/|()[\]{}"'“”‘’<>《》:=：]/.test(char)
}

function canMatchAsReceiptPrefix(receipt: string) {
  return receipt.length >= 4 || receipt.endsWith('回执')
}

function hasCodexIdBefore(signal: string, endIndex: number) {
  return /LC-IX-\d{3}/.test(signal.slice(0, endIndex))
}

function getResolvedCodexOutcome(entry: WorldCodexEntry, signals: CodexDiscoverySignals) {
  if (!entry.outcomeKey || !entry.outcomes) return undefined
  const rawValue = signals.outcomes?.[entry.outcomeKey]
  if (rawValue === undefined) return undefined
  return entry.outcomes[String(rawValue)]
}

export const worldCodexEntries: WorldCodexEntry[] = [
  {
    id: 'lc-ix-001',
    title: 'LC-IX-001 配给盖章机',
    category: '第一章现场档案',
    preview: '窗口区出现会提前替人完成安置的盖章异常；完整处置记录需取得现场回执后开放。',
    discoveredReceipts: ['LC-IX-001', '配给盖章机', 'ch1_zone_a_stamp_investigation'],
    handledReceipts: ['配给登记更正页', 'ch1_registry_outcome'],
    dossierStatus: '临时执行',
    civicLine: '户籍档案',
    handlingProtocol: '贴封停用',
    formTags: ['物件型', '流程型'],
    body: '无电盖章机会把未到场居民提前登记为“已安置”，纸面结论会反向吞掉床位、配给和在场记忆。',
    trigger: '补办配给资格、整理床位表或让章盒连续处理未核验名单时触发。',
    handling: '先用双人见证核对在场者，再贴封机器或改为手写更正；禁止让章盒独自连续盖章。',
    consequence: '恢复眼前名单会拖慢窗口并挤压未来名额；保留效率会让部分居民从床位和记忆里同时消失。',
    echo: '第三章死者工单、第四章亏损模型和第五章幸存者名单会读取这次更正结果。',
  },
  {
    id: 'lc-ix-002',
    title: 'LC-IX-002 临时通行条复印件',
    category: '第一章现场档案',
    preview: '复印出的通行条会替换持有人照片；完整处置记录需取得现场回执后开放。',
    discoveredReceipts: [
      'LC-IX-002',
      '临时通行条复印件',
      '临时通行条复印申请',
    ],
    handledReceipts: [
      '通行条复印限制记录',
      'ch1_zone_a_copy_decision',
    ],
    dossierStatus: '临时执行',
    civicLine: '窗口办件',
    handlingProtocol: '错峰限行',
    formTags: ['物件型'],
    body: '通行条复印件会把原持有人照片替换成陌生面孔，复印越多，窗口越快承认陌生人拥有原本的通行资格。',
    trigger: '医疗护送、错峰出楼或公开换证排队时，任何未核验的复印申请都会被自动接收。',
    handling: '只允许一人一件的急用复印，并在窗口旁留下原件见证；公开换证必须同步登记被替换者去向。',
    consequence: '放行能救下眼前的急件，也会把另一批人的通行资格挤出系统；拒绝复印则让等待队伍暴露在更长的清点和盘问里。',
    echo: '第二章安检口清点和第四章访客黑名单会读取本次复印记录。',
  },
  {
    id: 'lc-ix-003',
    title: 'LC-IX-003 值班表空格',
    category: '第一章现场档案',
    preview: '夜间值班表会要求有人填入空格；完整处置记录需取得现场回执后开放。',
    discoveredReceipts: [
      'LC-IX-003',
      '值班表空格',
      '夜间值班表-空格',
    ],
    handledReceipts: [
      '夜间值守签名页',
      'ch1_zone_a_roster_decision',
    ],
    dossierStatus: '登记观察',
    civicLine: '社区楼院',
    handlingProtocol: '贴封停用',
    formTags: ['流程型'],
    body: '值班表会在夜间自动生成空格；没有人签名时，楼道门会把整层居民判为无人值守。',
    trigger: '楼院准备夜间巡守、抽签值班或玩家主动承接第一班时触发。',
    handling: '签名前必须公开班次和见证人；抽签、双人班或玩家自签都要留下谁被替换、谁被保护的记录。',
    consequence: '填表会把风险压到具体的人身上；拖延或空置会让避难点夜门更早失守。',
    echo: '第三章值日战争和第五章社区庇护名单会追认第一夜谁先把名字写进空格。',
  },
  {
    id: 'lc-ix-004',
    title: 'LC-IX-004 临期酸奶清点表',
    category: '第一章现场档案',
    preview: '便利店清点表把保质期排成居民死亡顺序；完整处置记录需取得现场回执后开放。',
    discoveredReceipts: [
      'LC-IX-004',
      '临期酸奶清点表',
      '便利店临期酸奶清点表',
    ],
    handledReceipts: [
      '酸奶发放签收页',
      'ch1_zone_a_yogurt_decision',
    ],
    dossierStatus: '挂起待查',
    civicLine: '物资供应',
    handlingProtocol: '登记观察',
    formTags: ['物件型', '回声型'],
    body: '临期酸奶清点表把保质期改写成居民死亡顺序，越按表发放，队伍越相信那张表在提前通知结局。',
    trigger: '物资不足、儿童优先或私下隐藏清点表时，保质期会开始对应具体姓名。',
    handling: '公开表格可以换取见证和争吵，隐藏表格能暂时安抚队伍；无论哪种，都要记录谁被提前照顾。',
    consequence: '保护孩子会压低眼前伤亡，但会激化成人队伍对配给的怀疑；隐瞒顺序会让后续追责集中到发放者身上。',
    echo: '第四章亏损模型和林小满对玩家的信任会读取酸奶发放签收页。',
  },
  {
    id: 'lc-ix-005',
    title: 'LC-IX-005 末日客服中心',
    category: '第一章现场档案',
    preview: '叫号系统仍在派单和结案；完整处置记录需取得现场回执后开放。',
    discoveredReceipts: ['LC-IX-005', '末日客服中心', '客服中心'],
    handledReceipts: ['ch1_service_center_outcome', '急件封袋'],
    dossierStatus: '挂起待查',
    civicLine: '窗口办件',
    handlingProtocol: '挂起待查',
    formTags: ['流程型', '回声型'],
    body: '自动取号机继续派单，每办完一个号，现实中就有一件未解决事项被强制结案。',
    trigger: '社区服务中心恢复叫号，或玩家把片区 A 交接包送入客服窗口后触发。',
    handling: '只允许急件封袋和人工复核进入收件槽；禁止整批扫描居民名单。',
    consequence: '维持客服中心能换取短期秩序和市政回声入口，放任则会把真实求救办成已处理。',
    echo: '第三章市政回声权限和第五章最终工单会读取客服中心是否继续运行。',
  },
  {
    id: 'lc-ix-006',
    title: 'LC-IX-006 地下档案室水线',
    category: '第一章现场档案',
    preview: '社区服务中心档案室的水位与户籍柜号同步变化；完整处置记录需取得现场回执后开放。',
    discoveredReceipts: ['LC-IX-006', '地下档案室水线', '档案室水线'],
    handledReceipts: ['ch1_archive_waterline_record', '完成错峰限行'],
    dossierStatus: '登记观察',
    civicLine: '户籍档案',
    handlingProtocol: '错峰限行',
    formTags: ['地段型'],
    body: '档案室水线按柜号上涨，泡坏的户籍袋会逐排变成同一套死亡证明。',
    trigger: '社区服务中心档案室积水上涨，玩家需要在抢救档案和转移活人之间分配时间。',
    handling: '抢救档案时必须同步核对活人口述；禁止只按湿档案归档居民生死。',
    consequence: '救档案会损失撤离时间，救人优先则部分身份记录永久缺页，后续无法证明他们存在。',
    echo: '第一章消防门选择、第三章名单事故和终章人员结算都会引用水线记录。',
  },
  {
    id: 'lc-ix-007',
    title: 'LC-IX-007 叫号屏倒序',
    category: '第一章现场档案',
    preview: '叫号屏会把队列动作折算成幸存人数；完整处置记录需取得现场回执后开放。',
    discoveredReceipts: [
      'notice:LC-IX-007',
      'notice:anomaly=LC-IX-007',
    ],
    handledReceipts: [
      'ch1_queue_screen_record',
    ],
    dossierStatus: '登记观察',
    civicLine: '电力广播',
    handlingProtocol: '登记观察',
    formTags: ['回声型', '流程型'],
    body: '叫号屏会把大厅幸存人数倒数给所有人看；任何改变队列的动作都会被屏幕当作人数扣减，善意和插队在它眼里使用同一个字段。',
    trigger: '地下档案室水线回退后，大厅号码开始倒数，老人、儿童、代排牌和人工喊号同时进入屏幕判断。',
    handling: '优先让队列保留原号与姓名绑定，再公开屏幕规则；若切断电源，必须立刻安排人工喊号和见证记录。',
    consequence: '维持原序能稳住数字却压迫弱者；代排和公开规则能保住部分人，但会改变群众信任、排队管理处态度和暴露值。',
    echo: '第二章换乘效率和第三章公告栏签名会读取本次倒序叫号记录。',
  },
  {
    id: 'lc-ix-008',
    title: 'LC-IX-008 物业群第404条消息',
    category: '第一章现场档案',
    preview: '打印角吐出不存在的物业群警告；完整处置记录需取得现场回执后开放。',
    discoveredReceipts: [
      'notice:LC-IX-008',
      'notice:anomaly=LC-IX-008',
    ],
    handledReceipts: [
      'ch1_property_message_record',
    ],
    dossierStatus: '挂起待查',
    civicLine: '社区楼院',
    handlingProtocol: '挂起待查',
    formTags: ['回声型'],
    body: '打印机吐出一条没有群名、没有发送人的物业群消息：不要开门给今天之前的邻居。它会把亲友、熟人和陌生人全部压进“原登记关系”字段。',
    trigger: '倒序叫号暂时稳住后，楼道敲门声、物业老王口述和打印角消息同时出现。',
    handling: '封存原件可防止消息复制；有限张贴或公开朗读能降低夜袭风险，但必须同步逐门核对，避免把旧邻里关系变成互相举报。',
    consequence: '传播消息会提高警戒也制造邻里敌意；延后或销毁会让熟悉声音更容易被放进避难点。',
    echo: '第三章物业群截图打印机和社区信任线会读取第404条消息的处置方式。',
  },
  {
    id: 'lc-ix-009',
    title: 'LC-IX-009 消防门维修单',
    category: '第一章现场档案',
    preview: '维修单同时牵住两处待救对象；完整处置记录需取得现场回执后开放。',
    discoveredReceipts: [
      'LC-IX-009',
      '消防门维修单',
      '消防门',
    ],
    handledReceipts: [
      'ch1_fire_door_outcome',
      'ch1_fire_door_choice',
      'ch1_fire_door_rescue',
      '消防门维修单已',
    ],
    outcomeKey: 'ch1_fire_door_choice',
    outcomes: {
      old_wang_building: {
        title: '已补齐老王楼栋消防门半枚章',
        consequence: '老王楼栋方向的消防门被优先打开，水压从长桌退走；档案室这边的几份撤离证明被系统归档为“救援已完成”，普通补救入口关闭。',
        echo: '后续死者工单会把档案室空白证明归到这次签字名下，林小满会记得玩家选择先救楼栋方向的人。',
      },
      archive_survivors: {
        title: '已补齐档案室幸存者半枚章',
        consequence: '档案柜后的隔门打开，被困者得到转移；老王楼栋方向的敲击声被维修单结案，楼栋消防门后续不再接受普通维修申请。',
        echo: '第三章名单事故会追问老王楼栋的“已完成救援”记录，林小满会记得玩家没有让眼前的人继续泡在水线后。',
      },
      protagonist_liability: {
        title: '已由补办编号承接责任栏',
        consequence: '两边救援都被改成“待个人复核”，没有立即结案；水压没有退，玩家补办编号被写进责任栏，暴露值显著上升。',
        echo: '后续工单会绕过窗口直接追索玩家编号，市政回声更容易把玩家当成可调用的代办人。',
      },
    },
    dossierStatus: '临时执行',
    civicLine: '户籍档案',
    handlingProtocol: '转移安置',
    formTags: ['流程型'],
    body: '维修单要求玩家在“老王楼栋”和“档案室幸存者”之间补齐半枚章，被放弃的一边会被系统登记为已完成救援。',
    trigger: '积水压住消防门，维修单同时显示两处待救对象时进入签字环节。',
    handling: '签字前必须核对两边仍有活人；若写入补办编号承接责任，会暂缓结案但显著提高暴露。',
    consequence: '这是第一章硬不可逆节点：一边获得实际救援，另一边后续不再接受普通补救。',
    echo: '第三章死者工单、第四章模型评分和第五章终局名单会追问这张维修单。',
  },
  {
    id: 'lc-ix-010',
    title: 'LC-IX-010 排水井回执',
    category: '第一章现场档案',
    preview: '排水井回执会把压力转给下游街区；完整处置记录需取得现场回执后开放。',
    discoveredReceipts: [
      'LC-IX-010',
      '排水井回执',
      '排水井回执待确认',
      'ch1_drain_receipt_checked',
    ],
    handledReceipts: [
      '排水井回执已确认',
      '排水井回执未确认',
      '排水井回执并入消防门维修单',
      'ch1_drain_receipt',
    ],
    outcomeKey: 'ch1_drain_receipt',
    outcomes: {
      confirmed_downstream_burden: {
        title: '已确认下游承压',
        consequence: '排水井下行路线被打开，九号枢纽区获得可追踪的地下撤离线索；下游片区被写成“自愿承压”，停供断线成为已确认后果。',
        echo: '后续地下商业街会开放更直接的管网线索，资源核算表会把下游损失记作本区收益。',
      },
      rejected_false_consent: {
        title: '已改写为未征询',
        consequence: '井盖沉回原位，第二章路线被标成需另行证明；下游片区暂时保住未被伪造的同意记录，但档案室积水压力没有缓解。',
        echo: '后续路线会少一条即时捷径，林小满会记得玩家没有把“自愿”当作现成手续。',
      },
      merged_with_fire_order: {
        title: '已并入消防门维修单',
        consequence: '排水井回执进入并单挂起，路线既未关闭也未真正开放；消防门选择和下游承压被同一张责任链绑定，玩家暴露上升。',
        echo: '后续管网路线需要额外条件才会稳定，市政回声更容易把玩家视作可追索的并单责任人。',
      },
    },
    dossierStatus: '临时执行',
    civicLine: '排水管线',
    handlingProtocol: '转移安置',
    formTags: ['下泄型', '地段型'],
    body: '排水井回执声称下游居民已“自愿承压”，只要确认签收，九号枢纽区就会获得一条更干燥的地下路线。',
    trigger: '水位逼近档案室、消防门维修单需要并单，或玩家检查排水井编号时触发。',
    handling: '确认前必须承认下游代价；拒签会保住下游责任链，但眼前路线继续被水压封住。',
    consequence: '签收能打开地下撤离线索，也会把另一处街区的伤亡写成九号枢纽区的排水收益。',
    echo: '第二章地下商业街和第四章资源模型会读取这张排水井回执是否被确认。',
  },
  {
    id: 'lc-ix-011',
    title: 'LC-IX-011 熟客名单缺页',
    category: '第一章现场档案',
    preview: '便利店熟客名单缺页对应仍在场的居民；完整处置记录需取得现场回执后开放。',
    discoveredReceipts: [
      'notice:LC-IX-011',
      'notice:anomaly=LC-IX-011',
    ],
    handledReceipts: [
      'ch1_customer_list_choice',
      'ch1_customer_list_repair',
    ],
    outcomeKey: 'ch1_customer_list_choice',
    outcomes: {
      truth_by_lin_xiaoman: {
        title: '已由林小满亲手更正缺页',
        consequence: '名单补回真实名字，被恢复的人重新拥有可查证痕迹；另一批边缘居民的通行资格被标成证据冲突，林小满进入创伤状态但仍信任玩家。',
        echo: '后续名单校验会承认这页是真实伤口，便利店清点表更难把林小满记忆归零。',
      },
      protagonist_concealed: {
        title: '已由补办编号代填缺页',
        consequence: '名单表面恢复，林小满暂时少承受一次直视；页脚多出玩家补办编号，市政回声学会用代填掩盖活人被裁走的事实。',
        echo: '后续校验会追索玩家编号，林小满会发现字迹不是她自己的。',
      },
      submitted_to_queue_authority: {
        title: '已移交排队管理处',
        consequence: '当前名单被临时承认，眼前一批人暂时通过核验；缺页原件离开林小满和玩家控制，林小满信任大幅受损。',
        echo: '后续名单校验和便利店清点表会把缺页作为外部权力的证据，排队管理处获得更多谈判空间。',
      },
    },
    dossierStatus: '临时执行',
    civicLine: '户籍档案',
    handlingProtocol: '登记观察',
    formTags: ['物件型'],
    body: '林小满的熟客名单被户籍柜裁走一页，缺页上的人仍站在避难点里，却已经被档案标成“未能证明存在”。',
    trigger: '排水井回执处理后，名单缺页、便利店小票和户籍柜裁口在积水档案室对齐。',
    handling: '可以让林小满亲手更正、由补办编号代填，或移交排队管理处；无论哪种，都要承认被恢复的人会挤压另一批人的通行资格。',
    consequence: '更正能保住真相也会造成林小满创伤；代填能暂时遮住缺口但让市政回声学会借口；移交能换当前有效，却把缺页带离两人控制。',
    echo: '第三章校验失败、第四章便利店模型和林小满最终状态会读取这次名单处置。',
  },
  {
    id: 'lc-ix-012',
    title: 'LC-IX-012 第一处机枢渗水点',
    category: '第一章现场档案',
    preview: '维护节点开始读取临时通行身份；完整处置记录需取得现场回执后开放。',
    discoveredReceipts: ['LC-IX-012', '第一处机枢渗水点', '机枢渗水点'],
    handledReceipts: ['ch1_first_core_leak', 'ch1_core_leak_choice', '实名切断', '临时托管', '假声音继续'],
    outcomeKey: 'ch1_core_leak_choice',
    outcomes: {
      cut_by_real_name: {
        title: '已实名切断维护节点',
        consequence: '假声音被掐断，门外人群重新听见真实指令；代价是市脉机枢开始点名玩家，异象暴露值获得更高下限。',
        echo: '后续广播和终章代办窗口会优先读取玩家补办编号，林小满对玩家的信任暂时稳定，但玩家更难从系统视线里退出。',
      },
      temporary_custody: {
        title: '已临时托管水声',
        consequence: '假声音继续指挥撤离，但每次指令都被迫附带真实代价；这换来一段可用撤离时间，也让市政回声学会借用玩家身份。',
        echo: '后续市政回声会把玩家名字当成临时接口调用，林小满会持续质疑这种托管是否还算玩家自己的声音。',
      },
      false_voice_continues: {
        title: '已放任假声音继续指挥',
        consequence: '眼前秩序迅速恢复，维护盒停止外漏；假声音存下玩家声线，林小满受到创伤，市政回声对玩家身份的信任度提高。',
        echo: '终章会追问有多少撤离命令来自假声音而非玩家本人，林小满对玩家和系统边界的怀疑会持续回响。',
      },
    },
    dossierStatus: '已污染',
    civicLine: '地下外泄',
    handlingProtocol: '断线封存',
    formTags: ['下泄型'],
    body: '维护节点渗出的水会模仿玩家声音指挥居民撤离，把补办编号变成市脉机枢可调用的临时接口。',
    trigger: '消防门、排水井和熟客名单的代价被贴到维护盒侧面后，水声开始读取玩家姓名。',
    handling: '实名切断可以压住假声音；临时托管可争取撤离时间；放任指挥会让流程借玩家身份继续扩散。',
    consequence: '选择决定暴露值下限、林小满创伤程度，以及市政回声是否开始点名玩家。',
    echo: '终章代办窗口和全局暴露结算会读取第一次机枢渗水点的处置方式。',
  },
  {
    id: 'lc-ix-013',
    title: 'LC-IX-013 换乘箭头回环',
    category: '第二章现场档案',
    preview: '高架换乘站的导向箭头会把队伍送回原点；完整处置记录需取得现场回执后开放。',
    discoveredReceipts: ['LC-IX-013', '换乘箭头回环', 'notice:LC-IX-013', 'notice:anomaly=LC-IX-013'],
    handledReceipts: [
      'lc_ix_013_handled',
      'ch2_transfer_arrow_choice',
      '换乘箭头回环已记录',
    ],
    outcomeKey: 'ch2_transfer_arrow_choice',
    outcomes: {
      slowed_for_headcount: {
        title: '已停队清点',
        consequence: '队伍在栏杆内侧暂停核名，换乘速度被主动放慢；被箭头改写的老人恢复部分姓名，路线记录转为慢速稳定。',
        echo: '第三章广播井会优先承认这批人曾经抵达回环路线，第五章低风险撤离口会读取这次慢速稳定记录。',
      },
      tail_name_anchor: {
        title: '已给队尾留名',
        consequence: '前排等待造成换乘效率下降，队尾居民获得人工核验锚点；路线本身仍不稳定，但群众信任开始偏向被保护的人。',
        echo: '后续站厅广播会反复要求核对同行关系，低风险撤离口会把队尾留名视作人工证明而非自动通行资格。',
      },
      public_warning: {
        title: '已公开喊停导向箭头',
        consequence: '队尾暂时保住，但交通片区把玩家补办编号记入扰动记录；路线稳定度转为公开争议，异象暴露明显上升。',
        echo: '第三章广播井会读取这次公开警示，排队管理处后续会把玩家列入需要解释路线异常的人。',
      },
    },
    dossierStatus: '登记观察',
    civicLine: '交通运营',
    handlingProtocol: '错峰限行',
    formTags: ['地段型', '流程型'],
    body: '高架换乘站的箭头会把队伍绕回同一处栏杆；每多绕一圈，队尾就少一名被所有人以为“刚才还在”的居民。',
    trigger: '第一章地下路线线索被带入交通片区，或队伍试图按公共导向快速换乘时触发。',
    handling: '必须在公开箭头异常、牺牲速度维持清点、或让队伍继续按站内规则前进之间选择；任何选择都要留下人数核验记录。',
    consequence: '公开规则能保住部分队尾但会压低群众信任；追求速度会提高路线稳定度，也会让失踪者更难被重新证明曾经同行。',
    echo: '第三章广播井会读取谁抵达过回环路线，第五章低风险撤离口会读取第二章路线稳定度。',
  },
  {
    id: 'lc-ix-014',
    title: 'LC-IX-014 安检口失物招领',
    category: '第二章现场档案',
    preview: '安检口失物招领处出现第一章遗失物；完整处置记录需取得现场回执后开放。',
    discoveredReceipts: ['LC-IX-014', '安检口失物招领', 'notice:LC-IX-014', 'notice:anomaly=LC-IX-014'],
    handledReceipts: ['lc_ix_014_handled', 'ch2_lost_found_choice', '安检口失物招领已记录'],
    outcomeKey: 'ch2_lost_found_choice',
    outcomes: {
      claim_items: {
        title: '已领取并承接未完成事项',
        consequence: '药袋、钥匙和临时通行条缓解了眼前通行与药品压力；失主的未完成事项转入玩家补办编号名下，后续追索会先找到玩家。',
        echo: '第四章档案模型和第五章销号柜台会读取这条承接债务，判断谁把死者或失踪者的事项带出了安检口。',
      },
      witness_refusal: {
        title: '已拒领并留下见证',
        consequence: '物资缺口没有被立刻填补，队伍仍要承担药品和钥匙不足；但见证单阻止系统把“没人领取”写成“确认遗失”。',
        echo: '后续档案会承认这批物品仍有见证人，第四章模型不能直接把原持有人静默销号。',
      },
      transfer_authority: {
        title: '已移交排队管理处收讫',
        consequence: '现场秩序获得短暂承认，排队管理处关系转为交易；失物原件离开玩家和林小满控制，林小满对这次移交留下不信任。',
        echo: '第四章档案模型和第五章销号柜台会优先读取排队管理处证据，玩家需要面对这次换取秩序的权力转移。',
      },
    },
    dossierStatus: '登记观察',
    civicLine: '交通运营',
    handlingProtocol: '登记观察',
    formTags: ['物件型', '流程型'],
    body: '安检口失物招领处会把第一章死者或失踪者的钥匙、药袋和临时通行条重新摆出；领取者会继承原持有人的未完成事项。',
    trigger: '换乘箭头回环形成现场记录后，队伍经过安检口内侧的无人失物窗口时触发。',
    handling: '领取前必须确认物品原持有人是否仍在队伍中；拒领也要留下见证，避免系统把“没人领取”写成“遗失已确认”。',
    consequence: '取回物资能缓解眼前药品、钥匙或通行压力，也会把死者债务转给活人；放弃则重要物资永久缺失。',
    echo: '第四章档案模型和第五章销号柜台会读取谁承接过这些未完成事项。',
  },
  {
    id: 'lc-ix-016',
    title: 'LC-IX-016 站厅广播同一句',
    category: '第二章现场档案',
    preview: '站厅广播反复提醒照看同行人员；完整处置记录需取得现场回执后开放。',
    discoveredReceipts: ['LC-IX-016', '站厅广播同一句', 'notice:LC-IX-016', 'notice:anomaly=LC-IX-016'],
    handledReceipts: ['lc_ix_016_handled', 'ch2_station_broadcast_choice', '站厅广播同一句已记录'],
    outcomeKey: 'ch2_station_broadcast_choice',
    outcomes: {
      full_headcount: {
        title: '已逐项核对同行关系',
        consequence: '队伍停在站厅柱列下重新核对关系，错过一班相对安全的车；换乘速度下降，但同行证明获得人工锚点。',
        echo: '第三章广播井会优先承认这批同行关系曾被现场核验，后续广播更难直接擦掉这些名字。',
      },
      catch_safe_train: {
        title: '已压缩登记赶上列车',
        consequence: '队伍赶上短暂移动窗口，士气暂时回升；未被报出的同行关系被压缩成无效边缘，后续更容易被广播改写。',
        echo: '第三章广播井和第五章低风险撤离口会读取这次压缩登记，追问谁曾被省略在同行名单之外。',
      },
      list_anchor: {
        title: '已由熟客名单锚定同行关系',
        consequence: '林小满用熟客名单背面保住一批同行证明；她的负担和暴露一起上升，名单也更深地接入站厅系统。',
        echo: '第三章名单校验会读取这页背面的手写关系，林小满后续更难从市政回声的核验里退出。',
      },
    },
    dossierStatus: '登记观察',
    civicLine: '电力广播',
    handlingProtocol: '登记观察',
    formTags: ['回声型', '流程型'],
    body: '站厅广播反复播放“请照看好同行人员”；每次播报后，队伍里都会有人忘记自己和谁同行，临时通行条上的同行栏也随之变淡。',
    trigger: '队伍在高架换乘站连续处置路线和失物招领后，准备离开安检口进入站厅柱列时触发。',
    handling: '必须在完整核对、压缩登记赶车、或借林小满熟客名单锚定关系之间选择；任何选择都要承认同行关系正在被广播接管。',
    consequence: '完整核对会牺牲换乘窗口；压缩登记能赶上车但省略弱关系；熟客名单能保住更多人，也会把林小满推到更危险的核验位置。',
    echo: '第三章广播井、名单校验和第五章低风险撤离口会读取队伍完整度与同行关系是否被锚定。',
  },
  {
    id: 'lc-ix-019',
    title: 'LC-IX-019 备用电池借条',
    category: '第二章现场档案',
    preview: '老地铁线的备用电池能救当前照明；完整处置记录需取得现场回执后开放。',
    discoveredReceipts: ['LC-IX-019', '备用电池借条', 'notice:LC-IX-019', 'notice:anomaly=LC-IX-019'],
    handledReceipts: ['lc_ix_019_handled', 'ch2_battery_iou_choice', '备用电池借条已登记'],
    dossierStatus: '登记观察',
    civicLine: '电力广播',
    handlingProtocol: '登记观察',
    formTags: ['物件型'],
    body: '老地铁线的备用电池能让眼前通道恢复照明，但借条会自动写上未来必须断电的一处设施名称。',
    trigger: '队伍照明不足、广播中断，或玩家试图同时保住通行和核验记录时触发。',
    handling: '借用前必须公开未来债务的设施名；拒借需要改走更慢的暗线，并承认当前队伍会承受更高暴露。',
    consequence: '借电能救当前照明和秩序，却会把诊所、广播、泵站或机枢节点中的一处推入未来断电清算。',
    echo: '第四章备用电源和第五章电源争用会读取这张借条是否被签收。',
  },
  {
    id: 'lc-ix-020',
    title: 'LC-IX-020 轨道下方的湿脚印',
    category: '第二章现场档案',
    preview: '轨道下方出现与队伍人数一致的湿脚印；完整处置记录需取得现场回执后开放。',
    discoveredReceipts: ['LC-IX-020', '轨道下方的湿脚印', 'notice:LC-IX-020', 'notice:anomaly=LC-IX-020'],
    handledReceipts: ['lc_ix_020_handled', 'ch2_wet_footprints_choice', '湿脚印标记记录'],
    dossierStatus: '挂起待查',
    civicLine: '地下外泄',
    handlingProtocol: '挂起待查',
    formTags: ['下泄型', '回声型'],
    body: '轨道下方的湿脚印与队伍人数一致，但多出一个倒着走的脚印；它不抢占位置，只抢占“同行者”这个字段。',
    trigger: '队伍沿老地铁线低声清点人数，或有人提议熄灯避开站台巡查时触发。',
    handling: '可花时间逐人标记鞋底，也可保持照明赶路；忽视脚印会让多出的同行者获得后续跟随资格。',
    consequence: '处理会消耗时间和照明，忽视则让队伍被额外同行者标记，后续暴露值更难压低。',
    echo: '第五章管网深处的排队声会读取湿脚印是否被确认。',
  },
  {
    id: 'lc-ix-022',
    title: 'LC-IX-022 免费奇迹券',
    category: '第二章现场档案',
    preview: '地下商业街的券码能兑换任意短缺物资；完整处置记录需取得现场回执后开放。',
    discoveredReceipts: ['LC-IX-022', '免费奇迹券', 'notice:LC-IX-022', 'notice:anomaly=LC-IX-022'],
    handledReceipts: ['lc_ix_022_handled', 'ch2_miracle_coupon_choice', '免费奇迹券兑换记录'],
    dossierStatus: '挂起待查',
    civicLine: '物资供应',
    handlingProtocol: '挂起待查',
    formTags: ['物件型', '流程型'],
    body: '免费奇迹券可以兑换队伍最短缺的物资；收银小票会在结尾写明由哪个片区、哪类人承担这次缺口。',
    trigger: '地下商业街补给不足，或队伍试图用一次兑换补齐药品、食物和照明缺口时触发。',
    handling: '兑换前必须让队伍看见缺口承担者；拒兑能保住后续库存模型的公平性，但当前补给压力不会消失。',
    consequence: '兑换越多，未来库存模型越倾向把代价转给贫弱片区；不兑换则当前队伍必须用更少物资继续移动。',
    echo: '第四章库存算法和小小幸存条件会读取奇迹券兑换记录。',
  },
  {
    id: 'world-linchuan',
    title: '临川市与九号枢纽区',
    category: '背景线索',
    preview: '九号枢纽区的公开背景说明。',
    dossierStatus: '公开说明',
    civicLine: '综合',
    handlingProtocol: '登记观察',
    formTags: ['地段型'],
    body: '长昼之后，通行、配给、排水、广播和登记仍在运行，只是每一道手续都开始反过来处理人。',
    trigger: '进入九号枢纽区临时避难点后即可查阅。',
    handling: '保留通行条、回执和见证人；不要把任何无人负责的流程当成中立工具。',
    consequence: '玩家的补办编号会成为第一章多数手续互相引用的锚点。',
    echo: '后续章节会持续读取九号枢纽区第一天留下的名单、路线和回执。',
  },
  {
    id: 'faction-municipal-echo',
    title: '市政回声',
    category: '势力',
    preview: '仍在自动派单、纠错和归档的旧系统残留。',
    dossierStatus: '挂起待查',
    civicLine: '电力广播',
    handlingProtocol: '挂起待查',
    formTags: ['回声型'],
    body: '旧系统残留的自动工作流仍在派单、纠错和归档，它能提供秩序，也会把人变成流程的附件。',
    trigger: '客服中心、广播、权限表或维护节点开始自动执行时出现。',
    handling: '只接受带代价说明的临时协作；任何“自动优化”都需要人工见证和回执留底。',
    consequence: '依赖它能提高短期协调效率，但会让后续章节更容易把玩家登记为代办人。',
    echo: '第三章权限表和第五章最终工单会结算玩家与市政回声的距离。',
  },
]
