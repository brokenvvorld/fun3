// 第一章：补办窗口不会等人
// 互动小说框架测试桩：本文件当前只用于验证视觉小说式阅读、调查、关键选择、effect 和图鉴信号。
// 不要把这里的旧正文当成最终故事继续修补；第八轮会在新框架上重写第一章。
// 当前应保留的方向只有：任务压力开场、熟人从队伍和名单中消失、补办通行条、保住名字、林小满熟客名单、票据、窗口、队伍和通行条。

INCLUDE chapter-1-zone-a.ink
INCLUDE chapter-1-zone-b.ink
INCLUDE chapter-1-zone-c.ink

VAR protagonist_name = "未核验姓名"
VAR ch1_registry_outcome = "未处理"
VAR ch1_pass_permit_record = "未处理"
VAR ch1_duty_roster_record = "未处理"
VAR ch1_yogurt_inventory_record = "未处理"
VAR ch1_service_center_outcome = "未处理"
VAR ch1_archive_waterline_record = "未处理"
VAR ch1_queue_screen_record = "未处理"
VAR ch1_property_message_record = "未处理"
VAR ch1_fire_door_outcome = "未处理"
VAR ch1_drain_receipt_record = "未处理"
VAR ch1_customer_list_outcome = "未处理"
VAR ch1_first_core_leak_outcome = "未处理"

-> chapter_1

=== chapter_1 ===
// FINAL_REWRITE_ACTIVE: 第八轮第一章新框架入口。普通正文用阅读帧推进，关键处才出现调查和行动。
// LEGACY_ZONES_DISCONNECTED: 旧 zone A/B/C 文件仍保留为测试桩，但不再作为第一章默认正文路径。
# screen:title=第一章：补办窗口不会等人
# screen:location=九号枢纽区临时避难点一号窗口
# notice:chapter=1,goal=补办通行条
# notice:anomaly=LC-IX-001,object=配给盖章机
# notice:anomaly=LC-IX-004,object=临期酸奶清点表
# receipt:LC-IX-001=配给盖章机待核验

一号窗口还没开，取号机已经把{protagonist_name}的号吐出来。纸条带着热，补办编号清楚，姓名栏却写着“待归档”。

傍晚错峰复核前，临时通行条必须补齐。逾时视作缺席补办；缺席补办的人会先丢床位，再丢配给，最后从离开顺序里被顺手擦掉。

林小满站在便利店纸箱旁，怀里夹着熟客名单。她刚把最后几盒临期酸奶摆上桌，队伍前面那个端空碗的周婶忽然停住。

取号机响第二声。周婶不见了。

她不是倒下，也不是跑开。队伍把空位合上，像纸面自动排版。林小满翻开名单，周婶那一行只剩楼栋，没有姓名，没有“给孩子留一盒原味酸奶”的备注。

窗口后的人隔着胶带线说：“当前号票请整理关联材料，否则后续窗口不予受理。”

桌面上有补办号票、熟客名单、通行条复印申请、配给盖章回执和酸奶清点表。{protagonist_name}本来只要保住自己的名字，现在每一张纸都在问：先承认谁还在场。

-> ch1_s01_window_hub

=== ch1_s01_window_hub ===
# screen:title=第一章：补办窗口不会等人
# screen:location=九号枢纽区临时避难点一号窗口
# notice:decision=一号窗口要求确认第一步登记口径
# choice:0:group=document
# choice:0:target=temporary_ticket
# choice:0:label=补办号票
# choice:0:mode=inspect
# choice:0:surface=modal
# choice:0:repeatable=true
# choice:1:group=document
# choice:1:target=customer_list_blank
# choice:1:label=熟客名单空行
# choice:1:mode=inspect
# choice:1:surface=modal
# choice:1:repeatable=true
# choice:2:group=document
# choice:2:target=permit_copy_request
# choice:2:label=通行条申请
# choice:2:mode=inspect
# choice:2:surface=modal
# choice:2:repeatable=true
# choice:3:group=document
# choice:3:target=yogurt_inventory
# choice:3:label=酸奶清点表
# choice:3:mode=inspect
# choice:3:surface=modal
# choice:3:repeatable=true
# choice:4:group=procedure
# choice:4:target=customer_list_headcount
# choice:4:label=熟客名单点人
# choice:4:mode=advance
# choice:4:surface=next_step
# choice:4:repeatable=false
# choice:5:group=procedure
# choice:5:target=permit_ticket_first
# choice:5:label=补办号票
# choice:5:mode=advance
# choice:5:surface=next_step
# choice:5:repeatable=false

+ [压住补办号票，确认截止时间]
    # ui:feedback
    号票边缘还在发热。编号下方写着“傍晚错峰复核前有效”，末尾多了一行浅字：关联材料未整理时，本号可顺延归档。它给了{protagonist_name}一点时间，也把这点时间写成可以被收走的东西。
    -> ch1_s01_window_hub

+ [请林小满指出名单上空掉的那一行]
    # ui:feedback
    林小满的手指压在“三单元”后面。纸上没有周婶的名字，也没有原味酸奶，只剩一小块被铅笔反复写过的灰痕。她说：“我记得她。系统不记得，不代表她没来。”
    -> ch1_s01_window_hub

+ [查看通行条复印申请里有没有周婶]
    # ui:feedback
    复印申请里有三单元的地址，却没有申请人姓名。陪护栏空着，照片栏被水泡成一团。它不像没填完，更像有人刚把能证明人的地方都擦掉。
    -> ch1_s01_window_hub

+ [翻看酸奶清点表，找周婶和孩子的记录]
    # ui:feedback
    清点表原本应该按保质期排序，现在第一行写着“空碗一只，待替代”。林小满看见那几个字，脸色更白：“她不是物资差额。她是来给孩子领东西的人。”
    -> ch1_s01_window_hub

* [把熟客名单摊在窗口边，请队伍先按名字应声]
    # effect:flag=ch1_opening_choice,customer_list_headcount
    # companion:lin_xiaoman=紧绷,trust:+1
    # faction:queue_management=警惕
    # receipt:LC-IX-001=按熟客名单复核在场人员
    窗口后的人没有接名单，只把一张空白回执推出来。抬头不是“失踪”，而是“现场人数与系统记录不一致”。队伍慢下来，至少几个名字重新被人喊了一遍。
    -> ch1_s02_stamp_receipt

* [先把补办号票递进窗口，要求保留自己的姓名栏]
    # effect:flag=ch1_opening_choice,permit_ticket_first
    # exposure:+1
    # district:temporary_shelter=受压
    # receipt:LC-IX-001=补办号票先行进入窗口流程
    号票滑进窗口，章盒立刻吐出一张未来日期的回执。{protagonist_name}的名字还没被擦掉，周婶的位置却被临时划成“空床待替”。
    -> ch1_s02_stamp_receipt

=== ch1_s02_stamp_receipt ===
# screen:title=第一章：配给章盒
# screen:location=一号窗口桌面
# notice:anomaly=LC-IX-001,object=配给盖章机
# notice:anomaly=LC-IX-002,object=临时通行条复印件
# receipt:LC-IX-002=临时通行条复印件待核验

章盒没有通电，仍然自己往外吐回执。第一张写着周婶“已完成安置”，日期是明天；第二张贴着{protagonist_name}的补办编号，照片却是队伍后排另一个人的脸。

林小满把熟客名单压在章盒旁边，说名单不是证件，但它知道谁赊过米、谁给孩子留过酸奶、谁今天确实排过队。

窗口后的人说：“要么按系统回执走，要么你们自己把冲突写清楚。写不清楚，当前号票归档。”

-> ch1_s02_stamp_hub

=== ch1_s02_stamp_hub ===
# screen:title=第一章：配给章盒
# screen:location=一号窗口桌面
# notice:decision=配给章盒和通行条复印件需要一个处置口径
# choice:0:group=document
# choice:0:target=future_receipt
# choice:0:label=未来日期回执
# choice:0:mode=inspect
# choice:0:surface=modal
# choice:0:repeatable=true
# choice:1:group=document
# choice:1:target=permit_photo
# choice:1:label=陌生照片
# choice:1:mode=inspect
# choice:1:surface=modal
# choice:1:repeatable=true
# choice:2:group=document
# choice:2:target=bed_table
# choice:2:label=床位表
# choice:2:mode=inspect
# choice:2:surface=modal
# choice:2:repeatable=true
# choice:3:group=procedure
# choice:3:target=restore_present_names
# choice:3:label=在场名单
# choice:3:mode=advance
# choice:3:surface=next_step
# choice:3:repeatable=false
# choice:4:group=procedure
# choice:4:target=hold_late_arrivals
# choice:4:label=未到场名额
# choice:4:mode=advance
# choice:4:surface=next_step
# choice:4:repeatable=false
# choice:5:group=procedure
# choice:5:target=seal_stamp_box
# choice:5:label=章盒封条
# choice:5:mode=advance
# choice:5:surface=next_step
# choice:5:repeatable=false

+ [查看未来日期回执]
    # ui:feedback
    回执的章面很完整，完整得不像临时避难点能盖出来的东西。它把周婶写成“已安置”，但床位表上那个位置还空着，空得像等人来顶替。
    -> ch1_s02_stamp_hub

+ [核对复印件上的陌生照片]
    # ui:feedback
    照片属于队伍后排的年轻人。他还在场，正低头看自己的通行条。复印件像从他脸上借了一块资格，补在另一个人的材料里。
    -> ch1_s02_stamp_hub

+ [翻床位表，看周婶的位置有没有被占]
    # ui:feedback
    周婶的床位还没给出去，只是备注从“三单元，带孩子”改成了“可替代”。林小满盯着那三个字，半天没有说话。
    -> ch1_s02_stamp_hub

* [撕下错误回执，按现场应声的人重填在场名单]
    ~ ch1_registry_outcome = "恢复在场名单"
    # effect:flag=ch1_registry_outcome,restore_present_names
    # receipt:LC-IX-001 配给盖章机已记录：恢复在场名单
    # receipt:LC-IX-002 临时通行条复印件已记录：限制复印
    # companion:lin_xiaoman=稳定,trust:+2
    你把错误回执从表格上撕下来，要求所有还能应声的人先写回在场名单。队伍效率降了下来，几个排在后面的人开始抱怨，但周婶那一行重新出现了姓名。
    -> ch1_s03_name_cut

* [把未到场名额单独夹出，给可能还在路上的人留位置]
    ~ ch1_registry_outcome = "保留未到场名额"
    # effect:flag=ch1_registry_outcome,hold_late_arrivals
    # exposure:+2
    # district:temporary_shelter=受压
    # receipt:LC-IX-001 配给盖章机已记录：保留未到场名额
    # receipt:LC-IX-002 临时通行条复印件已记录：限量复印
    你没有马上把所有空位填回去，而是把未到场名额单独夹出。眼前有人暂时拿不到床位，路上还没回来的人也没有被系统直接抹掉。
    -> ch1_s03_name_cut

* [把章盒贴封，要求窗口人工核验通行资格]
    ~ ch1_registry_outcome = "贴封章盒"
    # effect:flag=ch1_registry_outcome,seal_stamp_box
    # exposure:+3
    # faction:queue_management=敌对
    # receipt:LC-IX-001 配给盖章机已记录：贴封停用
    # receipt:LC-IX-002 临时通行条复印件已记录：人工核验
    你把胶带绕过章盒底座，封住出纸口。窗口后的人立刻记下{protagonist_name}的补办编号，队伍里有人松了口气，也有人骂出声。
    -> ch1_s03_name_cut

=== ch1_s03_name_cut ===
# screen:title=第一章：熟客名单缺页
# screen:location=临时避难点户籍柜旁
# notice:anomaly=LC-IX-011,object=熟客名单缺页
# receipt:LC-IX-011=熟客名单缺页待核验

户籍柜被推到窗口边，柜门还滴着水。林小满的熟客名单忽然自己翻开，缺页边缘整齐得像被裁刀切走。

缺页对应的人还站在队伍里。有人抱着空碗，有人捏着复印件，有人刚刚应过名。柜门里的登记卡却把他们写成“未能证明存在”。

名单翻到最后，空白处压着{protagonist_name}的补办编号。它没有要求你当工作人员，只给了一个更普通的选择：谁来把这些名字写回去。

-> ch1_s03_name_hub

=== ch1_s03_name_hub ===
# screen:title=第一章：熟客名单缺页
# screen:location=临时避难点户籍柜旁
# notice:decision=熟客名单缺页需要决定由谁更正
# choice:0:group=document
# choice:0:target=cut_page_edge
# choice:0:label=缺页边缘
# choice:0:mode=inspect
# choice:0:surface=modal
# choice:0:repeatable=true
# choice:1:group=person
# choice:1:target=lin_xiaoman
# choice:1:label=林小满
# choice:1:mode=talk
# choice:1:surface=modal
# choice:1:repeatable=true
# choice:2:group=document
# choice:2:target=registry_cards
# choice:2:label=户籍卡
# choice:2:mode=inspect
# choice:2:surface=modal
# choice:2:repeatable=true
# choice:3:group=procedure
# choice:3:target=lin_corrects
# choice:3:label=林小满亲手更正
# choice:3:mode=advance
# choice:3:surface=next_step
# choice:3:repeatable=false
# choice:4:group=procedure
# choice:4:target=protagonist_fills
# choice:4:label=补办编号代填
# choice:4:mode=advance
# choice:4:surface=next_step
# choice:4:repeatable=false
# choice:5:group=procedure
# choice:5:target=hand_to_authority
# choice:5:label=移交排队管理处
# choice:5:mode=advance
# choice:5:surface=next_step
# choice:5:repeatable=false

+ [摸一下缺页边缘]
    # ui:feedback
    纸边干净得过分，没有撕裂毛边，像名单从一开始就少了这一页。可林小满能背出那几个人买过什么，欠过多少，孩子爱喝哪种酸奶。
    -> ch1_s03_name_hub

+ [问林小满能不能背出缺页上的人]
    # ui:feedback
    林小满没有马上回答。她从“周婶，三单元，原味酸奶”开始，一口气说了七个人。说到第五个时，户籍柜里对应的卡片轻轻响了一下。
    -> ch1_s03_name_hub

+ [核对户籍卡上的“未能证明存在”]
    # ui:feedback
    户籍卡上的字不是红章，是打印出来的。最可怕的是那行字没有错误提示，只有一个空签名栏，等着别人承认这些人“不存在”。
    -> ch1_s03_name_hub

* [让林小满按记忆亲手把缺页补回名单]
    ~ ch1_customer_list_outcome = "林小满亲手更正"
    # effect:flag=ch1_customer_list_choice,lin_corrects
    # effect:irreversible=ch1_customer_list_choice,lin_corrects
    # companion:lin_xiaoman=疲惫,trust:+3
    # receipt:LC-IX-011 熟客名单缺页已记录：林小满亲手更正
    林小满一笔一笔写回那些名字。写完以后，名单比原来更重，也更危险：它不再只是便利店账本，而是一份系统必须处理的证词。
    -> ch1_s04_core_leak

* [用自己的补办编号代填缺页，暂时瞒住林小满]
    ~ ch1_customer_list_outcome = "主角代填并隐瞒"
    # effect:flag=ch1_customer_list_choice,protagonist_hidden_fill
    # effect:irreversible=ch1_customer_list_choice,protagonist_hidden_fill
    # exposure:+2
    # companion:lin_xiaoman=紧绷,trust:-1
    # receipt:LC-IX-011 熟客名单缺页已记录：补办编号代填
    你用自己的补办编号顶住空签名栏。名单暂时合上了，林小满也暂时没有发现，但户籍柜把这次代填记成了更方便复用的格式。
    -> ch1_s04_core_leak

* [把缺页和户籍卡一起移交排队管理处]
    ~ ch1_customer_list_outcome = "移交排队管理处"
    # effect:flag=ch1_customer_list_choice,transfer_to_queue_management
    # effect:irreversible=ch1_customer_list_choice,transfer_to_queue_management
    # faction:queue_management=交易
    # companion:lin_xiaoman=疲惫,trust:-2
    # receipt:LC-IX-011 熟客名单缺页已记录：移交排队管理处
    排队管理处很快接走原件，盖了“收讫”。窗口效率恢复了一点，林小满的手却空了。她看着自己怀里少掉的重量，没有再劝你。
    -> ch1_s04_core_leak

=== ch1_s04_core_leak ===
# screen:title=第一章：第一处机枢渗水点
# screen:location=临时避难点维护盒
# notice:anomaly=LC-IX-012,object=第一处机枢渗水点
# receipt:LC-IX-012=第一处机枢渗水点待核验

维护盒在窗口下方渗水。水线没有沿墙往下流，而是沿着补办号票、熟客名单和通行条复印申请的边缘爬。

盒子里传出{protagonist_name}的声音：“按我的名义撤离。当前队伍已完成复核。”

那声音很像你，连犹豫时的停顿都学得像。队伍听见以后安静下来，窗口后的人也抬起头，像终于等到一个可以归档的口令。

林小满把熟客名单按在胸前：“它学会你的名字了。现在要么切断，要么让它继续替你说话。”

-> ch1_s04_core_hub

=== ch1_s04_core_hub ===
# screen:title=第一章：第一处机枢渗水点
# screen:location=临时避难点维护盒
# notice:decision=维护盒正在借主角姓名发出口令
# choice:0:group=document
# choice:0:target=maintenance_box
# choice:0:label=维护盒
# choice:0:mode=inspect
# choice:0:surface=modal
# choice:0:repeatable=true
# choice:1:group=document
# choice:1:target=permit_ticket
# choice:1:label=补办号票
# choice:1:mode=inspect
# choice:1:surface=modal
# choice:1:repeatable=true
# choice:2:group=person
# choice:2:target=crowd
# choice:2:label=队伍反应
# choice:2:mode=inspect
# choice:2:surface=modal
# choice:2:repeatable=true
# choice:3:group=procedure
# choice:3:target=cut_by_real_name
# choice:3:label=实名切断
# choice:3:mode=advance
# choice:3:surface=next_step
# choice:3:repeatable=false
# choice:4:group=procedure
# choice:4:target=temporary_custody
# choice:4:label=临时托管
# choice:4:mode=advance
# choice:4:surface=next_step
# choice:4:repeatable=false
# choice:5:group=procedure
# choice:5:target=let_false_voice_continue
# choice:5:label=放任假声音维持秩序
# choice:5:mode=advance
# choice:5:surface=next_step
# choice:5:repeatable=false

+ [检查维护盒里的水线]
    # ui:feedback
    水线绕过螺丝，贴着纸张边缘往上爬。它没有急着漫出来，像先确认哪些材料能证明一个人，哪些材料能替一个人说话。
    -> ch1_s04_core_hub

+ [看补办号票上的姓名栏]
    # ui:feedback
    姓名栏的“待归档”被水洇开，下面露出{protagonist_name}的名字。名字还在，但旁边多了一个括号：可代发口令。
    -> ch1_s04_core_hub

+ [观察队伍有没有跟着假声音移动]
    # ui:feedback
    前排已经有人转身，后排还在看林小满手里的名单。大家都太累了，一个像真的声音，已经足够让人想相信。
    -> ch1_s04_core_hub

* [报出自己的姓名和补办编号，拔掉维护盒底线]
    ~ ch1_first_core_leak_outcome = "实名切断"
    # effect:flag=ch1_core_leak_choice,cut_by_real_name
    # effect:irreversible=ch1_core_leak_choice,cut_by_real_name
    # exposure:floor=2
    # receipt:LC-IX-012 第一处机枢渗水点已记录：实名切断
    你报出自己的姓名和补办编号，拔掉维护盒底线。假声音停了，队伍也乱了一下。市脉机枢没有忘记这次切断，它把你的名字写进了维护记录。
    -> ch1_end

* [让窗口临时托管口令，要求每句话附带真实代价]
    ~ ch1_first_core_leak_outcome = "临时托管"
    # effect:flag=ch1_core_leak_choice,temporary_custody
    # effect:irreversible=ch1_core_leak_choice,temporary_custody
    # exposure:+3
    # district:temporary_shelter=错峰限行
    # receipt:LC-IX-012 第一处机枢渗水点已记录：临时托管
    你没有立刻切断假声音，而是让窗口把每一句口令都盖上临时托管章。它还能借你的名义说话，但必须把床位、配给和人员代价一起读出来。
    -> ch1_end

* [暂时不拆维护盒，让假声音把队伍稳住]
    ~ ch1_first_core_leak_outcome = "假声音继续"
    # effect:flag=ch1_core_leak_choice,false_voice_continues
    # effect:irreversible=ch1_core_leak_choice,false_voice_continues
    # exposure:+5
    # companion:lin_xiaoman=疲惫,trust:-2
    # receipt:LC-IX-012 第一处机枢渗水点已记录：假声音继续
    假声音继续用你的语气维持秩序。队伍重新动起来，窗口也开始受理材料。林小满看见几个名字被顺手归档，终于把名单从桌边收回去。
    -> ch1_end

=== ch1_end ===
// FINAL_REWRITE_ACTIVE: 第八轮新章尾。保留第二章冻结兼容出口，但不新增第二章内容。
# screen:title=第一章：现场记录归档
# screen:location=九号枢纽区临时避难点出口
# notice:chapter=1,end=补办窗口已关闭
# receipt:chapter-1=配给盖章机,临时通行条复印件,临期酸奶清点表,熟客名单缺页,第一处机枢渗水点
# effect:flag=chapter_1_completed,true

一号窗口的卷帘门落下。{protagonist_name}终于拿到一张临时通行条，章面湿得像刚从维护盒里捞出来。

第一章没有把事情解决。它只是让九号枢纽区第一次把{protagonist_name}的登记姓名、补办编号、通行条、熟客名单和未完成回执放进同一个档案袋。

{ch1_registry_outcome == "恢复在场名单":配给章盒承认了现场应声的人，代价是队伍被拖慢，窗口把{protagonist_name}的补办编号记成“扰动流程”。}
{ch1_registry_outcome == "保留未到场名额":未到场名额被保留下来，眼前床位压力升高，但那些还在路上的人没有被提前写成无效。}
{ch1_registry_outcome == "贴封章盒":章盒被贴封停用，错误回执暂时停了，排队管理处也把{protagonist_name}列进需要重点解释的人。}

{ch1_customer_list_outcome == "林小满亲手更正":熟客名单缺页被林小满亲手补回去。她重新拥有证词，也承担了证词被系统读取的风险。}
{ch1_customer_list_outcome == "主角代填并隐瞒":熟客名单看上去补齐了，页脚却留下{protagonist_name}的补办编号。这个省事格式以后会继续找你。}
{ch1_customer_list_outcome == "移交排队管理处":熟客名单原件被收走，窗口流程顺了半截，林小满手里却少了一份能证明人的东西。}

{ch1_first_core_leak_outcome == "实名切断":第一处机枢渗水点被实名切断，假声音停了，市脉机枢也开始记住{protagonist_name}的补办编号。}
{ch1_first_core_leak_outcome == "临时托管":第一处机枢渗水点被临时托管，假声音还能借{protagonist_name}说话，但每句口令都必须附带真实代价。}
{ch1_first_core_leak_outcome == "假声音继续":假声音继续维持秩序，队伍看起来平稳了，林小满却亲眼看见几个名字被顺手归档。}

林小满把熟客名单重新夹好。她没有问{protagonist_name}做得对不对，只问下一站能不能先找一条不会点名的路。

# choice:0:group=decision
# choice:0:target=transfer_station
# choice:0:label=高架换乘站
# choice:0:mode=advance
# choice:0:surface=next_step
# choice:0:repeatable=false
* [沿社区服务中心出口往高架换乘站移动]
    临时通行条被风吹开，湿章在纸面上洇出一截箭头。它没有写下一站的名字，只把“最近换乘口”四个字压在{protagonist_name}的补办编号上。
    -> chapter_2_entry

=== chapter_2_entry ===
// FROZEN_COMPAT_ONLY: 第二章冻结兼容测试入口。只保留现有 LC-IX-013 / LC-IX-014 / LC-IX-016 路径用于验证跨章、图鉴和状态恢复。
// DO_NOT_EXPAND_CHAPTER_2: 不要新增第二章异象、分支、图鉴条目或 chapter-2.ink 拆分，除非用户再次明确要求。
# screen:title=第二章：换乘站台在移动
# screen:location=高架换乘站外环换乘口
# notice:chapter=2,zone=A,range=LC-IX-013_to_LC-IX-016
# notice:anomaly=LC-IX-013,object=换乘箭头回环
# notice:route_stability=未判定
# receipt:LC-IX-013=换乘箭头回环待核验
# choice:0:group=document
# choice:0:target=temporary_pass
# choice:0:label=临时通行条
# choice:0:mode=compare
# choice:0:surface=modal
# choice:0:repeatable=true
# choice:1:group=person
# choice:1:target=lin_xiaoman
# choice:1:label=林小满
# choice:1:mode=talk
# choice:1:surface=modal
# choice:1:repeatable=true
# choice:2:group=place
# choice:2:target=transfer_arrow
# choice:2:label=换乘箭头
# choice:2:mode=advance
# choice:2:surface=next_step
# choice:2:repeatable=false

高架换乘站的导向牌没有坏。每一块都亮着，每一块都指向“最近换乘口”。问题是，{protagonist_name}第三次看见同一只湿脚印时，队伍末尾那位老人已经不再回答自己的名字。

广播没有播站名，只播“请按箭头有序换乘”。箭头从墙面、地砖和临时通行条上同时转向同一处栏杆，像市脉机枢在用最省事的办法把人群重新排成可处理的材料。

林小满把熟客名单按在胸口：“这不是迷路。它在让我们按它的路线补办。”

+ [核对临时通行条上的换乘方向]
    通行条的湿章还没有干，箭头却已经盖过了错峰通行字样。纸角渗出的站名和补办编号互相压住，像在争谁更有资格决定下一步。
    -> chapter_2_entry
+ [让林小满清点同行的人]
    林小满把熟客名单翻到最后一页，又从第一行重新数。人数没有马上少下去，名字却少了一个；队尾没有人承认自己认识那个空出来的姓氏。
    -> chapter_2_entry
* [跟着换乘箭头走一次]
    -> chapter_2_arrow_loop_first

=== chapter_2_arrow_loop_first ===
# screen:title=第二章：换乘箭头回环
# screen:location=高架换乘站同一处栏杆
# notice:chapter=2,zone=A,range=LC-IX-013_to_LC-IX-016
# notice:anomaly=LC-IX-013,object=换乘箭头回环
# notice:route_stability=未判定
# receipt:LC-IX-013=换乘箭头回环待核验
# effect:flag=chapter_2_entry_reached,true
# choice:0:group=procedure
# choice:0:target=headcount
# choice:0:label=人数清点
# choice:0:mode=advance
# choice:0:surface=next_step
# choice:0:repeatable=false
# choice:1:group=person
# choice:1:target=crowd
# choice:1:label=队尾
# choice:1:mode=advance
# choice:1:surface=next_step
# choice:1:repeatable=false
# choice:2:group=place
# choice:2:target=transfer_arrow
# choice:2:label=导向牌
# choice:2:mode=advance
# choice:2:surface=next_step
# choice:2:repeatable=false

{protagonist_name}带着队伍沿箭头走过一次。二十七级台阶、两段封住的扶梯、一面写着“便民换乘”的公告墙，全都按顺序出现，也全都把人送回同一处栏杆。

这一次，队伍末尾没有少出一个空位。更糟的是，队尾老人胸前的姓名牌变成了“已换乘”。他还站在那里，却没人能在名单上找到能叫住他的名字。

林小满把笔帽咬出一道白痕：“先停。再走一次之前，我们得知道它到底要我们交什么。”

档案袋把 LC-IX-013 暂时压在最上层：发现已成立，路线稳定度未判定。下一步不能再只按箭头走。

* [把队伍按名单停在栏杆内侧，重新清点到名字对上]
    -> ch2_transfer_arrow_slowed_for_headcount
* [让前排原地等候，带林小满回到队尾认人]
    -> ch2_transfer_arrow_tail_anchor
* [站到导向牌下，喊停还在按箭头走的人]
    -> ch2_transfer_arrow_public_warning

=== ch2_transfer_arrow_slowed_for_headcount ===
# screen:title=第二章：换乘箭头处置回执
# screen:location=高架换乘站同一处栏杆
# notice:chapter=2,zone=A,range=LC-IX-013_to_LC-IX-016
# notice:anomaly=LC-IX-013,object=换乘箭头回环
# notice:route_stability=慢速稳定
# effect:flag=ch2_transfer_arrow_choice,slowed_for_headcount
# effect:flag=ch2_route_stability,slow_stable
# effect:flag=ch2_crowd_trust,recorded_headcount
# exposure:+2
# district:transfer_station=错峰限行
# districtExposure:transfer_station=3
# companion:lin_xiaoman=稳定,trust:+2
# receipt:LC-IX-013 换乘箭头回环已记录：停队清点

{protagonist_name}让队伍在栏杆内侧坐下，按林小满的熟客名单、临时通行条和现场人脸一项项对。广播催了三遍“请继续换乘”，每催一遍，墙上的箭头就往地砖里沉一分。

半小时被耗在同一处栏杆前。队伍没有前进，至少也没有再把活人写成“已换乘”。那个老人胸前的姓名牌恢复了姓，名字后半截仍像被水泡过。

林小满把名单合上，说：“慢一点也算一种路线。至少它承认我们还在数人。”

处置回执写下慢速稳定：后续路线会更容易被核验，但错过的换乘窗口会转成新的滞留压力。

* [带着回环记录走向安检口旁的失物招领处]
    -> chapter_2_lost_and_found_entry

=== ch2_transfer_arrow_tail_anchor ===
# screen:title=第二章：换乘箭头处置回执
# screen:location=高架换乘站同一处栏杆
# notice:chapter=2,zone=A,range=LC-IX-013_to_LC-IX-016
# notice:anomaly=LC-IX-013,object=换乘箭头回环
# notice:route_stability=队尾保留
# effect:flag=ch2_transfer_arrow_choice,tail_name_anchor
# effect:flag=ch2_route_stability,fragile_tail_kept
# effect:flag=ch2_crowd_trust,tail_protected
# exposure:+4
# district:transfer_station=错峰限行
# districtExposure:transfer_station=5
# companion:lin_xiaoman=疲惫,trust:+3
# receipt:LC-IX-013 换乘箭头回环已记录：队尾留名

{protagonist_name}让前排不要动，自己和林小满逆着箭头回到队尾。每走一步，导向牌都把“最近换乘口”改成更短的距离，像在提醒前排正在失去耐心。

林小满抓住那个老人的袖口，逼他把自己的名字、楼栋和常买的东西都说出来。名字说到第三遍，姓名牌才停止变字。队伍前面有人开始抱怨，后面的人却第一次敢把手搭在栏杆上。

这条路没有变稳，只是队尾暂时不再被静悄悄地收走。

处置回执写下队尾留名：后续路线需要更多人工核对，群众信任会偏向被保护的人，换乘效率会持续下降。

* [带着回环记录走向安检口旁的失物招领处]
    -> chapter_2_lost_and_found_entry

=== ch2_transfer_arrow_public_warning ===
# screen:title=第二章：换乘箭头处置回执
# screen:location=高架换乘站同一处栏杆
# notice:chapter=2,zone=A,range=LC-IX-013_to_LC-IX-016
# notice:anomaly=LC-IX-013,object=换乘箭头回环
# notice:route_stability=公开警示
# effect:flag=ch2_transfer_arrow_choice,public_warning
# effect:flag=ch2_route_stability,public_contested
# effect:flag=ch2_crowd_trust,alarmed_truth
# exposure:+8
# district:transfer_station=贴封管控
# districtExposure:transfer_station=8
# faction:queue_management=警惕
# companion:lin_xiaoman=稳定,trust:+1
# receipt:LC-IX-013 换乘箭头回环已记录：公开警示

{protagonist_name}站到导向牌下，喊停还在按箭头走的人。声音比广播慢半拍，却终于让几个人停下脚。栏杆旁的摄像头同时转过来，像听见了不该由补办人说出口的话。

人群先乱了一下，然后有人开始把孩子和老人往中间拢。排队管理处的人隔着胶带线记录{protagonist_name}的补办编号，广播把“有序换乘”改成“现场存在未经确认的扰动”。

林小满没有拦{protagonist_name}。她只把熟客名单举起来，让后排也看见那位老人还写在纸上。

处置回执写下公开警示：队尾暂时保住，路线稳定度变成争议记录；从这一刻起，交通片区会把{protagonist_name}当作主动暴露异象的人。

* [带着回环记录走向安检口旁的失物招领处]
    -> chapter_2_lost_and_found_entry

=== chapter_2_lost_and_found_entry ===
# screen:title=第二章：安检口失物招领
# screen:location=高架换乘站安检口内侧
# notice:chapter=2,zone=A,range=LC-IX-013_to_LC-IX-016
# notice:anomaly=LC-IX-014,object=安检口失物招领
# notice:lost_found_state=待核验
# receipt:LC-IX-014=安检口失物招领待核验
# choice:0:group=document
# choice:0:target=lost_keys
# choice:0:label=钥匙串
# choice:0:mode=compare
# choice:0:surface=modal
# choice:0:repeatable=true
# choice:1:group=document
# choice:1:target=medicine_bag
# choice:1:label=药袋
# choice:1:mode=compare
# choice:1:surface=modal
# choice:1:repeatable=true
# choice:2:group=document
# choice:2:target=temporary_pass_stack
# choice:2:label=通行条夹层
# choice:2:mode=compare
# choice:2:surface=modal
# choice:2:repeatable=true
# choice:3:group=procedure
# choice:3:target=lost_found_form
# choice:3:label=失物招领登记单
# choice:3:mode=advance
# choice:3:surface=next_step
# choice:3:repeatable=false

安检口旁边的失物招领处还亮着灯。玻璃柜里没有手机和钱包，只有钥匙、药袋和几张湿过又烘干的临时通行条。每件物品下面都夹着同一张小票：已完成事项可由领取者继续办理。

林小满认出其中一把钥匙：“这不是刚才队尾那个老人的吗。他还在我们后面。”她说完又看了看队伍，声音低下去，“至少，他刚才还在。”

失物招领窗口没有工作人员，只有一只安检筐自动往外滑。筐底印着提示：领取即视为承接原持有人未完成事项，拒领即视为确认遗失。

+ [核对钥匙串上的楼栋牌]
    钥匙串上挂着一块旧塑料牌，楼栋号被磨掉一半，背面却新刻了“已安置床位待归还”。林小满把钥匙举到灯下，钥匙齿缝里还卡着社区服务中心的湿纸屑。
    -> chapter_2_lost_and_found_entry
+ [翻看药袋外侧的姓名贴]
    药袋上的姓名贴被重新贴过，原名下方压着一个更浅的名字。药片数量刚好够撑到下一站，也刚好不够给两个人分。
    -> chapter_2_lost_and_found_entry
+ [检查通行条夹层里的旧照片]
    通行条夹层里有几张从第一章窗口流出的旧照片，照片背面写着“未完成事项：代领、送药、归还钥匙”。每一项后面都留着空白签名栏。
    -> chapter_2_lost_and_found_entry
* [拿走药袋和钥匙，当场写下自己的补办编号]
    -> ch2_lost_found_claim_items
* [不领取物品，请林小满和两名居民留下见证]
    -> ch2_lost_found_witness_refusal
* [把失物招领登记单交给排队管理处盖收讫章]
    -> ch2_lost_found_transfer_authority

-> END

=== ch2_lost_found_claim_items ===
# screen:title=第二章：失物招领处置回执
# screen:location=高架换乘站安检口内侧
# notice:chapter=2,zone=A,range=LC-IX-013_to_LC-IX-016
# notice:anomaly=LC-IX-014,object=安检口失物招领
# notice:lost_found_state=已领取承接
# effect:flag=ch2_lost_found_choice,claim_items
# effect:flag=ch2_lost_found_debt,claimed_by_protagonist
# effect:resource=medicine,+1
# exposure:+5
# district:transfer_station=错峰限行
# districtExposure:transfer_station=4
# companion:lin_xiaoman=疲惫,trust:+1
# receipt:LC-IX-014 安检口失物招领已记录：领取承接

{protagonist_name}把药袋、钥匙和最上面那张临时通行条放进档案袋，签名栏立刻把“原持有人”划掉，只留下{protagonist_name}的补办编号。

药片能撑过下一段拥堵，钥匙也许能打开老人留下的安置床位。安检筐却没有缩回去，它把一叠未完成事项推到玻璃边：代领、送药、归还钥匙，后面都补上了同一个新名字。

林小满看见那行字，先松一口气，又把档案袋按得更紧：“这些东西现在救得了人。等它们开始找旧主人时，系统会先找你。”

处置回执写下领取承接：眼前物资得到补足，失主的未完成事项转入{protagonist_name}名下；第四章档案模型和第五章销号柜台会读取这条承接债务。

* [带着广播里的同行提示离开安检口]
    -> chapter_2_repeated_broadcast_entry

-> END

=== ch2_lost_found_witness_refusal ===
# screen:title=第二章：失物招领处置回执
# screen:location=高架换乘站安检口内侧
# notice:chapter=2,zone=A,range=LC-IX-013_to_LC-IX-016
# notice:anomaly=LC-IX-014,object=安检口失物招领
# notice:lost_found_state=拒领留证
# effect:flag=ch2_lost_found_choice,witness_refusal
# effect:flag=ch2_lost_found_debt,witnessed_unclaimed
# exposure:+2
# district:transfer_station=错峰限行
# districtExposure:transfer_station=2
# companion:lin_xiaoman=稳定,trust:+2
# receipt:LC-IX-014 安检口失物招领已记录：拒领留证

{protagonist_name}没有碰玻璃柜里的东西，只让林小满和队伍里两名还记得老人的居民在登记单边缘签下见证。签名写到第三个，安检筐底部的提示从“确认遗失”改成“暂不结案”。

药袋仍在柜里，钥匙也不能带走。队伍前排有人低声抱怨，说下一站没有药就撑不过去。林小满把那张见证单夹进档案袋，声音很低：“至少它不能把人说成没人要了。”

玻璃柜里的临时通行条翻起一角，像在等下一次无人认领。

处置回执写下拒领留证：眼前物资缺口继续存在，但失物没有被系统确认为无人承接；后续档案会承认这批物品仍有见证人，而不是被静默销号。

* [带着广播里的同行提示离开安检口]
    -> chapter_2_repeated_broadcast_entry

-> END

=== ch2_lost_found_transfer_authority ===
# screen:title=第二章：失物招领处置回执
# screen:location=高架换乘站安检口内侧
# notice:chapter=2,zone=A,range=LC-IX-013_to_LC-IX-016
# notice:anomaly=LC-IX-014,object=安检口失物招领
# notice:lost_found_state=移交管理
# effect:flag=ch2_lost_found_choice,transfer_authority
# effect:flag=ch2_lost_found_debt,transferred_to_queue_management
# exposure:+3
# faction:queue_management=交易
# district:transfer_station=错峰限行
# districtExposure:transfer_station=3
# companion:lin_xiaoman=疲惫,trust:-1
# receipt:LC-IX-014 安检口失物招领已记录：移交收讫

{protagonist_name}把登记单送到排队管理处。窗口后的人没有问失主是谁，只在右上角盖了“收讫”，又把钥匙、药袋和临时通行条一件件装进透明证物袋。

队伍的通行秩序很快变顺。广播把“失物待领”改成“物证已移交”，前排的人不再盯着玻璃柜，排队管理处却多看了{protagonist_name}的档案袋一眼。

林小满跟在旁边，没有当场反对。等回到安检口，她才说：“他们现在替我们保管证据，也替我们决定谁还能拿回这些东西。”

处置回执写下移交收讫：现场秩序获得短暂承认，失物原件离开玩家和林小满控制；第四章档案模型会把排队管理处列为优先证据来源。

* [带着广播里的同行提示离开安检口]
    -> chapter_2_repeated_broadcast_entry

-> END

=== chapter_2_repeated_broadcast_entry ===
# screen:title=第二章：站厅广播同一句
# screen:location=高架换乘站站厅柱列
# notice:chapter=2,zone=A,range=LC-IX-013_to_LC-IX-016
# notice:anomaly=LC-IX-016,object=站厅广播同一句
# notice:broadcast_sentence_state=待核验
# receipt:LC-IX-016=站厅广播同一句待核验
# choice:0:group=document
# choice:0:target=broadcast_loop
# choice:0:label=广播内容
# choice:0:mode=compare
# choice:0:surface=modal
# choice:0:repeatable=true
# choice:1:group=person
# choice:1:target=companions
# choice:1:label=同行关系
# choice:1:mode=compare
# choice:1:surface=modal
# choice:1:repeatable=true

站厅广播重复同一句：“请照看好同行人员。”第一遍还像普通提醒，第二遍后，队伍里有人突然松开手，说自己只是跟着人群走，不认识身边的亲属。

柱列之间的灯一明一暗。每暗一次，某个人胸前的临时通行条都会把“同行”两个字擦淡一点，像在替队伍删掉关系证明。

林小满把熟客名单翻到背面，那里原本什么都没有，现在却多出一行空白表格：同行关系临时核验。

+ [听完广播第二遍]
    第二遍广播结束时，一个孩子先忘了自己牵着谁，又很快因为那只手的温度哭出声。广播没有变大，只是更准地落在每个人迟疑的地方。
    -> chapter_2_repeated_broadcast_entry
+ [核对临时通行条上的同行栏]
    通行条上的同行栏没有消失，只是从姓名变成了“可由现场广播确认”。林小满盯着那行字，像盯着一张刚刚学会撒谎的表格。
    -> chapter_2_repeated_broadcast_entry
* [停在站厅柱下，逐个核对谁和谁同行]
    -> ch2_broadcast_headcount_anchor
* [赶上下一班车，只让每户报出一个同行名字]
    -> ch2_broadcast_catch_train
* [请林小满把同行关系写到熟客名单背面]
    -> ch2_broadcast_list_anchor

-> END

=== ch2_broadcast_headcount_anchor ===
# screen:title=第二章：站厅广播处置回执
# screen:location=高架换乘站站厅柱列
# notice:chapter=2,zone=A,range=LC-IX-013_to_LC-IX-016
# notice:anomaly=LC-IX-016,object=站厅广播同一句
# notice:broadcast_sentence_state=逐项核对
# effect:flag=ch2_station_broadcast_choice,full_headcount
# effect:flag=ch2_broadcast_companion_state,manual_verified
# exposure:+2
# district:transfer_station=错峰限行
# districtExposure:transfer_station=2
# companion:lin_xiaoman=稳定,trust:+1
# receipt:LC-IX-016 站厅广播同一句已记录：逐项核对

{protagonist_name}让队伍停在柱列内侧，一户一户报同行关系。广播又响了三次，每次都试图把“同行人员”四个字读得更像命令。

核对很慢。下一班车的门在远处关上，带走一段相对安全的空档。可那些被点到名字的人重新抓住彼此的袖口，临时通行条上的同行栏也恢复成手写字。

林小满把最后一组关系画上圈，说：“慢一点至少还能知道少了谁。”

处置回执写下逐项核对：队伍完整度获得人工证明，换乘速度继续下降；第三章广播井会优先承认这批同行关系曾被现场核验。

-> END

=== ch2_broadcast_catch_train ===
# screen:title=第二章：站厅广播处置回执
# screen:location=高架换乘站站厅柱列
# notice:chapter=2,zone=A,range=LC-IX-013_to_LC-IX-016
# notice:anomaly=LC-IX-016,object=站厅广播同一句
# notice:broadcast_sentence_state=压缩登记
# effect:flag=ch2_station_broadcast_choice,catch_safe_train
# effect:flag=ch2_broadcast_companion_state,compressed_names
# effect:resource=morale,+2
# exposure:+5
# district:transfer_station=错峰限行
# districtExposure:transfer_station=5
# companion:lin_xiaoman=疲惫,trust:-1
# receipt:LC-IX-016 站厅广播同一句已记录：压缩登记

{protagonist_name}没有让队伍完全停下，只要求每户在上车前报出一个同行名字。广播立刻顺着这个空隙改口：“同行人员以最后报备为准。”

车门终于在眼前打开。几个人因为赶上这一班车而松了口气，也有几张脸在进门后才发现，自己只被别人报成了“同行之一”。

林小满把名单攥得发皱：“我们赶上了车，也给它留下了删人的格式。”

处置回执写下压缩登记：队伍获得短暂士气和移动窗口，但同行关系被压缩成单名证明；后续广播会更容易把未被报出的关系判为无效。

-> END

=== ch2_broadcast_list_anchor ===
# screen:title=第二章：站厅广播处置回执
# screen:location=高架换乘站站厅柱列
# notice:chapter=2,zone=A,range=LC-IX-013_to_LC-IX-016
# notice:anomaly=LC-IX-016,object=站厅广播同一句
# notice:broadcast_sentence_state=熟客名单锚定
# effect:flag=ch2_station_broadcast_choice,list_anchor
# effect:flag=ch2_broadcast_companion_state,lin_list_anchor
# exposure:+3
# district:transfer_station=错峰限行
# districtExposure:transfer_station=3
# companion:lin_xiaoman=疲惫,trust:+2
# receipt:LC-IX-016 站厅广播同一句已记录：名单锚定

林小满把熟客名单翻到背面，让每个人把同行关系写在她平时记账的位置。广播每念一次“请照看好同行人员”，纸面就多压下一道湿痕，像要把这份名单也接进站厅系统。

她没有停笔。便利店的熟客、临时避难点的邻居、刚刚在安检口互相作证的人，都被她写到一起。

“先让它知道我们是怎么记人的。”她说，“以后它要改，也得先改我的字。”

处置回执写下名单锚定：同行关系获得林小满的人工证明，她的负担和暴露一起上升；第三章名单校验会读取这页背面的手写关系。

-> END
