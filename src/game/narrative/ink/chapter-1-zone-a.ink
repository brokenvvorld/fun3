// 第一章 片区 A：临时避难点
// 覆盖 LC-IX-001 到 LC-IX-004；只使用已登记的临川市政异象设定。

VAR ch1_zone_a_opening_focus = "未定"
VAR ch1_zone_a_counter_prepared = "未处理"
VAR ch1_zone_a_lin_check = "未处理"
VAR ch1_zone_a_queue_protocol = "未处理"
VAR ch1_zone_a_stamp_investigation = "未处理"
VAR ch1_zone_a_registry_decision = "未处理"
VAR ch1_zone_a_copy_investigation = "未处理"
VAR ch1_zone_a_copy_decision = "未处理"
VAR ch1_zone_a_roster_preparation = "未处理"
VAR ch1_zone_a_roster_decision = "未处理"
VAR ch1_zone_a_yogurt_preparation = "未处理"
VAR ch1_zone_a_yogurt_decision = "未处理"
VAR ch1_zone_a_departure_method = "未定"
VAR ch1_opening_lin_chat_count = 0
VAR ch1_opening_queue_listened = false
VAR ch1_opening_ticket_checked = false

=== ch1_zone_a_entry ===
# screen:title=第一章片区A：临时避难点
# screen:location=九号枢纽区临时避难点
# notice:chapter=1,zone=A,range=LC-IX-001_to_LC-IX-004
# district:temporary_shelter=临时避难
# companion:lin_xiaoman=疲惫,trust:0
# choice:0:group=person
# choice:0:target=lin_xiaoman
# choice:0:label=林小满
# choice:0:mode=talk
# choice:0:surface=modal
# choice:0:repeatable=true
# choice:1:group=person
# choice:1:target=crowd
# choice:1:label=队伍
# choice:1:mode=inspect
# choice:1:surface=modal
# choice:1:repeatable=true
# choice:2:group=machine
# choice:2:target=ticket_machine
# choice:2:label=取号机
# choice:2:mode=inspect
# choice:2:surface=modal
# choice:2:repeatable=true
# choice:3:group=decision
# choice:3:target=procedure
# choice:3:label=窗口桌面
# choice:3:mode=advance
# choice:3:surface=next_step
# choice:3:repeatable=false
# choice:4:group=decision
# choice:4:target=customer_list
# choice:4:label=熟客名单
# choice:4:mode=advance
# choice:4:surface=next_step
# choice:4:repeatable=false
# choice:5:group=decision
# choice:5:target=procedure
# choice:5:label=手续边界
# choice:5:mode=advance
# choice:5:surface=next_step
# choice:5:repeatable=false

长昼把临时避难点晒得发白。社区服务大厅外借来的折叠桌排成一排，桌面上有配给回执、空白值班表、临时通行条复印申请和几箱从便利店搬来的临期酸奶。排队管理处的人没有给{protagonist_name}胸牌，也没有说“你现在是工作人员”。他们只把铁皮章盒推近一点，说当前号票关联的材料没人整理，窗口就不能继续叫号。

{protagonist_name}胸前的卡套里还是那张“补办人”临时条。它不能证明身份，只能证明这个编号已经被系统盯上。可队伍看不见系统的甩锅，只看见有人站到了窗口前，于是抱着老人等通行条的家属、不敢离开床位表的志愿者、只拿着空碗的孩子，都开始把目光递过来。

林小满站在便利店纸箱旁，熟客名单夹在胳膊下。她和{protagonist_name}刚才在队尾说过两句话：她在找几个没来领酸奶的熟客，{protagonist_name}在等一张泡烂通行条的补办结果。现在她没有像窗口工作人员那样喊号，只低声提醒{protagonist_name}：这里每张表都会把人写进去，也可能把人写没。

第一张号票还在取号机口轻轻抖动，排队管理处已经退到胶带线后面；林小满的名单压住一角，窗口桌面上的章盒又自己往前滑了半寸。{protagonist_name}没有获得权力，只是被推到了责任最容易落下来的位置。三件事同时催促着：先稳住窗口，先保住活人名单，或者先问清这只被推来的章盒到底允许做什么。

- (opening_actions)
+ [和林小满低声聊几句，先不碰窗口]
    # ui:feedback
    ~ ch1_opening_lin_chat_count += 1
    {ch1_opening_lin_chat_count == 1:
        林小满说便利店以前最怕的是错账，后来最怕的是断货，现在最怕的是系统把“没人来买”当成“这个人已经不在”。她没有看窗口，只盯着纸箱边缘：“名单不是证件，但至少能证明有人还记得他们爱买什么。”
    - else:
        林小满又把名单往怀里收了收。她说闲聊也算拖时间，但拖出来的这点时间能让人喘口气。窗口那边的章盒没有因此安静，只是把盖子抬开一条更细的缝。
    }
    -> ch1_zone_a_entry

+ [听一会儿队伍里的低声议论]
    # ui:feedback
    ~ ch1_opening_queue_listened = true
    队伍里的声音拼成一张比公告栏更真实的地图：有人担心老人错过限行，有人说昨夜地下水从楼梯间往上冒，有人反复确认床位表上的名字有没有被划掉。没有人真正相信窗口能解决一切，但所有人都需要它先开起来。
    -> ch1_zone_a_entry

+ [查看取号机吐出的第一张号票]
    # ui:feedback
    ~ ch1_opening_ticket_checked = true
    号票上除了补办编号，还有一行很淡的小字：“未核验姓名可先办理，结果以后续归档为准。”这句话看起来像便利，实际更像免责：系统允许{protagonist_name}进入流程，也允许流程在之后改写这个名字。
    -> ch1_zone_a_entry

* [接手桌面：清出一号窗口，把回执、申请和空白表分开]
    # effect:flag=ch1_zone_a_opening_focus,counter
    # receipt:一号窗口临时接手记录
    ~ ch1_zone_a_opening_focus = "清理窗口"
    {protagonist_name}先把自己的补办号票压在桌角，再把回执和空白表分成三摞。最下面那摞纸自己往盖章机方向滑了一寸，像已经知道谁会先被处理。
    -> ch1_zone_a_counter_setup

* [接住名单：找林小满确认熟客记录能不能当辅助证明]
    # effect:flag=ch1_zone_a_opening_focus,lin_list
    # companion:lin_xiaoman=疲惫,trust:+1
    ~ ch1_zone_a_opening_focus = "确认名单"
    林小满把名单递给{protagonist_name}，只让{protagonist_name}看边角被水泡过的几页。她说名单不正规，但至少写的是活人平时怎么买东西。
    -> ch1_zone_a_lin_setup

* [追问授权：向排队管理处问清临时窗口的手续边界]
    # effect:flag=ch1_zone_a_opening_focus,protocol
    # faction:queue_management=交易
    ~ ch1_zone_a_opening_focus = "询问手续"
    排队管理处给{protagonist_name}的答复很短：先维持秩序，再补齐手续。那句话写在纸上很稳，念出来却像把责任推过窗口。
    -> ch1_zone_a_protocol_setup

=== ch1_zone_a_counter_setup ===
# screen:title=开窗前：桌面分拣
# screen:location=临时避难点一号窗口
# notice:action=ordinary_setup,thread=counter
# receipt:窗口桌面分拣单

桌面潮得发冷。盖章机没有插电，章盒却扣得很紧；复印申请压在临时通行条下面；值班表的夜班栏空着；便利店清点表夹在酸奶箱封口处。

后排已经有人把申请递过胶带线，前排家属则盯着通行条复印申请不放。桌面如果继续混在一起，下一张被章盒压住的纸可能直接替某个人结案。{protagonist_name}需要先决定这个临时窗口按什么顺序醒过来，队伍才不会挤到门口。

* [按人在场排序：把已到场居民的申请压在最上面]
    # effect:flag=ch1_zone_a_counter_prepared,present_queue_first
    # district:temporary_shelter=社区庇护
    ~ ch1_zone_a_counter_prepared = "在场优先"
    纸面被重新压平。队伍里有人松了口气，因为至少自己还在看得见的位置。
    -> ch1_zone_a_lin_setup

* [隔离空床位：把未到场居民的床位条夹出并留复核栏]
    # effect:flag=ch1_zone_a_counter_prepared,missing_review_column
    # exposure:+2
    ~ ch1_zone_a_counter_prepared = "缺席复核"
    {protagonist_name}在床位条旁边添了“需见人复核”。字迹刚干，盖章机里传出一声没有电源的轻响。
    -> ch1_zone_a_lin_setup

* [检查章盒：先看盖章机底座和章面有没有旧封条]
    # effect:flag=ch1_zone_a_counter_prepared,stamp_checked
    # faction:queue_management=警惕
    ~ ch1_zone_a_counter_prepared = "检查盖章机"
    底座有一圈旧封胶，胶面上印着“贴封停用”。封条被撕开过，撕口很新。
    -> ch1_zone_a_lin_setup

=== ch1_zone_a_lin_setup ===
# screen:title=开窗前：熟客名单
# screen:location=临时避难点便利店物资箱旁
# notice:action=relationship_setup,companion=lin_xiaoman
# companion:lin_xiaoman=疲惫,trust:0

林小满把熟客名单摊在纸箱上。名字旁边没有证件号，只有“常买豆浆”“赊过两次米”“会替楼上老人带水”之类的备注。它不能直接盖章，却比窗口系统更像一份活人记录。

她先用指腹按住“三单元周婶”那一行：常买两盒原味酸奶，一盒自己留着，一盒给排队时总拿空碗的孩子；上周赊过一次米，第二天用硬币补齐。林小满说，系统不认这些零碎事，可人就是靠这些零碎事被认出来的。

排队管理处想把名单收走，窗口桌面又需要某种“人在场”的证明；林小满不想让熟客名字变成另一叠可被盖章的纸。她问{protagonist_name}要不要把这份名单交给排队管理处。问题问得很轻，手指却一直按着缺角。

* [保护原件：请林小满留下名单，只允许窗口抄录备注]
    # effect:flag=ch1_zone_a_lin_check,copy_notes_only
    # companion:lin_xiaoman=稳定,trust:+3
    ~ ch1_zone_a_lin_check = "只抄备注"
    她点点头，把名单往自己这边收了半寸。{protagonist_name}抄下几条能证明人在场的细节，没有碰原件。
    -> ch1_zone_a_protocol_setup

* [现场认人：让林小满先确认队伍里哪些熟客已经到场]
    # effect:flag=ch1_zone_a_lin_check,identify_present_customers
    # district:temporary_shelter=社区庇护
    ~ ch1_zone_a_lin_check = "认人在场"
    她从队伍侧面走过去，指认时没有喊全名，只说“这位住三单元”“这个孩子早上来过”。几个人终于敢把碗放到桌上。
    -> ch1_zone_a_protocol_setup

* [先问库存：询问物资数量，暂时不谈清点表异常]
    # effect:flag=ch1_zone_a_lin_check,inventory_first
    # companion:lin_xiaoman=疲惫,trust:+1
    ~ ch1_zone_a_lin_check = "先问库存"
    林小满报出酸奶、纸杯和空碗数量，像报一串很普通的班表。报到最后一箱时，她停了一下，说日期不太对。
    -> ch1_zone_a_protocol_setup

* [公开核名：把名单放到窗口边，让排队的人自己核对漏名]
    # effect:flag=ch1_zone_a_lin_check,public_name_check
    # exposure:+5
    # companion:lin_xiaoman=疲惫,trust:-1
    ~ ch1_zone_a_lin_check = "公开核名"
    人群立刻往前挤。林小满没有拦{protagonist_name}，只把纸箱挡在孩子前面，免得他们被队伍推到桌角。
    -> ch1_zone_a_protocol_setup

=== ch1_zone_a_protocol_setup ===
# screen:title=开窗前：手续边界
# screen:location=临时避难点排队线旁
# notice:action=paperwork_setup,faction=queue_management
# faction:queue_management=交易

排队管理处的人在胶带线外看着{protagonist_name}。他们不想让窗口停摆，也不想替{protagonist_name}承认异象。临时章程写着：配给、通行、值班、物资清点可合并登记，但每一项必须留下可追溯回执。

合并登记听起来节省时间，问题是四件事会互相咬住。配给盖章会影响床位，通行条会影响撤离名额，值班表会影响门，酸奶清点表会影响谁先被承认还活着。

排队管理处等着{protagonist_name}选一种写法，林小满等着看名单会不会被并进去，队伍只想听见“可以办”。这一刻的选择不是表格格式，而是要不要让四套手续共享同一处错误。

* [合并登记：按章程建总表，把四项手续挂在同一补办编号下]
    # effect:flag=ch1_zone_a_queue_protocol,merged_register
    # receipt:片区A合并登记总表
    ~ ch1_zone_a_queue_protocol = "合并登记"
    总表写好后，四摞纸都安静了一瞬。安静不是安全，只是它们开始认同同一个编号。
    -> ch1_zone_a_stamp_machine

* [拆开编号：坚持每项手续单独登记，避免一个错误拖走所有人]
    # effect:flag=ch1_zone_a_queue_protocol,separate_numbers
    # faction:queue_management=警惕
    ~ ch1_zone_a_queue_protocol = "单独编号"
    排队管理处的人皱了皱眉，但没有收走章盒。{protagonist_name}得到更多纸，也得到更多需要解释的空格。
    -> ch1_zone_a_stamp_machine

* [引入见证：请两名志愿者签字，让窗口不只由{protagonist_name}承担]
    # effect:flag=ch1_zone_a_queue_protocol,witnessed_register
    # district:temporary_shelter=社区庇护
    ~ ch1_zone_a_queue_protocol = "双人见证"
    两名志愿者站到桌边，一个念号，一个看人。盖章机的章面慢慢转向他们，像在确认新的见证人。
    -> ch1_zone_a_stamp_machine

=== ch1_zone_a_stamp_machine ===
# screen:title=配给登记：盖章机不等开窗
# screen:location=临时避难点一号窗口
# notice:LC-IX-001=配给盖章机;户籍档案;贴封停用;物件型/流程型
# receipt:配给资格补办回执-未来日期
# district:temporary_shelter=贴封管控
# choice:0:group=document
# choice:0:target=future_receipts
# choice:0:label=未来日期回执
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
# choice:2:target=bed_roster
# choice:2:label=床位表
# choice:2:mode=compare
# choice:2:surface=modal
# choice:2:repeatable=true
# choice:3:group=machine
# choice:3:target=stamp_machine
# choice:3:label=盖章机封条
# choice:3:mode=inspect
# choice:3:surface=modal
# choice:3:repeatable=true
# choice:4:group=decision
# choice:4:target=procedure
# choice:4:label=配给登记更正页
# choice:4:mode=advance
# choice:4:surface=next_step
# choice:4:repeatable=false

盖章机在无电状态下吐出第一张回执。回执上写着明天的日期，申请人一栏却已经填好：一个还没排到窗口的老人，一个在便利店名单上被林小满画过星号的孩子，还有一个空床位编号。

每多吐出一张，床位表上就有一个未到场居民被登记为“已完成安置”。队伍看不懂全部异常，只看见有人明明还站在门外，纸面上却已经领完东西、睡过床位、离开避难点。

{protagonist_name}不能只做一个大决定。先要把机器、名单、床位和人重新拆开。

未来日期、陌生姓名和空床位不是同一种错误，却被同一台机器盖成了同一种“完成”。如果直接撕掉，队伍会失去凭据；如果直接承认，没到场的人会被纸面搬走。{protagonist_name}必须先找出这台机器借用了哪一条线。

+ [封存未来日期：逐张核对回执，把同日期纸件夹进证据袋]
    # ui:feedback
    # effect:flag=ch1_zone_a_stamp_investigation,future_dates_bagged
    # receipt:未来日期回执证据袋
    ~ ch1_zone_a_stamp_investigation = "封存未来日期"
    回执被夹进袋子时，日期在塑封下轻轻发灰。它们还在，但暂时不能直接替人结案。
    -> ch1_zone_a_stamp_machine

+ [交叉核人：让林小满用熟客备注确认回执上的人是否真实在场]
    # ui:feedback
    # effect:flag=ch1_zone_a_stamp_investigation,lin_notes_crosscheck
    # companion:lin_xiaoman=疲惫,trust:+2
    ~ ch1_zone_a_stamp_investigation = "熟客交叉核对"
    她把“常买豆浆”的老人从队伍里认出来，又指出那个孩子今天根本没有拿到碗。盖章机的出纸声短促了一下。
    -> ch1_zone_a_stamp_machine

+ [圈出床位：检查床位表，把被提前划掉的床位标成待查]
    # ui:feedback
    # effect:flag=ch1_zone_a_stamp_investigation,beds_marked_for_review
    # district:temporary_shelter=错峰限行
    ~ ch1_zone_a_stamp_investigation = "床位红圈"
    红圈一个接一个落下。队伍里有人开始数，数到第七个时不再出声。
    -> ch1_zone_a_stamp_machine

+ [追封条号：询问排队管理处这台机器为什么还在窗口]
    # ui:feedback
    # effect:flag=ch1_zone_a_stamp_investigation,seal_number_questioned
    # faction:queue_management=警惕
    # exposure:+3
    ~ ch1_zone_a_stamp_investigation = "追问封条"
    对方没有立刻回答，只把旧封条编号记回自己的夹板。{protagonist_name}看见编号末尾有一道被水泡开的墨痕。
    -> ch1_zone_a_stamp_machine

* [完成盖章机、名单和床位核对，准备写配给登记更正页]
    -> ch1_zone_a_stamp_witness

=== ch1_zone_a_stamp_witness ===
# screen:title=配给登记：名单和床位
# screen:location=临时避难点一号窗口
# notice:LC-IX-001=decision;名单恢复取舍
# receipt:配给登记更正页

调查让问题变得具体。现在有三类人挤在同一张表里：已经到场却被盖成“已安置”的人，未到场但可能还在路上的人，以及被盖章机提前占走床位的空编号。

林小满看着孩子的空碗。排队管理处看着队伍。志愿者看着夜里要睡的床位。{protagonist_name}看着那台没有电的盖章机。

每一种修法都会把压力推向不同的人：重填能救眼前的队伍，保留未来名额会挤压今晚床位，贴封机器会让窗口变慢。没有一个选项是“正确按钮”，只有哪一批人先被纸面承认。

* [恢复在场名单：撕下错误页，按现场人数重填配给和床位]
    # effect:flag=ch1_zone_a_registry_decision,present_restored
    # effect:flag=flag_registry_present_restored,true
    # district:temporary_shelter=社区庇护
    # companion:lin_xiaoman=稳定,trust:+3
    ~ ch1_zone_a_registry_decision = "恢复在场名单"
    {protagonist_name}把已到场的人重新写回床位表。盖章机连续空盖三次，像在纸上找不到可以替代他们的位置。
    -> ch1_zone_a_pass_copy

* [保留未来名额：不删除未到场居民，只把在场者转入临时加页]
    # effect:flag=ch1_zone_a_registry_decision,future_quota_kept
    # effect:flag=flag_registry_future_quota_kept,true
    # exposure:+6
    ~ ch1_zone_a_registry_decision = "保留未来名额"
    临时加页让今天的人有东西领，也让未到场的人还留在明天。代价是避难点今晚要多挤出一排地铺。
    -> ch1_zone_a_pass_copy

* [贴封盖章机：停止自动盖章，交给双人手写配给记录]
    # effect:flag=ch1_zone_a_registry_decision,stamp_sealed
    # faction:queue_management=警惕
    # district:temporary_shelter=贴封管控
    ~ ch1_zone_a_registry_decision = "贴封盖章机"
    {protagonist_name}把旧封条重新压在章盒上。排队速度立刻慢下来，但每个名字都需要有人看着写完。
    -> ch1_zone_a_pass_copy

=== ch1_zone_a_pass_copy ===
# screen:title=通行手续：复印件上的陌生照片
# screen:location=临时避难点复印桌
# notice:LC-IX-002=临时通行条复印件;窗口办件;错峰限行;物件型
# receipt:临时通行条复印申请
# choice:0:group=document
# choice:0:target=pass_copy
# choice:0:label=通行条复印件
# choice:0:mode=compare
# choice:0:surface=modal
# choice:0:repeatable=true
# choice:1:group=machine
# choice:1:target=copier
# choice:1:label=复印机缓存
# choice:1:mode=inspect
# choice:1:surface=modal
# choice:1:repeatable=true
# choice:2:group=procedure
# choice:2:target=manual_stamp
# choice:2:label=人工骑缝章
# choice:2:mode=operate
# choice:2:surface=modal
# choice:2:repeatable=true
# choice:3:group=person
# choice:3:target=lin_xiaoman
# choice:3:label=林小满
# choice:3:mode=talk
# choice:3:surface=modal
# choice:3:repeatable=true
# choice:4:group=decision
# choice:4:target=procedure
# choice:4:label=错峰名额
# choice:4:mode=advance
# choice:4:surface=next_step
# choice:4:repeatable=false

配给登记还没完全平息，抱着老人的家属已经把临时通行条递到复印桌前。他们要赶错峰限行前离开，只求多复印两份，路上遇到检查时能解释老人和陪护的关系。

复印机预热得很慢。第一张纸出来时，通行条编号没错，照片却不是老人，也不是陪护，而是队伍后排一个{protagonist_name}还没有登记过的陌生人。第二张纸上的照片又换成另一个人。

这不是另一个独立事件，它正好接住刚才的床位和配给名额：复印件多出几张脸，就像避难点少了几个可以通行的人。

+ [把原件、复印件和队伍后排的人逐一对照]
    # ui:feedback
    # effect:flag=ch1_zone_a_copy_investigation,faces_crosschecked
    # exposure:+2
    ~ ch1_zone_a_copy_investigation = "对照陌生照片"
    {protagonist_name}找到其中一张照片的本人。他还没交申请，却已经在复印件里获得一次离开的机会。
    -> ch1_zone_a_pass_copy

+ [检查复印机缓存，确认陌生照片是不是来自之前的通行条]
    # ui:feedback
    # effect:flag=ch1_zone_a_copy_investigation,cache_checked
    # receipt:复印机缓存编号
    ~ ch1_zone_a_copy_investigation = "检查缓存"
    缓存里没有图像，只有连续的通行名额编号。编号和床位表上的红圈数量相同。
    -> ch1_zone_a_pass_copy

+ [请排队管理处临时开放人工骑缝章，限制复印件单独使用]
    # ui:feedback
    # effect:flag=ch1_zone_a_copy_investigation,manual_stamp_requested
    # faction:queue_management=交易
    ~ ch1_zone_a_copy_investigation = "申请骑缝章"
    对方拿来一枚小章，要求每份复印件都要原件同框、见证人签名。复印桌前的队伍开始抱怨，但没有散开。
    -> ch1_zone_a_pass_copy

+ [让林小满安抚等待离开的人，解释{protagonist_name}需要先查照片]
    # ui:feedback
    # effect:flag=ch1_zone_a_copy_investigation,lin_calms_queue
    # companion:lin_xiaoman=疲惫,trust:+2
    ~ ch1_zone_a_copy_investigation = "林小满安抚队伍"
    她没有说异象，只说复印件错了会害人。家属听懂这句，把老人扶到阴影里等。
    -> ch1_zone_a_pass_copy

* [完成复印件、缓存和人工骑缝章核对，开始处理错峰名额]
    -> ch1_zone_a_copy_queue

=== ch1_zone_a_copy_queue ===
# screen:title=通行手续：错峰名额
# screen:location=临时避难点复印桌
# notice:LC-IX-002=decision;通行名额挤占
# receipt:通行条复印限制记录

{protagonist_name}已经确认：复印件不是单纯变错照片，它会借陌生人的脸替当前申请人补足通行名额。使用它能让一批老人和陪护马上离开，也会把同数量的其他居民挤出错峰限行名单。

队伍里没有人愿意听完整解释。老人需要离开，后排的人也不能被纸面提前挤掉。

* [只给病重老人复印一份，所有复印件必须原件同持]
    # effect:flag=ch1_zone_a_copy_decision,one_medical_copy
    # effect:flag=flag_pass_copy_limited,true
    # district:temporary_shelter=错峰限行
    ~ ch1_zone_a_copy_decision = "医疗限量复印"
    {protagonist_name}只放行一份。照片在骑缝章下晃了一下，最后贴回老人的原件旁边，没有继续替换后排的人。
    -> ch1_zone_a_duty_roster

* [拒绝继续复印，把老人转入今晚值班区等人工通行]
    # effect:flag=ch1_zone_a_copy_decision,copy_refused_wait_roster
    # faction:queue_management=警惕
    # companion:lin_xiaoman=疲惫,trust:-1
    ~ ch1_zone_a_copy_decision = "拒绝复印"
    家属的脸色沉下去。{protagonist_name}把他们登记到值班区旁边，承诺下一轮人工通行先核他们的号。承诺本身也需要一张表来承受。
    -> ch1_zone_a_duty_roster

* [公开说明复印件会挤占名额，让居民自愿换成留守顺序]
    # effect:flag=ch1_zone_a_copy_decision,public_swap_queue
    # exposure:+8
    # companion:lin_xiaoman=稳定,trust:+1
    ~ ch1_zone_a_copy_decision = "公开换序"
    人群吵起来，又慢慢安静。有人把自己的离开顺序让给老人，也有人把号码攥得更紧。复印件被夹在中间，像一份不完整的投票。
    -> ch1_zone_a_duty_roster

=== ch1_zone_a_duty_roster ===
# screen:title=夜间安排：值班表空格
# screen:location=临时避难点内侧通道
# notice:LC-IX-003=值班表空格;社区楼院;登记观察;流程型
# receipt:夜间值班表-空格
# district:temporary_shelter=临时避难
# choice:0:group=place
# choice:0:target=night_door
# choice:0:label=夜门痕迹
# choice:0:mode=inspect
# choice:0:surface=modal
# choice:0:repeatable=true
# choice:1:group=document
# choice:1:target=duty_roster
# choice:1:label=轮班名单
# choice:1:mode=compare
# choice:1:surface=modal
# choice:1:repeatable=true
# choice:2:group=person
# choice:2:target=lin_xiaoman
# choice:2:label=林小满
# choice:2:mode=talk
# choice:2:surface=modal
# choice:2:repeatable=true
# choice:3:group=person
# choice:3:target=crowd
# choice:3:label=居民口述
# choice:3:mode=talk
# choice:3:surface=modal
# choice:3:repeatable=true
# choice:4:group=decision
# choice:4:target=duty_roster
# choice:4:label=夜间值守签名页
# choice:4:mode=advance
# choice:4:surface=next_step
# choice:4:repeatable=false

傍晚前，值班表被贴到内侧通道。它多出一格，没有时段，没有岗位，只留下一条能写名字的横线。志愿者说，昨夜这条横线没填，靠近楼梯的一扇门自己开了三次。

今天的队伍已经被盖章机和复印件折腾得疲惫。每个人都知道夜里需要有人守门，却没有人愿意让自己的名字先被写进那个空格。那不像排班，更像把一个人交给门。

+ [绕着通道检查门缝、封条和昨夜留下的脚印]
    # ui:feedback
    # effect:flag=ch1_zone_a_roster_preparation,door_traces_checked
    # exposure:+2
    ~ ch1_zone_a_roster_preparation = "检查门缝"
    门缝里没有风，只有一层很细的灰。灰上有脚印从门外走进来，却没有走出去。
    -> ch1_zone_a_duty_roster

+ [让志愿者列出可轮班名单，先排除老人、儿童和病人陪护]
    # ui:feedback
    # effect:flag=ch1_zone_a_roster_preparation,volunteer_pool_listed
    # district:temporary_shelter=社区庇护
    ~ ch1_zone_a_roster_preparation = "整理轮班名单"
    名单比{protagonist_name}想的短。白天还能说话的人，到了夜班栏前都变成低头的影子。
    -> ch1_zone_a_duty_roster

+ [请林小满判断谁白天已经被清点表标记过，避免重复压到同一批人]
    # ui:feedback
    # effect:flag=ch1_zone_a_roster_preparation,lin_flags_overburdened
    # companion:lin_xiaoman=疲惫,trust:+2
    ~ ch1_zone_a_roster_preparation = "避开重复承压"
    她把几个名字从名单里划出来：一个刚让出通行顺序，一个孩子的母亲，一个已经连续两晚没睡的志愿者。
    -> ch1_zone_a_duty_roster

+ [把空格暂时盖住，先听完居民对夜门的描述]
    # ui:feedback
    # effect:flag=ch1_zone_a_roster_preparation,stories_collected
    # receipt:夜门口述记录
    ~ ch1_zone_a_roster_preparation = "收集口述"
    有人说门后是楼梯，有人说是水声，有人说是已经转移走的邻居在叫他。描述互相矛盾，恐惧却很一致。
    -> ch1_zone_a_duty_roster

* [完成夜门、轮班名单和居民口述核对，讨论谁来写名字]
    -> ch1_zone_a_roster_talk

=== ch1_zone_a_roster_talk ===
# screen:title=夜间安排：谁来写名字
# screen:location=临时避难点内侧通道
# notice:LC-IX-003=decision;避难点内部牺牲逻辑
# receipt:夜间值守签名页

空格等到了所有人都看见它。它没有催促，只让通道另一端的门偶尔轻响。排队管理处的章程说夜班自愿，志愿者说不能让门再开，林小满说“自愿”两个字不能拿来堵住别人嘴。

现在必须给夜里一个安排。

* [写上自己的补办编号，先由{protagonist_name}顶第一班]
    # effect:flag=ch1_zone_a_roster_decision,player_takes_first_shift
    # district:temporary_shelter=社区庇护
    # companion:lin_xiaoman=稳定,trust:+4
    ~ ch1_zone_a_roster_decision = "补办人顶班"
    {protagonist_name}没有写真实姓名，只写补办编号。门响停了，值班表背面渗出一小圈水印，像有人在纸后确认{protagonist_name}确实留下来。
    -> ch1_zone_a_yogurt_list

* [组织抽签轮班，签名页公开贴在通道口]
    # effect:flag=ch1_zone_a_roster_decision,public_lottery_roster
    # exposure:+5
    # faction:queue_management=交易
    ~ ch1_zone_a_roster_decision = "公开抽签"
    抽签没有让人安心，但让每个人都看见规则。抽到的人没有立刻哭，没抽到的人也没有立刻松气。
    -> ch1_zone_a_yogurt_list

* [安排双人值守，一名志愿者守门，一名林小满熟客负责叫醒人]
    # effect:flag=ch1_zone_a_roster_decision,two_person_shift
    # district:temporary_shelter=社区庇护
    # companion:lin_xiaoman=疲惫,trust:+2
    ~ ch1_zone_a_roster_decision = "双人值守"
    两个名字写进一个格子，横线被墨水撑得发胀，却没有裂开。门后传来一下很轻的敲击，像是不满意但暂时接受。
    -> ch1_zone_a_yogurt_list

=== ch1_zone_a_yogurt_list ===
# screen:title=物资清点：临期酸奶
# screen:location=临时避难点便利店纸箱旁
# notice:LC-IX-004=临期酸奶清点表;物资供应;登记观察;物件型
# receipt:便利店临期酸奶清点表
# companion:lin_xiaoman=疲惫,trust:0
# choice:0:group=document
# choice:0:target=yogurt_list
# choice:0:label=清点表
# choice:0:mode=compare
# choice:0:surface=modal
# choice:0:repeatable=true
# choice:1:group=person
# choice:1:target=lin_xiaoman
# choice:1:label=林小满
# choice:1:mode=talk
# choice:1:surface=modal
# choice:1:repeatable=true
# choice:2:group=procedure
# choice:2:target=headcount
# choice:2:label=人头数
# choice:2:mode=inspect
# choice:2:surface=modal
# choice:2:repeatable=true
# choice:3:group=document
# choice:3:target=yogurt_list
# choice:3:label=异常排序
# choice:3:mode=inspect
# choice:3:surface=modal
# choice:3:repeatable=true
# choice:4:group=decision
# choice:4:target=yogurt_list
# choice:4:label=酸奶发放签收页
# choice:4:mode=advance
# choice:4:surface=next_step
# choice:4:repeatable=false

夜班表刚贴好，孩子们又围到便利店纸箱边。酸奶需要今天发完，林小满本来已经按保质期排好，可清点表上的日期开始自己重排：不是按过期日期，而是按居民死亡顺序。

第一行是拿空碗的孩子。第二行是刚让出通行顺序的家属。最后一行没有姓名，只有{protagonist_name}的补办编号。林小满看见那行字，脸色比刚才值班表前更白。

“三单元周婶”的备注也被清点表挪了位置。她那句“给孩子留一盒”被拆成两栏：周婶旁边写着“无人领取”，孩子旁边写着“可替代”。林小满把纸压住，像怕那几个字真的替谁活下去。

现在不能只决定公开或隐瞒。先要确认这张表是否真的能影响发放，还是只在利用大家的恐惧。

+ [把酸奶实物重新按保质期摆开，检查日期是否跟着清点表变化]
    # ui:feedback
    # effect:flag=ch1_zone_a_yogurt_preparation,expiry_sorted_again
    # receipt:保质期复核记录
    ~ ch1_zone_a_yogurt_preparation = "复核保质期"
    盒身日期没有变，只有清点表在改。纸比食物更急着决定谁先被看见。
    -> ch1_zone_a_yogurt_list

+ [让林小满凭记忆确认第一行孩子今天是否领过物资]
    # ui:feedback
    # effect:flag=ch1_zone_a_yogurt_preparation,child_status_checked
    # companion:lin_xiaoman=疲惫,trust:+2
    ~ ch1_zone_a_yogurt_preparation = "确认孩子"
    她说那个孩子早上只领到一个空碗，连水都没来得及装。清点表听见似的，把孩子名字又往上顶了一格。
    -> ch1_zone_a_yogurt_list

+ [请志愿者先点人头，不让清点表直接决定发放顺序]
    # ui:feedback
    # effect:flag=ch1_zone_a_yogurt_preparation,headcount_first
    # district:temporary_shelter=社区庇护
    ~ ch1_zone_a_yogurt_preparation = "先点人头"
    人头数和酸奶数差了三盒。差额不大，却足够让每个人开始盯着别人手里的碗。
    -> ch1_zone_a_yogurt_list

+ [把清点表折起，只让林小满和见证志愿者看见异常排序]
    # ui:feedback
    # effect:flag=ch1_zone_a_yogurt_preparation,list_limited_to_witnesses
    # exposure:+1
    # companion:lin_xiaoman=疲惫,trust:+1
    ~ ch1_zone_a_yogurt_preparation = "限制知情"
    纸面被折成很窄的一条。它仍在里面动，像有人用指甲从折痕背后敲字。
    -> ch1_zone_a_yogurt_list

* [完成酸奶、清点表和人头数复核，决定谁先被承认]
    -> ch1_zone_a_yogurt_choice

=== ch1_zone_a_yogurt_choice ===
# screen:title=物资清点：谁先被承认
# screen:location=临时避难点便利店纸箱旁
# notice:LC-IX-004=decision;林小满同伴线
# receipt:酸奶发放签收页

纸箱只剩几排酸奶，避难点却还有一整晚。公开清点表会让每个人提前看见自己在死亡顺序里的位置；隐瞒它能暂时稳住队伍，却可能继续让第一行那个孩子被所有流程遗漏。

林小满没有替{protagonist_name}做决定。她把第一盒酸奶拿在手里，等{protagonist_name}说发给谁。

* [公开异常排序，先保护第一行孩子，再让居民共同核对]
    # effect:flag=ch1_zone_a_yogurt_decision,public_child_protected
    # effect:flag=flag_yogurt_list_public_child_saved,true
    # exposure:+10
    # companion:lin_xiaoman=稳定,trust:+4
    ~ ch1_zone_a_yogurt_decision = "公开并保护孩子"
    人群先是哗然，随后看见孩子喝下第一口酸奶。清点表把孩子名字划掉，没有消失，只在旁边写了“仍在场”。
    -> ch1_zone_a_departure

* [隐瞒清点表，按普通保质期和人头顺序发放]
    # effect:flag=ch1_zone_a_yogurt_decision,hidden_expiry_distribution
    # effect:flag=flag_yogurt_list_hidden,true
    # district:temporary_shelter=临时避难
    # companion:lin_xiaoman=疲惫,trust:-2
    ~ ch1_zone_a_yogurt_decision = "隐瞒按保质期发放"
    酸奶发得很快，队伍没有乱。林小满在签收页边角写下孩子的名字，像给这次隐瞒留一根很细的刺。
    -> ch1_zone_a_departure

* [不公开死亡顺序，只公布库存差额，请居民让出三盒给高风险者]
    # effect:flag=ch1_zone_a_yogurt_decision,shortage_public_priority_private
    # faction:queue_management=交易
    # companion:lin_xiaoman=疲惫,trust:+1
    ~ ch1_zone_a_yogurt_decision = "公开差额"
    {protagonist_name}没有念出清点表，只说差三盒。林小满把第一盒递给孩子，另两盒由志愿者送给病人陪护。有人不满，但还没有抢。
    -> ch1_zone_a_departure

=== ch1_zone_a_departure ===
# screen:title=片区A收束：临时避难点交接
# screen:location=临时避难点一号窗口
# notice:chapter=1,zone=A,end=临时避难点手续暂稳
# receipt:片区A交接包=配给更正页,通行复印限制记录,夜间值班表,酸奶签收页
# district:temporary_shelter=社区庇护

天色没有真正暗下去，只从白亮变成更薄的灰。盖章机被封在窗口下，复印件夹进限制记录，值班表贴在内侧通道，酸奶箱空了大半。临时避难点没有变安全，只是四套手续暂时没有继续互相吞人。

排队管理处要求{protagonist_name}把交接包送去社区服务中心。那里还有自动派单、档案室和下一轮补办手续。林小满抱起熟客名单，问{protagonist_name}要不要带上刚才的证据，还是先把避难点留给志愿者照看。

* [把证据袋、交接包和临时通行条一起带走]
    # effect:flag=ch1_zone_a_departure_method,evidence_package
    # receipt:片区A证据袋
    ~ ch1_zone_a_departure_method = "带走证据"
    {protagonist_name}把所有纸装进同一个防水袋。袋子很薄，却比口头解释更能撑过下一道窗口。
    -> ch1_zone_a_to_b

* [把原件留给志愿者，只带复写页去社区服务中心]
    # effect:flag=ch1_zone_a_departure_method,copies_only
    # district:temporary_shelter=社区庇护
    ~ ch1_zone_a_departure_method = "原件留点"
    志愿者接过原件，像接过一晚上的门。{protagonist_name}带走复写页，字迹浅一些，但还能证明这里发生过手续之外的事。
    -> ch1_zone_a_to_b

* [请林小满带熟客名单同行，路上继续核对被遗漏的人]
    # effect:flag=ch1_zone_a_departure_method,lin_list同行
    # companion:lin_xiaoman=疲惫,trust:+2
    ~ ch1_zone_a_departure_method = "林小满同行核对"
    林小满把名单夹进外套里。她说去社区服务中心可以，但如果那边也要把人写没，她会先骂人再签字。
    -> ch1_zone_a_to_b

=== ch1_zone_a_to_b ===
# screen:title=前往片区B
# screen:location=临时避难点至社区服务中心通道
# notice:handoff=ch1_zone_b_entry
# effect:flag=ch1_zone_a_completed,true
# exposure:+1

{protagonist_name}离开一号窗口时，叫号灯闪了一下。它没有叫{protagonist_name}的名字，只显示下一站：社区服务中心。

通道没有车，只能走过去。{protagonist_name}和林小满并排穿过临时拉起的胶带线，身后的避难点还在点名，声音追上来又被墙面折回去。

林小满问：“写进表里，就算活着吗？”

{protagonist_name}看着防水袋里那些回执、复写页和签收栏。它们能让窗口承认一个人还在场，却不能替那个人发热、走路、把酸奶让给孩子，或者在门响时醒过来。

林小满把熟客名单抱得更紧，说她以前只怕漏记欠账，现在怕一张表把人记得太整齐。{protagonist_name}和林小满继续往社区服务中心走，脚步声比叫号声慢，但至少还属于活人自己。

-> ch1_zone_b_entry
