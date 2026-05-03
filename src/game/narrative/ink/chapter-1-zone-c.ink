// 第一章片区 C：积水档案室
// 覆盖 LC-IX-009 到 LC-IX-012。结构以档案室推进为主，分支为手续后果而非单异象菜单。

=== ch1_zone_c_entry ===
# screen:title=第一章：积水档案室
# screen:location=社区服务中心地下档案室
# notice:zone=C,anomaly=LC-IX-009..LC-IX-012
# notice:goal=处理消防门维修单、排水井回执、熟客名单缺页与机枢渗水点
# receipt:zone-c=待核验档案袋
# district:flooded_archive=积水待排
# choice:0:group=document
# choice:0:target=documents
# choice:0:label=防水袋
# choice:0:mode=operate
# choice:0:surface=modal
# choice:0:repeatable=true
# choice:1:group=person
# choice:1:target=lin_xiaoman
# choice:1:label=林小满
# choice:1:mode=talk
# choice:1:surface=modal
# choice:1:repeatable=true
# choice:2:group=place
# choice:2:target=waterline
# choice:2:label=水线
# choice:2:mode=inspect
# choice:2:surface=modal
# choice:2:repeatable=true
# choice:3:group=place
# choice:3:target=fire_door
# choice:3:label=消防门
# choice:3:mode=inspect
# choice:3:surface=modal
# choice:3:repeatable=true
# choice:4:group=procedure
# choice:4:target=route
# choice:4:label=浅水路线
# choice:4:mode=inspect
# choice:4:surface=modal
# choice:4:repeatable=true
# choice:5:group=person
# choice:5:target=lin_xiaoman
# choice:5:label=林小满
# choice:5:mode=talk
# choice:5:surface=modal
# choice:5:repeatable=true
# choice:6:group=document
# choice:6:target=documents
# choice:6:label=现场照片
# choice:6:mode=operate
# choice:6:surface=modal
# choice:6:repeatable=true
# choice:7:group=decision
# choice:7:target=procedure
# choice:7:label=积水档案室
# choice:7:mode=advance
# choice:7:surface=next_step
# choice:7:repeatable=false

地下档案室的门被半截泡胀的登记台顶住。水从门缝里往外吐，像有人在里面反复冲洗同一份表格。

林小满把熟客名单夹在雨衣内侧，指腹压住纸角。她说：“这里的水不是只泡纸。它在挑人。”

{protagonist_name}和林小满必须往里走。消防门维修单、排水井回执、熟客名单缺页，还有第一处机枢渗水点，都被积水推到同一张长桌上。

门后的水位还没到膝盖，手续却已经在水下互相认领。贸然进去会让上一片区的回执泡散；停太久，维修单和名单缺页会先替人结案。进入前能做的准备不多，每一步都要说明{protagonist_name}打算保护哪一种证据。

* [先把上一片区留下的通行条和回执装进防水袋]
  # effect:flag=ch1_zone_c_intake_ordered,true
  # receipt:防水袋编号=临时通行条,配给回执,客服工单
  {protagonist_name}把所有纸件按编号排开。水汽很快在防水袋内侧凝成一层雾，编号仍能看清，像被城市暂时承认。
  -> ch1_zone_c_entry

* [先让林小满复述熟客名单的缺页位置]
  # companion:lin_xiaoman=稳定,trust:+2
  # notice:companion=林小满确认熟客名单缺页不是自然撕落
  林小满没有翻名单。她直接背出缺页前后的名字、常买的东西、欠账数。背到缺页处，她停了一下，说那几个人刚才还在避难点里排队。
  -> ch1_zone_c_entry

* [先检查门边水线，确认它是否还在上涨]
  # exposure:+1
  # districtExposure:flooded_archive=2
  水线没有顺着墙面上升，而是顺着档案柜标签上升。被水碰到的抽屉，会先把姓名栏洇开，再把死亡证明的抬头印出来。
  -> ch1_zone_c_entry

* [先对着半开的门缝喊老王楼栋的消防门编号]
  # exposure:+2
  # notice:fire-door=水下回声能复述老王楼栋门号
  门里传来一声很轻的“已受理”。那不是老王的声音，也不是窗口人员的声音，更像维修单背面空白处在替{protagonist_name}回话。
  -> ch1_zone_c_entry

* [先把排队管理处的夹板垫在脚下，试出最浅路线]
  # faction:queue_management=警惕
  # district:flooded_archive=积水待排
  夹板边缘被水啃出白沫。{protagonist_name}踩着红章印子往前挪，发现最浅的路线正好绕过了所有写着“已转移”的档案柜。
  -> ch1_zone_c_entry

* [请林小满先不要把名单交给任何窗口]
  # companion:lin_xiaoman=稳定,trust:+1
  林小满把名单塞得更深。她说：“{protagonist_name}说不交，我就不交。但{protagonist_name}要记得，不交也算一种手续。”
  -> ch1_zone_c_entry

* [先把档案室入口的积水照片贴到当前工单后]
  # effect:flag=ch1_archive_photo_attached,true
  # receipt:现场照片=积水档案室入口
  照片刚吐出来，背面自动多出一行小字：照片仅证明水存在，不证明水造成的后果。
  -> ch1_zone_c_entry

+ [带着已保护的证据压低身体，进入积水档案室]
  # screen:location=积水档案室
  # notice:phase=档案室推进
  {protagonist_name}推开门。档案室里的灯管一盏盏亮起，光色像放久了的应急食品。水面漂着纸屑、门禁卡、半枚红章，还有一张写着“消防门维修单”的硬纸。
  -> ch1_zone_c_fire_door_dossier

=== ch1_zone_c_fire_door_dossier ===
# screen:title=第一章：消防门维修单
# screen:location=积水档案室长桌
# notice:anomaly=LC-IX-009,object=消防门维修单
# receipt:LC-IX-009=消防门维修单待签

长桌被水泡得发白，桌面却干得反常。消防门维修单压在最中间，单据要求{protagonist_name}在“老王楼栋”和“档案室幸存者”之间确认一项已完成救援。

维修单旁边没有笔。水面上浮着三支笔，每支笔都写着{protagonist_name}的补办编号。

* [逐项核对维修单抬头和{protagonist_name}自己的补办编号]
  # exposure:+1
  # effect:flag=ch1_fire_order_checked,true
  抬头写的是老王楼栋，申请人却是{protagonist_name}的补办编号。{protagonist_name}越核对，编号越清晰，像这张维修单早就等{protagonist_name}下来签收。
  -> ch1_zone_c_fire_door_dossier

* [翻到维修单背面，查找责任说明]
  # notice:fire-door=背面责任说明提前写好
  背面只有一句话：未签字者默认接受系统代签。代签结果不可申诉，申诉窗口已转移安置。
  -> ch1_zone_c_fire_door_dossier

* [让林小满听水压后的敲门声]
  # companion:lin_xiaoman=疲惫,trust:+2
  # exposure:+1
  林小满蹲下去听。水下有三短两长的敲击，像有人用门轴回话。她脸色变差，却坚持把节奏记在熟客名单边角。
  -> ch1_zone_c_fire_door_dossier

* [检查档案柜里“已转移安置”的抽屉]
  # district:flooded_archive=积水待排
  抽屉里不是档案，是一叠空白撤离证明。每张证明只差一个章。{protagonist_name}知道只要盖下去，就会有一批人从系统里变成已经获救。
  -> ch1_zone_c_fire_door_dossier

* [用鞋跟抵住消防门方向的水流]
  # districtExposure:flooded_archive=3
  # exposure:+2
  水流从{protagonist_name}脚边绕开，像不想伤到{protagonist_name}，又像不想浪费力气。远处那扇门发出金属被压弯的声音。
  -> ch1_zone_c_fire_door_dossier

* [把老王楼栋的名字写在便签上，贴到维修单左侧]
  # receipt:便签=老王楼栋消防门
  便签刚贴上，纸面自动出现“楼栋居民已知情”的小字。林小满皱眉：“他们知道什么？知道自己被写进去了？”
  -> ch1_zone_c_fire_door_dossier

* [把档案室幸存者数量写在维修单右侧]
  # receipt:便签=档案室幸存者数量
  数字被水汽改了两次。{protagonist_name}写的是估数，它改成了精确人数，又把其中一人标成“手续不全”。
  -> ch1_zone_c_fire_door_dossier

* [询问林小满是否记得这些幸存者来过便利店]
  # companion:lin_xiaoman=疲惫,trust:+1
  她说记得几个。买过创可贴、矿泉水、临期酸奶。她记得他们，不代表系统记得他们。
  -> ch1_zone_c_fire_door_dossier

* [把维修单举到灯下，看印章水印]
  # faction:municipal_echo=警惕
  # notice:fire-door=水印来自市政回声旧流程
  水印不是部门章，而是一圈圈叫号屏残影。它们把“救援”两个字拆成许多小格，格子里每个名字都只能占一次。
  -> ch1_zone_c_fire_door_dossier

+ [拿起笔，进入消防门维修单签字环节]
  # notice:irreversible=消防门维修单即将写入后续街区状态
  水面安静下来，像档案室终于等到它真正要的动作。
  -> ch1_zone_c_fire_door_decision

=== ch1_zone_c_fire_door_decision ===
# screen:title=第一章：消防门维修单签字
# screen:location=积水档案室消防门侧
# notice:decision=硬不可逆节点
# notice:anomaly=LC-IX-009

维修单上的两个选项都已经盖了半枚章。{protagonist_name}只能把另一半补上。

水下敲门声和档案柜后的呼吸声同时变急。继续拖延会触发代签，维修单会替{protagonist_name}选一个“已完成救援”；现在签字则必须把哪一边先被系统承认、哪一边被结案的后果一起带走。

* [补齐老王楼栋那半枚章，优先打开消防门]
  # effect:irreversible=ch1_fire_door_rescue,old_wang_building
  # effect:flag=ch1_fire_door_choice,old_wang_building
  # district:flooded_archive=转移安置
  # district:service_center=贴封管控
  # faction:queue_management=交易
  # exposure:+4
  # receipt:LC-IX-009=老王楼栋消防门优先维修
  ~ ch1_fire_door_outcome = "老王楼栋消防门优先"
  {protagonist_name}补上最后半枚章。水压猛地向消防门方向退去，远处传来门轴松开的声音。与此同时，档案室这边几份撤离证明自动归档为“救援已完成”。
  林小满没有立刻说话。她只是把那几张空白证明从水里捞出来，发现它们已经不能再盖章。
  -> ch1_zone_c_drain_receipt

* [补齐档案室幸存者那半枚章，优先打开隔门]
  # effect:irreversible=ch1_fire_door_rescue,archive_survivors
  # effect:flag=ch1_fire_door_choice,archive_survivors
  # district:flooded_archive=转移安置
  # district:downstream_block=错峰限行
  # faction:queue_management=警惕
  # companion:lin_xiaoman=疲惫,trust:+2
  # exposure:+5
  # receipt:LC-IX-009=档案室幸存者优先转移
  ~ ch1_fire_door_outcome = "档案室幸存者优先"
  {protagonist_name}把章补在右侧。档案柜后的隔门咔哒一声打开，几名被困的人从水线后面爬出来。消防门方向的敲击声停住，维修单自动生成老王楼栋“已完成救援”的回执。
  林小满低声说：“它把没有救到的人也结案了。”
  -> ch1_zone_c_drain_receipt

* [拒绝两个预设选项，把{protagonist_name}的补办编号签进责任栏]
  # effect:irreversible=ch1_fire_door_rescue,protagonist_liability
  # effect:flag=ch1_fire_door_choice,protagonist_liability
  # district:flooded_archive=贴封管控
  # faction:queue_management=敌对
  # faction:municipal_echo=交易
  # companion:lin_xiaoman=疲惫,trust:+1
  # exposure:+8
  # receipt:LC-IX-009=责任栏由补办编号承接
  ~ ch1_fire_door_outcome = "补办编号承接责任"
  {protagonist_name}没有在两栏之间选。{protagonist_name}把补办编号写进责任栏。维修单停顿了很久，随后把两边救援都改成“待个人复核”。水压没有退，只是把下一张单据推到{protagonist_name}面前。
  林小满看{protagonist_name}的眼神变得复杂：“{protagonist_name}这是把自己写进去了。它以后会找{protagonist_name}。”
  -> ch1_zone_c_drain_receipt

=== ch1_zone_c_drain_receipt ===
# screen:title=第一章：排水井回执
# screen:location=积水档案室排水井旁
# notice:anomaly=LC-IX-010,object=排水井回执
# receipt:LC-IX-010=排水井回执待确认

长桌下方有一个被档案箱挡住的排水井。井盖没有锁，锁孔里塞着一张回执。回执已经写好结果，只等{protagonist_name}确认“下游承压居民自愿承担”。

水从井盖缝里往上冒，却又在靠近回执时自动退开。

林小满回头看了一眼消防门方向，像终于确认{protagonist_name}不是窗口的人，却也不是能替所有人免除签字的人。

* [先不动井盖，核对回执编号]
  # effect:flag=ch1_drain_receipt_checked,true
  回执编号属于市政管网条线，附注却写着“错峰限行已通知”。{protagonist_name}没有看到任何通知记录。
  -> ch1_zone_c_drain_receipt

* [把消防门维修单压在排水井回执上方]
  # receipt:关联单据=消防门维修单,排水井回执
  两张纸一接触，水面冒出细小气泡。气泡里有门轴声，也有很远的排水声。
  -> ch1_zone_c_drain_receipt

* [询问林小满下游承压片区是否有人来过店里]
  # companion:lin_xiaoman=稳定,trust:+1
  她说有。来得少，买东西总挑最便宜的，付账时会问能不能晚两天。她不喜欢回执里那句“自愿”。
  -> ch1_zone_c_drain_receipt

* [检查井盖边缘的维修刻痕]
  # notice:drain=井盖被多次从下方打开
  刻痕不在外圈，而在井盖内侧。有人或什么东西曾经从下方把它推开，又小心地合回去。
  -> ch1_zone_c_drain_receipt

* [用手电照进排水井]
  # exposure:+2
  # districtExposure:flooded_archive=2
  光照不到底。井壁有一圈旧字：排水不是消失，只是把水交给下一个名字。
  -> ch1_zone_c_drain_receipt

* [把回执上的“自愿承担”圈出来]
  # faction:queue_management=警惕
  圈线刚画完，回执下方自动生成一行“已充分告知”。{protagonist_name}划掉它，它又浅浅浮回来。
  -> ch1_zone_c_drain_receipt

* [查找是否有第二章地下路线的标记]
  # notice:route=排水井可连接地下替代路线
  # receipt:路线线索=排水井下行方向
  井壁上确实有箭头，不是地图箭头，而是一串错峰限行时间。它们像一条可以走的路，也像一张提前开好的欠条。
  -> ch1_zone_c_drain_receipt

* [让林小满把“下游承压”写成具体居民]
  # companion:lin_xiaoman=疲惫,trust:+2
  她写了三行，停下，把笔还给{protagonist_name}：“写具体了，就没办法装作只是片区状态。”
  -> ch1_zone_c_drain_receipt

+ [决定是否确认排水井回执]
  # notice:decision=排水井回执将影响第二章地下路线
  井盖轻轻响了一下，像有人在下面催办。
  -> ch1_zone_c_drain_decision

=== ch1_zone_c_drain_decision ===
# screen:title=第一章：排水井回执确认
# screen:location=积水档案室排水井旁
# notice:anomaly=LC-IX-010

排水井回执要求一个明确结果。{protagonist_name}可以换来一条路，也可以保住一句没有人真正同意过的话。

井盖下方已经有风，说明路线真实存在；回执上的“自愿承担”也同样真实地准备写进下游片区。林小满看着消防门维修单的结果，等{protagonist_name}把开路、拒签和并单三种代价说清。

* [确认回执，打开排水井下行路线]
  # effect:irreversible=ch1_drain_receipt,confirmed_downstream_burden
  # effect:flag=ch1_underground_route_seed,true
  # district:flooded_archive=积水待排
  # district:downstream_block=停供断线
  # faction:underground_banquet=交易
  # exposure:+3
  # receipt:LC-IX-010=排水井回执已确认,地下路线线索开启
  ~ ch1_drain_receipt_record = "确认下游承压"
  {protagonist_name}按下确认。井盖向下错开半寸，湿冷空气从下面涌上来。回执背面出现一条能在第二章继续追的下行路线。
  另一行字同时浮现：下游承压片区已完成自愿确认。{protagonist_name}知道那不是事实。
  -> ch1_zone_c_customer_list

* [拒绝确认，把“自愿承担”改成“未征询”]
  # effect:irreversible=ch1_drain_receipt,rejected_false_consent
  # effect:flag=ch1_underground_route_seed,false
  # district:flooded_archive=积水待排
  # district:downstream_block=错峰限行
  # faction:queue_management=敌对
  # companion:lin_xiaoman=疲惫,trust:+2
  # exposure:+2
  # receipt:LC-IX-010=排水井回执未确认
  ~ ch1_drain_receipt_record = "拒绝虚假自愿"
  {protagonist_name}把“自愿承担”改成“未征询”。井盖立刻沉回原位，水位没有下降。回执没有消失，只是把第二章路线标成“需另行证明”。
  林小满松了一口气，又很快意识到积水还在。
  -> ch1_zone_c_customer_list

* [暂缓确认，要求把消防门后果并入同一张回执]
  # effect:irreversible=ch1_drain_receipt,merged_with_fire_order
  # effect:flag=ch1_underground_route_seed,conditional
  # district:flooded_archive=贴封管控
  # faction:municipal_echo=交易
  # exposure:+5
  # receipt:LC-IX-010=排水井回执并入消防门维修单
  ~ ch1_drain_receipt_record = "并单挂起"
  {protagonist_name}把两张单据订在一起。水面短暂变平，像有人终于看见了代价之间的关系。随后回执生成“并单挂起”，路线没有关闭，也没有真正开放。
  -> ch1_zone_c_customer_list

=== ch1_zone_c_customer_list ===
# screen:title=第一章：熟客名单缺页
# screen:location=积水档案室户籍柜
# notice:anomaly=LC-IX-011,object=熟客名单缺页
# receipt:LC-IX-011=熟客名单缺页待处理

户籍柜最下面一层没有被水泡软，反而干得发脆。林小满的熟客名单在这里自己翻开，缺页边缘整齐得像被窗口裁刀切过。

缺页对应的人还在避难点里。档案柜却已经把他们标成“未能证明存在”。

林小满把排水井回执压在掌心下，信任没有少，只是从跟着{protagonist_name}走，变成了每走一步都要一起看清谁在承压。

* [让林小满亲手数一遍缺页前后的熟客]
  # companion:lin_xiaoman=疲惫,trust:+2
  她数得很慢。每一个名字后面都跟着一种生活痕迹：常买药的、给孩子带酸奶的、总问能不能先赊半袋米的。
  -> ch1_zone_c_customer_list

* [把缺页边缘和户籍柜裁口对齐]
  # exposure:+2
  # notice:list=缺页与户籍柜裁口吻合
  边缘完全吻合。不是名单被撕进柜子里，而是户籍柜从名单里裁走了几个人。
  -> ch1_zone_c_customer_list

* [翻找户籍柜里是否有对应居民的正式档案]
  # district:flooded_archive=积水待排
  {protagonist_name}找到几只空档案袋，袋脊写着姓名，里面只有一张便利店小票。小票比身份证明更诚实，却不被窗口承认。
  -> ch1_zone_c_customer_list

* [把便利店小票夹进缺页位置]
  # receipt:临时证据=便利店小票
  小票被名单吸住，像找到了回家的地方。名单没有完整，只是停止继续掉页。
  -> ch1_zone_c_customer_list

* [询问林小满是否要知道被裁走的全部名字]
  # companion:lin_xiaoman=疲惫,trust:+1
  林小满说要。她说如果不知道名字，就只剩“人数”，而人数是最容易被改掉的。
  -> ch1_zone_c_customer_list

* [把缺页居民和消防门结果放在同一张纸上]
  # receipt:关联记录=熟客名单缺页,消防门维修单
  两份记录放到一起后，{protagonist_name}看见同一个名字被写成三种状态：已转移、未登记、等待确认。
  -> ch1_zone_c_customer_list

* [把排水井回执压到名单下方，观察水迹]
  # notice:list=缺页水迹指向下游承压片区
  水迹从缺页边缘渗出，指向排水井回执的“下游承压”。这些手续不是并排发生的，它们互相喂养。
  -> ch1_zone_c_customer_list

* [请林小满说一句不是给系统听的话]
  # companion:lin_xiaoman=稳定,trust:+3
  她想了很久，说：“他们不是库存，不是负担，不是自愿承担。他们来买东西，会挑，还会嫌贵。”
  -> ch1_zone_c_customer_list

* [把名单对着灯，查找被压住的字]
  # exposure:+1
  # notice:list=缺页下有第三章校验失败痕迹
  灯下浮出一串很淡的校验码。它还没有发生，却已经在名单背面排队，等第三章来找林小满。
  -> ch1_zone_c_customer_list

+ [决定如何处理熟客名单缺页]
  # notice:decision=名单恢复会永久损坏另一批通行资格
  户籍柜打开一条缝，露出三枚可用的章：更正、代填、移交。
  -> ch1_zone_c_list_decision

=== ch1_zone_c_list_decision ===
# screen:title=第一章：熟客名单缺页处置
# screen:location=积水档案室户籍柜
# notice:anomaly=LC-IX-011

熟客名单缺页不能被完整修复。{protagonist_name}和林小满能恢复一批名字，也会让另一批人的通行资格永久损坏。

户籍柜把三枚章推到水边，不是让{protagonist_name}挑一个立场，而是在催促谁来承担字迹。让林小满更正，真相会留在她手上；由{protagonist_name}代填，伤口会被暂时盖住；交给排队管理处，眼前名单有效，缺页就会离开两人的控制。

* [让林小满亲手盖更正章，把真相留在名单上]
  # effect:irreversible=ch1_customer_list_repair,truth_by_lin_xiaoman
  # effect:flag=ch1_customer_list_choice,truth_by_lin_xiaoman
  # companion:lin_xiaoman=创伤,trust:+5
  # district:flooded_archive=积水待排
  # exposure:+4
  # receipt:LC-IX-011=林小满亲手更正缺页
  ~ ch1_customer_list_outcome = "林小满亲手更正"
  林小满盖下“更正”。名单补回一页，字迹是她自己的。被恢复的人重新拥有可查证的痕迹，另一批边缘居民的通行资格却被系统标成“证据冲突”。
  她把章还给{protagonist_name}，手一直在抖：“我记住了。不是它记住，是我记住。”
  -> ch1_zone_c_core_leak

* [{protagonist_name}盖代填章，暂时隐瞒名单曾经裁走活人]
  # effect:irreversible=ch1_customer_list_repair,protagonist_concealed
  # effect:flag=ch1_customer_list_choice,protagonist_concealed
  # companion:lin_xiaoman=疲惫,trust:-4
  # faction:municipal_echo=交易
  # exposure:+2
  # receipt:LC-IX-011=缺页由补办编号代填
  ~ ch1_customer_list_outcome = "主角代填并隐瞒"
  {protagonist_name}盖下“代填”。名单看上去恢复了，林小满也暂时不用亲眼看见全部缺口。可是她很快发现字迹不像她，页脚还多了{protagonist_name}的补办编号。
  市政回声在远处的管线里轻响，像学会了一个更好用的借口。
  -> ch1_zone_c_core_leak

* [把缺页移交给排队管理处，换取当前名单暂时有效]
  # effect:irreversible=ch1_customer_list_repair,submitted_to_queue_authority
  # effect:flag=ch1_customer_list_choice,submitted_to_queue_authority
  # companion:lin_xiaoman=创伤,trust:-7
  # faction:queue_management=交易
  # district:service_center=贴封管控
  # exposure:+3
  # receipt:LC-IX-011=熟客名单缺页移交排队管理处
  ~ ch1_customer_list_outcome = "移交排队管理处"
  {protagonist_name}盖下“移交”。当前名单被临时承认，窗口会放过眼前这一批人。缺页原件被收走，林小满盯着空出来的夹层，像看见便利店货架被整排清空。
  -> ch1_zone_c_core_leak

=== ch1_zone_c_core_leak ===
# screen:title=第一章：第一处机枢渗水点
# screen:location=积水档案室维护节点
# notice:anomaly=LC-IX-012,object=第一处机枢渗水点
# receipt:LC-IX-012=维护节点记录待封存
# district:flooded_archive=贴封管控

名单处置刚落章，档案室尽头的墙面裂开一道细缝。水不是从外面渗进来，而是从一只旧维护盒里渗出。

林小满这次没有先护住名单，而是先看向{protagonist_name}，像把最后一点信任从纸上挪到了活人身上。

维护盒上没有单位名称，只有一行被锈蚀包住的小字：市脉机枢临时接口。水滴落到地面时，开始模仿{protagonist_name}的声音。

它用{protagonist_name}的语气对门外的人说：“按我的名义撤离。”

* [先记录维护盒编号，不回应水声]
  # effect:flag=ch1_core_leak_numbered,true
  # receipt:维护盒编号=市脉机枢临时接口
  编号像活的一样在纸上移动，最后停在{protagonist_name}的补办编号旁边。它们看上去过于相配。
  -> ch1_zone_c_core_leak

* [让林小满确认水声是否像{protagonist_name}]
  # companion:lin_xiaoman=疲惫,trust:+1
  # exposure:+1
  她说像，但更顺从，更像窗口希望{protagonist_name}说话的样子。那声音不会犹豫，也不会解释代价。
  -> ch1_zone_c_core_leak

* [对门外喊“不要听水里的声音”]
  # exposure:+4
  # districtExposure:flooded_archive=3
  门外短暂安静，随后更多人开始问：“那现在听谁的？”{protagonist_name}的真实声音把问题从水里带回了人群。
  -> ch1_zone_c_core_leak

* [检查维护盒是否连接排水井]
  # notice:core=维护盒借排水井扩音
  # faction:municipal_echo=警惕
  维护盒下面的线缆钻进排水井方向。水声不是只在档案室里扩散，它沿着管网，把{protagonist_name}的名义送往更低处。
  -> ch1_zone_c_core_leak

* [把消防门维修单贴到维护盒侧面]
  # receipt:关联记录=机枢渗水点,消防门维修单
  维修单贴上去后，水声停顿了一秒，像读到了刚才那次不可逆选择。随后它用{protagonist_name}的声音念出签字结果。
  -> ch1_zone_c_core_leak

* [把熟客名单缺页贴到维护盒侧面]
  # companion:lin_xiaoman=疲惫,trust:+1
  # receipt:关联记录=机枢渗水点,熟客名单缺页
  水声开始念名字。林小满按住名单，低声纠正它念错的几个音。每纠正一次，水滴就慢一拍。
  -> ch1_zone_c_core_leak

* [把排水井回执贴到维护盒侧面]
  # receipt:关联记录=机枢渗水点,排水井回执
  维护盒里的水倒吸回去半寸，又立刻渗出更多。它像终于承认这些回执来自同一条漏水的根。
  -> ch1_zone_c_core_leak

* [倾听水声里是否有市政回声]
  # faction:municipal_echo=交易
  # exposure:+2
  {protagonist_name}听见一种旧系统的礼貌：请确认、请签收、请承担、请撤离。礼貌下面还有更低的声音，不属于任何窗口。
  -> ch1_zone_c_core_leak

+ [处理第一处机枢渗水点]
  # notice:decision=章节尾声不可逆节点
  维护盒的锈皮剥落，露出三枚手动拨片：实名切断、临时托管、放任指挥。
  -> ch1_zone_c_core_decision

=== ch1_zone_c_core_decision ===
# screen:title=第一章：机枢渗水点处置
# screen:location=积水档案室维护节点
# notice:anomaly=LC-IX-012
# notice:decision=机枢渗水点将决定暴露值下限和后续点名

水声继续用{protagonist_name}的声音叫人撤离。{protagonist_name}现在知道，所谓档案室积水不是一处漏水，而是一串手续把代价往低处推。

门外已经有人开始按假声音移动。切断能马上夺回{protagonist_name}的声音，却会让市脉机枢记住补办编号；托管能把代价播出去，但等于把声音继续借给系统；放任最稳，也最容易让所有人以后只听见那个假版本。

* [实名切断维护节点，把{protagonist_name}的补办编号暴露给市脉机枢]
  # effect:irreversible=ch1_first_core_leak,cut_by_real_name
  # effect:flag=ch1_core_leak_choice,cut_by_real_name
  # exposure:floor=35
  # exposure:+6
  # district:flooded_archive=贴封管控
  # faction:municipal_echo=警惕
  # companion:lin_xiaoman=疲惫,trust:+3
  # receipt:LC-IX-012=实名切断第一处机枢渗水点
  ~ ch1_first_core_leak_outcome = "实名切断"
  {protagonist_name}把补办编号按在实名切断拨片上。维护盒发出一声很低的震动，水声被掐断，门外的人终于听不见假冒的{protagonist_name}。
  代价也立刻写好：市脉机枢开始点名{protagonist_name}，异象暴露值从此有了下限。
  -> ch1_zone_c_wrap

* [临时托管水声，让它继续指挥但必须附带真实代价]
  # effect:irreversible=ch1_first_core_leak,temporary_custody
  # effect:flag=ch1_core_leak_choice,temporary_custody
  # exposure:floor=28
  # exposure:+4
  # district:flooded_archive=转移安置
  # faction:municipal_echo=交易
  # companion:lin_xiaoman=疲惫,trust:-1
  # receipt:LC-IX-012=机枢渗水点临时托管
  ~ ch1_first_core_leak_outcome = "临时托管"
  {protagonist_name}没有立刻切断水声，而是把消防门、排水井和名单代价逐条贴到维护盒上。假声音还在用{protagonist_name}的名义指挥，却每句话后面都被迫念出会牺牲谁。
  这换来一段混乱但可用的撤离时间，也让市政回声学会把{protagonist_name}的名字当作临时接口。
  -> ch1_zone_c_wrap

* [放任假声音继续指挥，保住眼前秩序]
  # effect:irreversible=ch1_first_core_leak,false_voice_continues
  # effect:flag=ch1_core_leak_choice,false_voice_continues
  # exposure:floor=18
  # district:flooded_archive=转移安置
  # faction:municipal_echo=信任
  # companion:lin_xiaoman=创伤,trust:-6
  # receipt:LC-IX-012=假声音继续以补办编号指挥
  ~ ch1_first_core_leak_outcome = "假声音继续"
  {protagonist_name}松开手。假声音立刻变得清晰，门外的脚步开始统一移动，秩序看起来恢复了。
  林小满看着{protagonist_name}，像第一次不确定{protagonist_name}和系统站在哪一边。维护盒没有再漏水，它只是把{protagonist_name}的声音存了下来。
  -> ch1_zone_c_wrap

=== ch1_zone_c_wrap ===
# screen:title=第一章：积水档案室归档
# screen:location=积水档案室出口
# notice:zone=C,resolution=消防门、排水井、熟客名单与机枢渗水点已收束
# receipt:zone-c=消防门维修单,排水井回执,熟客名单缺页记录,维护节点记录
# effect:flag=ch1_zone_c_completed,true
# district:flooded_archive=贴封管控

积水档案室没有真正干下去。它只是停止继续上涨，像一场手续终于被迫暂停。

{protagonist_name}带走四样东西：消防门维修单的签字结果，排水井回执的确认状态，熟客名单缺页的处理记录，和第一处机枢渗水点留下的维护节点编号。

林小满把名单重新夹好。她没有问{protagonist_name}做得对不对，只说：“它已经不只是学{protagonist_name}的声音了。”

档案室门在身后合上，水声被关在里面，门外的广播却第一次没有叫号码、楼栋或片区。它清清楚楚点出{protagonist_name}的补办编号，请{protagonist_name}前往下一处置区。

-> ch1_end
