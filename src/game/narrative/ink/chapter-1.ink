// 第一章：补办窗口不会等人
// 最终版章节入口。内容分片承载，便于扩展到数十万字量级。

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
# screen:title=第一章：补办窗口不会等人
# screen:location=九号枢纽区临时避难点
# notice:chapter=1,goal=补办通行条
# choice:0:group=decision
# choice:0:target=procedure
# choice:0:label=补办窗口
# choice:0:mode=advance
# choice:0:surface=next_step
# choice:0:repeatable=false

长昼从三十七天前开始停在临川市上空。九号枢纽区被胶带、折叠桌和铁皮章盒改成临时避难点，广播还在说“错峰限行复核”，像这只是一场排队太久的办事事故。

周婶刚才还排在林小满前面，手里端着一个空碗。她问窗口能不能先补通行条，再回去拿给孩子留的酸奶。取号机吐出下一张号票时，队伍往前挪了半步，空碗落在地上；林小满的熟客名单里，“三单元周婶”那一行也一起变成了空白。

没人尖叫。更糟的是，排队管理处的人只低头看夹板，说系统没有查到这名排队人。队伍像被水泡过的纸，安静地起皱。林小满把名单按住，第一次抬头看向{protagonist_name}：“先别让它把名字擦干净。”

{protagonist_name}不是来选择出身或职业的人。登记姓名刚在一号窗口前填过，系统还没有核验；胸前卡套里压着补办编号和一张皱掉的旧通行条。旧条被昨夜的水泡烂，姓名还能看见，章面只剩半圈。

傍晚错峰限行复核前，{protagonist_name}必须补出新的临时通行条。过了点，系统会把这个名字记成“缺席补办”，床位、配给和下一轮离开顺序都可以被别人合法填上。周婶的空碗已经证明：名字滑掉时，人不会先发光或惨叫，只会被流程说成从没来过。

林小满不是突然来搭话的人。排队前半小时，{protagonist_name}看见她和两个志愿者把便利店纸箱搬到大厅边上；她一直用熟客名单帮老人和孩子确认谁已经到场。她说店里剩下的临期酸奶和空碗都已经带来了，只想在窗口开办前确认熟客们还在名单上。

卷帘门半开，窗口里没有正式坐席。取号机却已经开始吐纸，第一张号票上印着{protagonist_name}的补办编号。旁边的临时章程写得很冷：“当前叫号人需协助完成本号关联材料整理，逾时视作缺席补办。”这不是任命，也不是工作，只是系统把补办人的麻烦和窗口的空缺绑在了一起。

排队管理处的人把铁皮章盒推到桌边，语气像在说“帮忙扶一下桌子”：先把自己这张号票相关的材料分出来，窗口才能继续叫下一批。桌面上的回执、床位条和物资清点表已经混在一起；周婶留下的空碗就在桌脚滚了两圈。{protagonist_name}必须先保住自己的补办记录，也必须弄清一张名单为什么能把熟人擦掉。

* [走向一号窗口，接过那张正在吐出的号票]
    号票的纸边还带着热，编号却像已经在机器里等了很久。{protagonist_name}把它夹进卡套，不是去当工作人员，而是先保住自己的补办记录别被系统写成缺席。林小满抱着名单跟上来，一号窗口终于有了第一个还会质疑流程的人。
    -> ch1_zone_a_entry

=== ch1_end ===
# screen:title=第一章：现场记录归档
# screen:location=社区服务中心出口
# notice:chapter=1,end=补办窗口已关闭
# receipt:chapter-1=配给盖章机,临时通行条复印件,值班表空格,临期酸奶清点表,末日客服中心,地下档案室水线,叫号屏倒序,物业群第404条消息,消防门维修单,排水井回执,熟客名单缺页,第一处机枢渗水点
# effect:flag=chapter_1_completed,true

一号窗口的卷帘门落下。{protagonist_name}终于拿到一张临时通行条，章面湿得像刚从井里捞出来。

林小满把熟客名单重新夹好。她没有问{protagonist_name}做得对不对，只问下一站能不能先找一条不会点名的路。

第一章没有把所有事情解决。它只是让九号枢纽区第一次把{protagonist_name}的登记姓名、补办编号、通行条、熟客名单和未完成工单放到同一个档案袋里。

{ch1_fire_door_outcome == "老王楼栋消防门优先":
消防门维修单把老王楼栋写成优先救援，档案室这边几份撤离证明却已经被系统归成“完成”。这不是胜利，只是纸面承认了其中一边。
}
{ch1_fire_door_outcome == "档案室幸存者优先":
消防门维修单把档案室幸存者写回活人队列，老王楼栋方向的敲门声却被一枚“已完成”回执压住。林小满把这张单据单独夹起来，没有让它贴近熟客名单。
}
{ch1_fire_door_outcome == "补办编号承接责任":
消防门维修单没有替两边结案，却把责任栏改成{protagonist_name}的补办编号。它以后会绕过窗口，直接找这个编号说明为什么两边都还在待复核。
}

{ch1_drain_receipt_record == "确认下游承压":
排水井回执给出一条下行路线，也把“下游承压居民自愿承担”写成事实。井盖已经松动，欠条也已经跟着通行条一起进了档案袋。
}
{ch1_drain_receipt_record == "拒绝虚假自愿":
排水井回执没有被确认，水位也没有真正退下去。下游居民没有被写成“自愿”，代价是第二章可能要另找一条更慢、更难解释的路。
}
{ch1_drain_receipt_record == "并单挂起":
排水井回执和消防门维修单被订在一起，路线既没有关闭，也没有真正开放。市政回声很喜欢这种并单，因为它知道以后可以继续追问谁来签最后一页。
}

{ch1_customer_list_outcome == "林小满亲手更正":
熟客名单缺页被林小满亲手更正，恢复的人重新拥有生活痕迹，另一批边缘居民的通行资格却被标成“证据冲突”。她说自己记住了，这句话比任何章都重。
}
{ch1_customer_list_outcome == "主角代填并隐瞒":
熟客名单看上去被补齐，页脚却多出{protagonist_name}的补办编号。林小满很快会发现字迹不是她的，市政回声也会记住这个更省事的借口。
}
{ch1_customer_list_outcome == "移交排队管理处":
熟客名单缺页被排队管理处收走，眼前这批人暂时能继续办理，林小满却失去原件。名单不再只是回忆，它变成了别人手里的证据。
}

{ch1_first_core_leak_outcome == "实名切断":
第一处机枢渗水点被实名切断，假声音停了，市脉机枢也开始记住{protagonist_name}的补办编号。从这一刻起，暴露值有了下限。
}
{ch1_first_core_leak_outcome == "临时托管":
第一处机枢渗水点被临时托管，假声音还在借{protagonist_name}的名义指挥，但每句话都必须附带真实代价。混乱被争取成时间，名字也被借给了系统。
}
{ch1_first_core_leak_outcome == "假声音继续":
第一处机枢渗水点没有被切断，假声音用{protagonist_name}的语气维持秩序。林小满看见队伍重新移动，也看见系统把这个声音存了下来。
}

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
