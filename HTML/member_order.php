<?php
include("_config.php");
include($inc_path."_getpage.php");
$go = "member_login.php";
include("log.php");
?>
<?
$page=request_pag("page");
$querystr="page=".$page;

$table = "ceo_order";
$db = new Database($HS, $ID, $PW, $DB);
$db->connect();
$sql="select $table.*
	,car.title2 as pid_title2
	,car.price as pid_price
	,car.timeend as pid_timeend
	,car.total as pid_total
	,car.scontent2 as scontent2
	,car2.title as uid_title
from $table 
	left join ceo_product as car on car.id=$table.pid 
	left join ceo_user as car2 on car2.id=$table.uid 
where 1 and uid = ".$_SESSION["uid"]." and car.timeend > '".date("Y-m-d H:i:s")."' order by $table.id desc";
//echo $sql;
//echo request_cd(); 
getsql($sql,10,$querystr);
?>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title><?=$webname?></title>
<style type="text/css">
body {
	margin-left: 0px;
	margin-top: 0px;
	margin-right: 0px;
	margin-bottom: 0px;
}
</style>
<link href="01.css" rel="stylesheet" type="text/css" />
<script type="text/javascript">
function MM_preloadImages() { //v3.0
  var d=document; if(d.images){ if(!d.MM_p) d.MM_p=new Array();
    var i,j=d.MM_p.length,a=MM_preloadImages.arguments; for(i=0; i<a.length; i++)
    if (a[i].indexOf("#")!=0){ d.MM_p[j]=new Image; d.MM_p[j++].src=a[i];}}
}
function MM_swapImgRestore() { //v3.0
  var i,x,a=document.MM_sr; for(i=0;a&&i<a.length&&(x=a[i])&&x.oSrc;i++) x.src=x.oSrc;
}
function MM_findObj(n, d) { //v4.01
  var p,i,x;  if(!d) d=document; if((p=n.indexOf("?"))>0&&parent.frames.length) {
    d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);}
  if(!(x=d[n])&&d.all) x=d.all[n]; for (i=0;!x&&i<d.forms.length;i++) x=d.forms[i][n];
  for(i=0;!x&&d.layers&&i<d.layers.length;i++) x=MM_findObj(n,d.layers[i].document);
  if(!x && d.getElementById) x=d.getElementById(n); return x;
}

function MM_swapImage() { //v3.0
  var i,j=0,x,a=MM_swapImage.arguments; document.MM_sr=new Array; for(i=0;i<(a.length-2);i+=3)
   if ((x=MM_findObj(a[i]))!=null){document.MM_sr[j++]=x; if(!x.oSrc) x.oSrc=x.src; x.src=a[i+2];}
}
</script>
</head>

<body onLoad="MM_preloadImages('images/product_detail_join-1.jpg','images/product_detail_login-1.jpg','images/product_detail_menu01-1.jpg','images/product_detail_menu02-1.jpg','images/product_detail_menu03-1.jpg','images/product_detail_menu04-1.jpg')">
<table width="100%" height="100%" border="0" cellspacing="0" cellpadding="0">
  <? include("top.php"); ?>  
  
  <tr>
    <td>&nbsp;</td>
    <td valign="top"><table width="995" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td width="39">&nbsp;</td>
        <td width="224" align="left" valign="top"><table width="224" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td><img src="images/memberl_title.jpg" width="224" height="59"></td>
          </tr>
          <tr>
            <td align="left" valign="top"><table width="224" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="left" valign="top"><table width="224" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td background="images/product_detail_leftbg01.jpg" height="33">　<img src="images/product_detail_icon01.jpg" width="6" height="6"> <span class="white12"><a href="member.php">使用說明</a></span></td>
                  </tr>
                </table></td>
              </tr>
              <tr>
                <td align="left" valign="top"><table width="224" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td background="images/product_detail_leftbg01.jpg" height="33">　<img src="images/product_detail_icon01.jpg" width="6" height="6"> <span class="white12"><a href="member_pas.php">修改密碼</a></span></td>
                  </tr>
                  <tr>
                    <td background="images/product_detail_leftbg01.jpg" height="33">　<img src="images/product_detail_icon01.jpg" width="6" height="6"> <span class="white12"><a href="member_inquiry.php">基本資料查詢</a></span></td>
                  </tr>
                  <tr>
                    <td background="images/product_detail_leftbg01.jpg" height="33">　<img src="images/product_detail_icon01.jpg" width="6" height="6"> <span class="white12"><a href="#">訂單查詢</a><a href="#"></a></span></td>
                  </tr>
                  <tr>
                    <td height="32" background="images/product_detail_leftbg02.jpg" class="white12">　　<img src="images/product_detail_icon02.jpg" width="9" height="3"> <a href="member_order.php">進行中團購</a></td>
                  </tr>
                  <tr>
                    <td height="2" align="left" valign="top" background="images/product_detail_leftbg03.jpg"></td>
                  </tr>
                  <tr>
                    <td height="32" background="images/product_detail_leftbg02.jpg" class="white12">　　<img src="images/product_detail_icon02.jpg" width="9" height="3"> <a href="member_order02.php">已結束團購</a></td>
                  </tr>
                  <tr>
                    <td height="1"  bgcolor="#FFFFFF"></td>
                  </tr>
                </table></td>
              </tr>
              <tr>
                <td align="left" valign="top"><table width="224" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td background="images/product_detail_leftbg01.jpg" height="33">　<img src="images/product_detail_icon01.jpg" width="6" height="6"> <span class="white12"><a href="member_msg.php">會員留言版</a></span></td>
                  </tr>
                </table></td>
              </tr>
              <tr>
                <td align="left" valign="top">&nbsp;</td>
              </tr>
            </table></td>
          </tr>
          <tr>
            <td>&nbsp;</td>
          </tr>
        </table></td>
        <td width="16">&nbsp;</td>
        <td width="677" align="left" valign="top"><table width="677" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td height="24" valign="middle" class="arrowtext12"><span class="airal12"><a href="member.php">首頁 / 會員專區 </a>/ <a href="member_order.php">訂單查詢 / 進行中團購</a></span></td>
          </tr>
          <tr>
            <td align="left" valign="top">&nbsp;</td>
          </tr>
          <tr>
            <td align="left" valign="top"><table width="655" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td height="30" colspan="10" align="center" bgcolor="#999999" class="white12">進行中團購</td>
                </tr>
              <tr>
                <td height="30" align="center" bgcolor="#333333" class="white12">訂購時間</td>
                <td align="center" bgcolor="#333333" class="white12">團購品名</td>
                <td width="66" align="center" bgcolor="#333333" class="white12">訂單狀態</td>
                <td width="57" align="center" bgcolor="#333333" class="white12">階段金額</td>
                <td width="63" align="center" bgcolor="#333333" class="white12">團購數量</td>
                <td align="center" bgcolor="#333333" class="white12">運費</td>
                <td align="center" bgcolor="#333333" class="white12">訂單金額</td>
                <td align="center" bgcolor="#333333" class="white12">檢視團購</td>
                <td align="center" bgcolor="#333333" class="white12">立即取貨</td>
                <td align="center" bgcolor="#333333" class="white12">取消訂單</td>
                </tr>
                <?php
$rows = $db->fetch_all_array($sql);
foreach($rows as $row)
{
?>
              <tr>
                <td width="74" height="32" align="center" valign="middle" nowrap class="black11_airl"><?php echo $row["createtime"]?></td>
                <td width="113" align="center" valign="middle" class="black11_airl"><span class="airal12"><?php echo $row["pid_title2"]?></span></td>
                <td align="center" valign="middle" class="text12"><?php echo $aryYN3[$row["isshow"]];?></td>
                <td align="center" valign="middle" class="text12_airl"><?php echo ceo_range($row["pid"],$row["pid_total"])*$row["amount"]?></td>
                <td align="center" valign="middle" nowrap class="text12"><?php echo $row["amount"]?><?=$row["scontent2"]?></td>
                <?php if($row["isshow"]!=2){$sum =  ceo_range($row["pid"],$row["pid_total"])*$row["amount"];}else{$sum =  ceo_range_top($row["pid"],$row["pid_total"])*$row["amount"];}?>
                <td width="51" align="center" valign="middle" class="airal12">
                <?php if($sum>5000){echo "滿額<br>免運";}else{echo $shipping;}?>
                </td>
                <? if($row["isshow"]==3){$sum = $row["bonus3"];} ?>
                <td width="53" align="center" valign="middle" class="airal12"><? echo $sum+$row["bonus"]?><br></td>
                <td width="51" align="center" valign="middle"><a href="product_detail.php?id=<?php echo $row["pid"]?>" target="_blank" class="greentext14">檢視</a></td>
                <td width="64" align="center" valign="middle"><?php if($row["isshow"]==2){echo "<span  class=\"greentext14\">已選擇</a>";}elseif($row["isshow"]!=3 && $row["isshow"]!=4){?><a href="order_save.php?id=<?php echo $row["id"]?>&isshow=2&uid=<?php echo $row["uid"]?>" class="greentext14">立即取貨</a><? } ?></td>
                <td width="63" align="center" valign="middle"><a href="order_save.php?id=<?php echo $row["id"]?>&isshow=4&amount=<?php echo $row["amount"]?>&pid=<?php echo $row["pid"]?>&uid=<?php echo $row["uid"]?>" class="greentext14"><? if($row["isshow"]!=2 and $row["isshow"]!=3 and $row["isshow"]!=4){?>取消<? } ?></a></td>
                </tr>
<?php
}
$db->close();
?>                
              <tr>
                <td height="1" colspan="10" align="center" valign="middle" bgcolor="#999999"></td>
              </tr>
              
            </table></td>
          </tr>
          <tr>
            <!--<td align="center"><span class="black11_airl">1     2    3   4   5   6   7   8   9   10 <span class="gary_airl11"> <a href="#"> 下一頁</a></span></span></td>-->
             <td align="center"><span class="black11_airl"><?=showpage3()?></span></td>
          </tr>
          </table></td>
        <td width="35">&nbsp;</td>
      </tr>
    </table></td>
    <td>&nbsp;</td>
  </tr>
  <tr>
    <td bgcolor="#DEDEDE">&nbsp;</td>
    <td height="55" bgcolor="#dedede"><table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td height="3" colspan="3" class="text12"></td>
      </tr>
      <tr>
        <td width="3%" class="text12">&nbsp;</td>
        <td width="82%" class="text12"><span class="black11_airl">TEL / </span><span class="gary_airl11"> 04-8894369 　&nbsp;&nbsp; </span><span class="black11_airl"> MP / </span><span class="gary_airl11">0923-280357&nbsp;</span><span class="black11_airl"> 　ADD /</span> <span class="gary_airl11">彰化縣埤頭鄉中和村廟前路61號&nbsp;　 </span><span class="black11_airl"> EMAIL /</span> <span class="gary_airl11">hsuyung2001@yahoo.com.tw </span></td>
        <td width="15%" rowspan="2" class="text12"><a href="http://www.sale1688.com/" target="_blank"><img border="0" src="images/product_detail_79.jpg" width="112" height="18"></a></td>
      </tr>
      <tr>
        <td valign="top" class="gary_airl11">&nbsp;</td>
        <td valign="top" class="gary_airl11">COPYRIGHT 一企實業有限公司  2014 © All RIGHTS RESERVED </td>
      </tr>
    </table></td>
    <td bgcolor="#DEDEDE">&nbsp;</td>
  </tr>
</table>
</body>
</html>
