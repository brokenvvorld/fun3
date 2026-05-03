// 第一章片区 B：社区服务中心
// 覆盖 LC-IX-005 至 LC-IX-008。只在本片区内承接、调查、办理与分支。

=== ch1_zone_b_entry ===
# screen:title=第一章片区 B：社区服务中心
# screen:location=社区服务中心一楼大厅
# notice:LC-IX-005=末日客服中心/窗口办件/流程型+回声型
# notice:LC-IX-006=地下档案室水线/户籍档案/地段型
# notice:LC-IX-007=叫号屏倒序/电力广播/回声型
# notice:LC-IX-008=物业群第404条消息/社区楼院/挂起待查
# district:service_center=正常通行
# exposure:+2

社区服务中心的玻璃门被人用胶带贴成半开，像一张终于学会少说话的嘴。门口的体温枪还在亮，屏幕上显示“请保持一米距离”，实际队伍已经把一米拆成了三种用途：站人、放包、让孩子蹲着睡。

大厅正中挂着叫号屏。号码不是从小到大，而是像水位一样上下浮动。广播每隔半分钟就念一次：“请 A 类、B 类、临时补办类、未核验类居民按窗口提示办理。”窗口后面没有人，只有一台针式打印机在空桌上发抖，打出的纸带被风扇吹到地上，像一串不愿承认自己是证据的白色舌头。

林小满把熟客名单夹在胳膊下。她没有再问{protagonist_name}是不是确定要进来，只把临期酸奶袋子往脚边挪了挪，免得被排队的人踩破。

上一片区留下的号票在材料袋里发热，窗口方向、打印角、地下楼梯和身边的林小满同时给出不同压力。进入大厅后的第一步会决定这些手续先把{protagonist_name}认作办事人、见证人，还是插队的人。

* [把上一张号票夹进补办材料，先承认它正在追着{protagonist_name}走。]
    # receipt:承接号票=补办材料与自动号票并袋
    # effect:flag=ch1_zone_b_entry_action,accepted_ticket
    号票边缘很薄，夹进材料袋时却硌得像金属。背面多出一行小字：请到社区服务中心确认“已解决事项”。
    -> ch1_zone_b_lobby_pressure
* [先确认林小满还能不能继续握住熟客名单。]
    # companion:lin_xiaoman=稳定,trust:+1
    # effect:flag=ch1_zone_b_entry_action,checked_on_lin
    林小满说她撑得住，只是别让她再听见“请耐心等待”。她说这句话时，广播刚好补了一句“感谢等待”，她对着天花板很客气地点了点头。
    -> ch1_zone_b_lobby_pressure
* [退到大厅侧面，先看清窗口、打印角和地下楼梯的位置。]
    # effect:flag=ch1_zone_b_entry_action,mapped_lobby
    # exposure:+1
    一楼能看见三个危险来源：不停吐票的取号机、没有联网却亮着的打印角、以及通往地下档案室的楼梯。三个地方都在假装自己只是普通设备。
    -> ch1_zone_b_lobby_pressure
* [趁收件槽弹开，把补办手续先递到窗口边缘。]
    # faction:queue_management=警惕
    # effect:flag=ch1_zone_b_entry_action,pushed_window
    后排有人立刻咳了一声，像替整个队伍按下投诉键。窗口下方的收件槽弹开，里面空空的，却传来一声“材料不齐”。
    -> ch1_zone_b_lobby_pressure

=== ch1_zone_b_lobby_pressure ===
# screen:title=LC-IX-005 末日客服中心
# screen:location=社区服务中心办事大厅
# notice:pressure=广播/打印/叫号持续运行

{protagonist_name}和林小满刚进大厅，取号机就吐出三张票。第一张写“投诉合并”，第二张写“户籍复核”，第三张写“楼栋消息补印”。三张票的时间戳相同，像这座大厅认为所有麻烦都可以排进同一分钟。

窗口上方的电子牌亮起“1 号综合窗口”。灯亮了三秒，又变成“请稍候”。大厅里的人同时松口气，又同时紧张起来，因为“稍候”在临川市从来不是时间单位，更像一种行政天气。

如果继续等，三张票会自己进入队列；如果直接办，窗口可能把缺项盖成完成。{protagonist_name}需要先找出大厅认定“事项”的方式，再决定把哪一条线交给机器。

* [先读公告栏，把新贴的办件说明从旧胶印里撕出来。]
    # notice:window=综合窗口将投诉、撤离、床位、维修和物资合并办理
    # effect:flag=ch1_service_notice_read,true
    公告栏上有七层纸。最外层写着“简化流程”，下面一层写着“暂停人工受理”，再往下才是手写的“别让机器替{protagonist_name}点完成”。手写字的墨迹没有干。
    -> ch1_zone_b_first_window
* [先检查取号机出纸口，确认它是不是按人派单。]
    # receipt:取号机纸带=三类工单同号同刻
    # effect:flag=ch1_ticket_spool_checked,true
    纸带里有空号，也有重复号。最怪的是一张无姓名票，补办编号却和{protagonist_name}的临时编号相似，只差最后一位。
    -> ch1_zone_b_first_window
* [先让林小满把熟客名单收好，不要让机器扫到。]
    # companion:lin_xiaoman=稳定,trust:+1
    # effect:flag=ch1_customer_list_hidden_at_center,true
    林小满把名单塞进外套内袋，嘴上说“我又不是第一次防检查”，手却把拉链拉了两遍。
    -> ch1_zone_b_first_window
* [先安抚后排队伍，说明会查清机器再递材料。]
    # faction:queue_management=交易
    # effect:flag=ch1_queue_crowd_briefed,true
    {protagonist_name}没有承诺马上解决，只承诺每个动作都会当场说清。队伍里有人不满，但至少没有再往前挤。排队管理处的袖标志愿者看了{protagonist_name}一眼，没有拦。
    -> ch1_zone_b_first_window

=== ch1_zone_b_first_window ===
# screen:title=LC-IX-005 综合窗口自助受理
# screen:location=社区服务中心 1 号综合窗口
# notice:LC-IX-005=自动结案风险

一号窗口里没有工作人员，只有收件槽、扫描板和一枚盖章机。盖章机压在一张空白回执上，回执抬头已经打印好：本事项已完成。

广播换成温柔女声：“如无工作人员，请按机器提示自助办理。”这句话让大厅里的人更安静。大家都知道，在临川市，机器提示通常比工作人员更难通融。

扫描板已经亮起，收件槽也在等纸。它们想要一个可处理对象，而{protagonist_name}还没有弄清这个对象会是补办材料、空白回执、林小满的名单，还是整个大厅的等待。

* [把补办材料放到扫描板边缘，不让它完整读取。]
    # effect:flag=ch1_window_materials_edge_scanned,true
    # exposure:+2
    扫描板闪了一下，显示“材料存在，身份待确认”。这比“身份不存在”好一点，但好得有限。
    -> ch1_zone_b_service_center_branch
* [先递一张空白纸，测试盖章机是否会自动结案。]
    # receipt:空白测试回执=机器可将无内容事项标记完成
    # effect:flag=ch1_blank_receipt_tested,true
    盖章机咔哒一声，空白纸上多了“已受理”。旁边一个阿姨小声说这比以前快多了，又马上捂住自己的嘴。
    -> ch1_zone_b_service_center_branch
* [询问袖标志愿者，今天是谁授权自助受理。]
    # faction:queue_management=交易
    # effect:flag=ch1_volunteer_authority_asked,true
    志愿者说授权单早上贴过，后来被打印机吃了。他指了指打印角，表情像把锅交给了更大的锅。
    -> ch1_zone_b_service_center_branch
* [让林小满念出熟客名单前三个名字，看叫号屏有没有反应。]
    # companion:lin_xiaoman=稳定,trust:+1
    # effect:flag=ch1_names_tested_on_screen,true
    第一个名字没反应，第二个名字让屏幕跳了一位，第三个名字刚出口，打印机远远响了一下。林小满立刻闭嘴。
    -> ch1_zone_b_service_center_branch
* [按窗口要求补一份“情况说明”，用最普通的语气写。]
    # receipt:情况说明=未核验姓名与临时编号
    # effect:flag=ch1_plain_statement_written,true
    {protagonist_name}写“因避难转移遗失通行条，申请补办”。这行字没有触发异响，反而让{protagonist_name}觉得荒唐：正常句子在这里已经像一种防护符。
    -> ch1_zone_b_service_center_branch

=== ch1_zone_b_service_center_branch ===
# screen:title=LC-IX-005 未解决事项清零
# screen:location=社区服务中心综合窗口
# notice:choice=取号机处理方式

墙上的“未解决事项”从 127 跳到 126。没有人欢呼，因为没人知道少掉的是投诉、撤离名额，还是某个人在系统里的存在。取号机又吐出一张票，票面写着“请确认是否完成”。

纸面已经把大厅逼成一个确认问题：继续运行能暴露工单去向，却会让数字继续减少；停机能保住等待者姓名，却会让所有号码失去解释；分拣急件则等于承认有些事项要先被放下。

* [继续派单：让取号机保持运行，沿工单编号追踪市政回声。]
    # effect:flag=ch1_service_center_outcome,left_running
    # effect:flag=flag_ticket_machine_left_running,true
    # faction:municipal_echo=交易
    # exposure:+8
    {protagonist_name}按下“继续”。未解决事项继续下降，但每少一个数字，楼梯间就多一声回音。林小满说这听起来不像好消息，{protagonist_name}说至少它给了下一步地址。
    -> ch1_zone_b_archive_stairs
* [停机复核：拔掉取号机电源，把等待者登记成需人工复核。]
    # effect:flag=ch1_service_center_outcome,stopped_for_manual_review
    # faction:municipal_echo=警惕
    # district:service_center=贴封管控
    机器黑下去的一瞬间，大厅里的号码全部失去意义。后排有人骂，{protagonist_name}没有反驳，只把“需人工复核”写在最上面的登记簿封面。
    -> ch1_zone_b_archive_stairs
* [分拣急件：只处理医疗、撤离和门禁相关号码，其余封袋。]
    # effect:flag=ch1_service_center_outcome,triage_only
    # faction:queue_management=信任
    # exposure:+4
    {protagonist_name}把号票分成两摞。封袋里的纸还在翻动，像有人在里面补填理由；急件全部指向地下档案室，连门禁维修单也不例外。
    -> ch1_zone_b_archive_stairs

=== ch1_zone_b_archive_stairs ===
# screen:title=LC-IX-006 地下档案室水线
# screen:location=社区服务中心地下楼梯
# notice:LC-IX-006=档案水线正在改写记录
# district:service_center=积水待排

地下楼梯的灯管一节亮一节灭。每灭一次，广播就从一楼飘下来：“请不要在非办理区域逗留。”水从档案室门缝里淌出，带着纸浆和印泥味。地面上漂着几张死亡证明，姓名栏被水泡开，门牌号却清楚得过分。

林小满踩住一张往楼梯下滑的表格。她看完后脸色发白，因为表格上不是死人名字，而是她便利店熟客名单里的一个常客。

* [先用胶带在墙上标出水线高度和时间。]
    # receipt:水线标记=地下档案室首条水位记录
    # effect:flag=ch1_archive_waterline_marked,true
    胶带刚贴上，水线就往下退了半指，像终于被人发现后不好意思继续装作自然灾害。
    -> ch1_zone_b_archive_room
* [检查死亡证明的纸张来源。]
    # effect:flag=ch1_death_cert_paper_checked,true
    # exposure:+2
    纸张来自服务中心普通打印纸，章却是红的。印泥味从水里冒出来，好像盖章机在地下也有一只手。
    -> ch1_zone_b_archive_room
* [让林小满确认名单里的熟客是否今天来过大厅。]
    # companion:lin_xiaoman=疲惫,trust:+1
    # effect:flag=ch1_lin_customer_crosscheck,true
    林小满说这个人早上领过酸奶，拿的是原味，还嫌太酸。她说得很细，像这样就能把人从纸上拽回来。
    -> ch1_zone_b_archive_room
* [向楼上喊话，请志愿者暂时别让新人下楼。]
    # faction:queue_management=信任
    # effect:flag=ch1_archive_stair_blocked,true
    袖标志愿者在楼上喊“知道了”，随后又补一句“那他们问为什么怎么办”。{protagonist_name}说照实说。楼上沉默三秒，传来更小声的一句脏话。
    -> ch1_zone_b_archive_room
* [把漂来的证明装进证据袋，不急着撕毁。]
    # receipt:泡水死亡证明=未确认人员记录
    # effect:flag=ch1_soaked_certificates_bagged,true
    证据袋封口后，里面的字还在慢慢游动。它们没有消失，只是暂时找不到新的姓名栏。
    -> ch1_zone_b_archive_room

=== ch1_zone_b_archive_room ===
# screen:title=LC-IX-006 档案柜第一排
# screen:location=社区服务中心地下档案室
# notice:pressure=水声与楼上叫号声重叠

档案室的门终于被推开一条缝。水没有很深，只到脚踝，却把每一步都拖得像签字。第一排档案柜已经泡烂，第二排柜门自动弹开，露出一排排户籍袋。每个袋口都夹着同一张小票：办理状态，已完成。

楼上叫号屏的声音从通风管里落下来。A-044，A-043，A-042。它不是在叫人上楼，倒像在提醒地下还有多少份记录没来得及被救。

* [档案上移：先把第一排能碰到的户籍袋搬上台阶。]
    # effect:flag=ch1_archive_waterline_record,archives_rescued
    # effect:flag=flag_archive_boxes_saved,true
    # exposure:+5
    {protagonist_name}和林小满一人抱一摞。湿档案贴在胸前，冷得像一群人隔着纸发抖。水没有继续涨，但门口胶带下多出新的日期。
    -> ch1_zone_b_archive_branch
* [救人核名：先让被困居民报姓名，再按活人声音重排档案。]
    # effect:flag=ch1_archive_waterline_record,names_confirmed_by_voice
    # companion:lin_xiaoman=疲惫,trust:+2
    # exposure:+6
    {protagonist_name}让每个人报姓名、楼栋和今天吃过什么。有人答不上楼栋，却记得酸奶味道。林小满把这条也记下，像给户籍制度补了一项人味字段。
    -> ch1_zone_b_archive_branch
* [抢救盖章机底座：检查是否有地下线路连到窗口。]
    # receipt:盖章机底座=疑似地下线路拓片
    # effect:flag=ch1_stamp_base_traced,true
    # exposure:+7
    底座下有一条细线伸进水里，不像电线，更像被泡软的红色公章边。{protagonist_name}拓下痕迹，纸面上浮出“市政回声”四个淡字。
    -> ch1_zone_b_archive_branch
* [封住第一排柜门，放弃已经泡烂的袋口。]
    # effect:flag=ch1_archive_waterline_record,first_row_sealed
    # district:service_center=贴封管控
    {protagonist_name}把第一排柜门贴死。水在柜门内轻轻撞了一下，像有人没有赶上末班车。这个决定让通道变宽，也让林小满很久没有说话。
    -> ch1_zone_b_archive_branch

=== ch1_zone_b_archive_branch ===
# screen:title=LC-IX-006 水线回退
# screen:location=社区服务中心地下档案室门口

水线没有完全退去，只是停在胶带下方。楼上的广播突然变清楚：“请 A-044 至综合窗口。”紧接着是 A-043，A-042。号码在倒着走，楼上有人开始慌。

* [立刻回到大厅，先压住叫号屏。]
    # effect:flag=ch1_returned_for_queue_screen,true
    {protagonist_name}把湿档案箱留在楼梯平台，带着最上面的几张记录往楼上跑。每上一级，倒序号码就少一位。
    -> ch1_zone_b_queue_screen
* [先把湿档案交给林小满，让她看住名单。]
    # companion:lin_xiaoman=疲惫,trust:+1
    # effect:flag=ch1_lin_guarded_archive_box,true
    林小满点头，抱住箱子。她说自己开便利店这么久，第一次觉得“看店”是个战斗岗位。
    -> ch1_zone_b_queue_screen
* [在楼梯口贴临时告示，说明地下暂停进入。]
    # notice:temporary=地下档案室暂停进入，等待人工复核
    # effect:flag=ch1_archive_notice_posted,true
    告示刚贴好，纸角就被潮气卷起。{protagonist_name}又补了两条胶带，像给一条不可靠的命令加班。
    -> ch1_zone_b_queue_screen

=== ch1_zone_b_queue_screen ===
# screen:title=LC-IX-007 叫号屏倒序
# screen:location=社区服务中心办事大厅
# notice:LC-IX-007=队列被改写时幸存人数下降
# receipt:倒序叫号记录=号码与幸存者数量同频

叫号屏不再显示排队号码，而是倒数大厅里“幸存者”的数量。有人插队，数字少一个；有人把老人扶到前面，数字也少一个。它不判断善恶，只判断队列有没有被改写。

广播从温柔女声变成机械男声：“请保持原队列。”大厅里最可怕的不是这句话，而是很多人真的开始犹豫要不要把前排的孩子扶回后面。

* [发放代排牌：让老人和儿童坐到窗口边，号码仍由原队列的人代持。]
    # effect:flag=ch1_queue_screen_record,queue_maintained_with_proxy
    # faction:queue_management=信任
    # district:service_center=错峰限行
    数字停住了。有人不满意，但代排牌至少让“救人”和“插队”在屏幕里暂时不是同一个动作。
    -> ch1_zone_b_queue_actions
* [切断屏幕电源，只保留人工喊号。]
    # effect:flag=ch1_queue_screen_record,screen_power_cut
    # faction:municipal_echo=警惕
    # exposure:+7
    屏幕黑掉后，广播仍在继续。它开始喊“无屏办理”，像早就准备好第二套说法。人工喊号的人声音发抖，但他至少会看人的脸。
    -> ch1_zone_b_queue_actions
* [公开规则：把倒序机制直接告诉大厅所有人。]
    # effect:flag=ch1_queue_screen_record,rule_announced
    # companion:lin_xiaoman=稳定,trust:+1
    # exposure:+5
    大厅一阵乱，又很快安静。恐惧变成了可讨论的东西，虽然还是恐惧。林小满低声说，这比让大家猜强。
    -> ch1_zone_b_queue_actions
* [维持原序：暂时不移动任何人，只让志愿者逐个确认状态。]
    # effect:flag=ch1_queue_screen_record,strict_original_order
    # faction:queue_management=交易
    数字没有下降，哭声也没有停止。{protagonist_name}第一次清楚看见秩序和善意不总是站在一边。
    -> ch1_zone_b_queue_actions

=== ch1_zone_b_queue_actions ===
# screen:title=LC-IX-007 广播、纸牌与湿档案
# screen:location=社区服务中心办事大厅

打印角忽然亮起。打印机没有联网，却吐出一张带物业群时间戳的消息。纸刚出来，楼上就有人喊物业老王，说楼道里有人敲门，声音像早就转移走的邻居。

林小满抱着湿档案箱站在窗口旁。她没有催{protagonist_name}，但眼神很清楚：如果现在只盯着屏幕，打印出来的东西也会自己找到人。

* [让林小满按湿档案核对刚刚被叫到的号码。]
    # companion:lin_xiaoman=疲惫,trust:+2
    # effect:flag=ch1_queue_archive_crosschecked,true
    她把号码和户籍袋一一对上，发现倒序跳过的几个人都在泡水证明上出现过。她没有骂人，只把那几张纸折得很平。
    -> ch1_zone_b_property_printer
* [把代排牌背面写上姓名，防止屏幕只认号码。]
    # receipt:代排牌背书=姓名与原号绑定
    # effect:flag=ch1_proxy_cards_named,true
    牌子写上姓名后，屏幕闪了一下，没有继续扣数。有人小声说原来它认字，{protagonist_name}说别夸它。
    -> ch1_zone_b_property_printer
* [请物业老王先别上楼，过来说明敲门声。]
    # effect:flag=ch1_property_old_wang_called,true
    老王从人群后挤过来，手里还攥着手电。他说声音很熟，熟到他差点答应；这比陌生敲门更糟。
    -> ch1_zone_b_property_printer
* [把倒序叫号记录复印一份，夹入证据袋。]
    # receipt:倒序叫号复印件=幸存人数与队列动作记录
    # effect:flag=ch1_queue_record_copied,true
    复印机热得发烫，复印出来的数字比原屏幕更清楚。清楚有时不是安慰，只是让人无法装作没看见。
    -> ch1_zone_b_property_printer

=== ch1_zone_b_property_printer ===
# screen:title=LC-IX-008 物业群第 404 条消息
# screen:location=社区服务中心打印角
# notice:LC-IX-008=请不要开门给今天之前的邻居
# receipt:物业群第404条消息=无群名无发送人
# exposure:+3

打印件上只有一句话：请不要开门给今天之前的邻居。消息编号是第 404 条，群名没有显示，发送人也没有显示。时间戳却是三分钟前，正好是地下水线回退的时候。

物业老王看完以后沉默很久。他说楼上确实有人听见熟悉的敲门声，声音属于早就转移走的人。后排有人立刻问“今天之前”怎么算，是凌晨之前，撤离之前，还是认识之前。广播替{protagonist_name}和林小满回答：“请按原登记关系确认。”

* [封存原件：把第 404 条消息装入证据袋，不让它继续复制。]
    # effect:flag=ch1_property_message_record,original_sealed
    # faction:municipal_echo=警惕
    原件进袋后，打印机还想吐纸，只吐出一截空白边。它像一个被掐住话头的群管理员。
    -> ch1_zone_b_property_branch
* [有限传播：复印几份贴到楼道门口，并要求逐门核对。]
    # effect:flag=ch1_property_message_record,copied_to_doors
    # district:temporary_shelter=社区庇护
    # receipt:楼道告示=第404条消息有限张贴
    复印件贴上楼道门口后，几扇门后传来压低的哭声。没有人喜欢这张纸，但所有人都开始小声确认今晚谁在屋里。
    -> ch1_zone_b_property_branch
* [公开朗读：让老王当众读出消息，争取所有楼栋同步警戒。]
    # effect:flag=ch1_property_message_record,publicly_read
    # faction:queue_management=信任
    # exposure:+6
    老王读得很慢。大厅里有人哭，有人骂，也有人马上打电话给楼上。同步警戒来得很快，恐慌也一样。
    -> ch1_zone_b_property_branch
* [延后处理：先把消息压在证据袋下，继续办理通行条。]
    # effect:flag=ch1_property_message_record,deferred_for_permit
    # companion:lin_xiaoman=疲惫,trust:-1
    {protagonist_name}把纸压住。林小满看见了，没有反对，只问一句：“如果敲门的是认识的人，延后多久算来得及？”
    -> ch1_zone_b_property_branch

=== ch1_zone_b_property_branch ===
# screen:title=LC-IX-008 门、名单和窗口回执
# screen:location=社区服务中心打印角
# notice:pressure=物业消息、倒序叫号与补办窗口互相牵连

打印机停下后，大厅并没有安静。叫号屏恢复成普通号码，普通得很不可信。综合窗口弹出一张新回执，写着“请补交关系确认材料”。下面的小字更过分：邻里关系、临时通行、档案存续，可三选二。

林小满盯着这行字，像盯着便利店货架上最后一袋不该过期却已经胀包的面包。

* [关系优先：先帮老王组织逐门核对，再回窗口补材料。]
    # effect:flag=ch1_zone_b_priority,neighbors_first
    # companion:lin_xiaoman=稳定,trust:+2
    # faction:queue_management=信任
    老王带人上楼，{protagonist_name}让每户只隔门确认三件事：今天见过谁、屋里有谁、门外声音是谁。没有人因此放心，但至少没有人单独开门。
    -> ch1_zone_b_wrap
* [手续优先：先补交通行条材料，确保下一片区能通行。]
    # effect:flag=ch1_zone_b_priority,permit_first
    # companion:lin_xiaoman=疲惫,trust:-1
    # receipt:临时通行材料=社区服务中心补交关系确认
    {protagonist_name}把材料递进收件槽。盖章机迟疑了一下才落章，像也知道这一步说不上体面。林小满没说话，只把熟客名单抱得更紧。
    -> ch1_zone_b_wrap
* [档案优先：用湿档案证明活人仍在，不让系统三选二。]
    # effect:flag=ch1_zone_b_priority,archive_continuity
    # exposure:+5
    # receipt:湿档案存续证明=活人声音与户籍袋同证
    {protagonist_name}把泡水户籍袋和刚录下的报姓名声音一起交给窗口。机器显示“格式错误”，但没有再显示“已完成”。在这里，错误比完成更像活路。
    -> ch1_zone_b_wrap
* [公开抗辩：把三选二回执贴到公告栏，让大厅共同见证。]
    # effect:flag=ch1_zone_b_priority,public_objection
    # faction:municipal_echo=警惕
    # exposure:+4
    回执贴上公告栏时，所有旧通知都往下滑了一寸。大厅里的人看见那行小字，第一次不是在问谁先办，而是在问谁有权这么办。
    -> ch1_zone_b_wrap

=== ch1_zone_b_wrap ===
# screen:title=第一章片区 B：社区服务中心记录归袋
# screen:location=社区服务中心出口
# notice:chapter-1-zone-b=LC-IX-005至LC-IX-008已形成连续记录
# receipt:片区B=自动取号工单,地下水线记录,倒序叫号记录,物业群第404条消息
# effect:flag=ch1_zone_b_completed,true
# district:service_center=错峰限行

等{protagonist_name}和林小满从打印角退回大厅，社区服务中心看起来又像普通办事大厅了。普通到更可疑：窗口灯牌恢复“请稍候”，取号机吐出的下一张票只有号码没有事项，广播说“请按秩序办理”，像刚才的一切只是一次服务质量波动。

林小满把熟客名单、湿档案复印件和第 404 条消息分开放好。她说这些东西不能装在同一个袋子里，不然它们会互相学习。{protagonist_name}觉得这句话在这里很有道理，虽然按办事指南可能属于“无效说明”。

综合窗口最后吐出一张窄回执：下一步，请前往后续处置区域。回执没有写区域名，只在背面印了一个消防门的图标。

{protagonist_name}还没拆回执，后排一个抱孩子的男人就把自己的补办材料递到{protagonist_name}面前，压低声音叫{protagonist_name}“窗口同志”，问他母亲的门禁能不能也按刚才的办法办。旁边的人跟着安静下来，像终于给空窗口找到了一个会呼吸的替身。

* [收好片区 B 的全部回执，带林小满离开服务中心。]
    # effect:flag=ch1_zone_b_exit_with_receipts,true
    {protagonist_name}把回执收进材料袋，袋口已经撑得合不上。林小满跟在{protagonist_name}身侧，路过取号机时没有看它。取号机也没有再叫{protagonist_name}。
    -> ch1_zone_c_entry
* [离开前回头确认叫号屏没有继续倒数。]
    # effect:flag=ch1_zone_b_exit_checked_screen,true
    # exposure:+1
    屏幕显示 A-045。它停得很稳，稳到像在等{protagonist_name}走远。{protagonist_name}没有再给它机会。
    -> ch1_zone_c_entry
