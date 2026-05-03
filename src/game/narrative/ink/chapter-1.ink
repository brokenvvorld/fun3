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

长昼从三十七天前开始停在临川市上空。太阳没有落下，潮水却从地下管网往上返，把通行、配给、排水和户籍系统泡成一套仍在运转的旧手续。市政广播说九号枢纽区只是临时管控，可所有人都知道：只要名字从表里滑掉，床位、口粮和离开顺序就会跟着消失。

九号枢纽区原本是换乘站和社区商业带，现在被胶带、折叠桌和铁皮章盒改成临时避难点。社区服务大厅外排着两队人：一队等补办通行条，一队等确认自己还算不算本区居民。窗口上方的灯牌反复闪烁“错峰限行复核”，像一只不肯闭上的眼。排队管理处的人站在胶带线后，只负责维持队形，不负责解释为什么窗口里没有坐席。

{protagonist_name}不是来选择出身或职业的人。登记姓名刚在一号窗口前填过，系统还没有核验；胸前卡套里压着补办编号和一张皱掉的旧通行条。昨夜转移时，旧条被水泡烂，姓名还能看见，章面只剩半圈。

傍晚错峰限行复核前，{protagonist_name}必须补出新的临时通行条。过了点，系统会把这个名字记成“缺席补办”，床位、配给和下一轮离开顺序都可以被别人合法填上。目标很简单，也很危险：在窗口关闭前拿到新条，并弄清这些自动运转的手续为什么开始替活人做决定。

林小满不是突然来搭话的人。排队前半小时，{protagonist_name}看见她和两个志愿者把便利店纸箱搬到大厅边上；她一直用熟客名单帮老人和孩子确认谁已经到场，声音压得很低，像怕名单被窗口听见。她说店里剩下的临期酸奶和空碗都已经带来了，只想在窗口开办前确认熟客们还在名单上。

卷帘门半开，窗口里没有正式坐席。取号机却已经开始吐纸，第一张号票上印着{protagonist_name}的补办编号。旁边的临时章程写得很冷：“当前叫号人需协助完成本号关联材料整理，逾时视作缺席补办。”这不是任命，也不是工作，只是系统把补办人的麻烦和窗口的空缺绑在了一起。

排队管理处的人把铁皮章盒推到桌边，语气像在说“帮忙扶一下桌子”：先把自己这张号票相关的材料分出来，窗口才能继续叫下一批。可桌面上的回执、床位条和物资清点表已经混在一起，谁碰它们，谁就会被所有人当成能给出结果的人。那张号票没有给出“开始”按钮，只把三件事同时推到桌面上：窗口马上会被人群占满，林小满的名单随时可能被收走，章盒已经等着把第一份纸盖成结果。{protagonist_name}必须先决定从哪一处把局面拉住。

广播把“请按秩序办理”重复到第三遍时，人群没有变安静，只是学会了把声音压低。每个人都像一份等待盖章的材料，站得越久，越担心自己先被折旧。

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

-> END
