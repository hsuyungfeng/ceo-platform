<?php
include("_config.php");
include($inc_path."_getpage.php");
?>
<?
if(!isset($_SESSION["utitle"]) || !isset($_SESSION["uid"]))
 {
      echo "<script type='text/javascript'>window.open('member_login.htm','_top');</script>";
      exit;  
 }
?>
<?
$page=request_pag("page");
$querystr="page=".$page;

$table = "ceo_usercontact";
$db = new Database($HS, $ID, $PW, $DB);
$db->connect();
$sql="select $table.*
	,car.title as uid_title
from $table 
	left join ceo_user as car on car.id=$table.uid 
where 1 and aid='0' order by $table.id desc";
//echo $sql;
//echo request_cd(); 
getsql($sql,5,$querystr);
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
<script type="text/javascript" src="scripts/jquery-1.7.2.min.js"></script>
</head>

<body onLoad="MM_preloadImages('images/product_detail_join-1.jpg','images/product_detail_login-1.jpg','images/product_detail_menu01-1.jpg','images/product_detail_menu02-1.jpg','images/product_detail_menu03-1.jpg','images/product_detail_menu04-1.jpg','images/member_msg_button02-1.jpg','images/member_msg_button01-1.jpg')">
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
                  <tr>
                    <td background="images/product_detail_leftbg01.jpg" height="33">　<img src="images/product_detail_icon01.jpg" width="6" height="6"> <span class="white12"><a href="member_pas.php">修改密碼</a></span></td>
                  </tr>
                  <tr>
                    <td background="images/product_detail_leftbg01.jpg" height="33">　<img src="images/product_detail_icon01.jpg" width="6" height="6"> <span class="white12"><a href="member_inquiry.php">基本資料查詢</a></span></td>
                  </tr>
                </table></td>
              </tr>
              <tr>
                <td align="left" valign="top"><table width="224" border="0" cellspacing="0" cellpadding="0">
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
        <td width="600" align="left" valign="top"><table width="600" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td height="24" valign="middle" class="arrowtext12"><span class="airal12"><a href="member.php">首頁 / 會員專區 </a>/ <a href="member_msg.php">會員留言版</a></span></td>
            </tr>
          <tr>
            <td align="left" valign="top">&nbsp;</td>
            </tr>
          <tr>
            <td align="left" valign="top">
            <FORM action="msg_save.php" method="post" enctype="multipart/form-data" name="form" id="form">
            <input name="uid" type="hidden" id="uid" value="<?=$_SESSION["uid"]?>">
            <table width="600" border="0" cellpadding="0" cellspacing="0">
                            <?php
$rows = $db->fetch_all_array($sql);
foreach($rows as $row)
{
?>
              <tr>
                <td height="20" colspan="4" class="airal12"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td height="15"><img src="images/member_contact_tabletop.jpg" width="677" height="17"></td>
                      </tr>
                      <tr>
                        <td valign="top" background="images/member_msg_tablebg.jpg"><table width="655" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td height="8" colspan="5"></td>
                          </tr>
                          <tr>
                            <td width="22">&nbsp;</td>
                            <td align="left">&nbsp;</td>
                            <td align="left"><span class="gary12"><?php echo $row["uid_title"]?> / 發問時間 / </span><span class="black11_airl"><?php echo $row["createtime"]?></span></td>
                            <td align="right"><a href="javascript:void(0)" onClick="window.open('member_msg2.php?id=<?php echo $row["id"]?>', '', 'width=530,height=200');" target="_blank" onMouseOver="MM_swapImage('Image24','','images/member_msg_button03-1.jpg',1)" onMouseOut="MM_swapImgRestore()"><img src="images/member_msg_button03.jpg" name="Image24" width="105" height="30" id="Image24" border="0"></a></td>
                            <td width="15">&nbsp;</td>
                          </tr>
                          <tr>
                            <td height="8" colspan="5"></td>
                          </tr>
                          <tr>
                            <td>&nbsp;</td>
                            <td align="left">&nbsp;</td>
                            <td colspan="2" align="left" class="text12_hight24"><?php echo $row["uid_title"]?> / 留言內容 / </td>
                            <td>&nbsp;</td>
                          </tr>
                          <tr>
                            <td>&nbsp;</td>
                            <td width="12" align="left">&nbsp;</td>
                            <td colspan="2" align="left"  class="text12_hight24"><?php echo $row["content"]?></td>
                            <td>&nbsp;</td>
                          </tr>
                        </table></td>
                      </tr>
                      
                      <tr>
                        <td height="9" background="images/member_contact_bg.jpg">
                        <img src="images/member_msg_top02.jpg" width="677" height="17"></td>
                      </tr>
                      
                    </table></td>
                  </tr>
                  <tr>
                    <td valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <?php
		$db = new Database($HS, $ID, $PW, $DB);
		$db->connect();
$sql1="select $table.*
	,car.name as uid_title
from $table 
	left join ceo_user as car on car.id=$table.uid 
	where $table.aid = '".$row["id"]."'";
		$rows1 = $db->fetch_all_array($sql1);
		foreach($rows1 as $row1)
		{
		?>
                          <tr>
                            <td valign="top" background="images/member_msg_bg02.jpg"><table width="655" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td height="8" colspan="4"></td>
                              </tr>
                              <tr>
                                <td width="22">&nbsp;</td>
                                <td>&nbsp;</td>
                                <td align="left" class="text12_hight24"><?=$row1["uid_title"]?><? if(!$row1["uid_title"]){echo "站長";}?>答覆 / <?=$row1["createtime"]?></td>
                                <td width="15">&nbsp;</td>
                              </tr>
                              <tr>
                                <td>&nbsp;</td>
                                <td width="12">&nbsp;</td>
                                <td align="left"  class="text12_hight24"><?php echo $row1["content"]?></td>
                                <td>&nbsp;</td>
                              </tr>
                            </table></td>
                          </tr>
                          <tr>
                            <td height="14"><img src="images/member_msg_down.jpg" width="677" height="21"></td>
                          </tr>
                          <? } ?>
                          <tr>
            <!--<td align="center"><span class="black11_airl">1     2    3   4   5   6   7   8   9   10 <span class="gary_airl11"> <a href="#"> 下一頁</a></span></span></td>-->
             <td align="center"><span class="black11_airl"></span></td>
          </tr>
                        </table>
                        </td>
                      </tr>
                    </table></td>
                  </tr>
                </table></td>
              </tr>
<?php
}
$db->close();
?>               
              <tr>
                <td height="20" colspan="4" align="center" class="airal12"><?=showpage3()?></td>
              </tr>
              <tr>
                <td width="7" height="24">&nbsp;</td>
                <td width="60" align="right" nowrap="nowrap" class="text12">留言內容/</td>
                <td width="6" class="text12">&nbsp;</td>
                <td width="604" valign="top" class="text12"><textarea name="content" cols="60" rows="5" id="content"></textarea>
                  <label></label></td>
              </tr>
              <tr>
                <td height="15" colspan="4"></td>
                </tr>
              <tr>
                <td height="25" colspan="4"></td>
              </tr>
              <tr>
                <td height="24" colspan="4" align="center"><table border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="29" align="right"><a href="member_msg.php" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image19','','images/member_msg_button02-1.jpg',1)"><img border="0" src="images/member_msg_button02.jpg" width="97" height="30" id="Image19"></a></td>
                    <td width="134" align="center"><a href="#" onClick="$('#form').submit()" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image20','','images/member_msg_button01-1.jpg',1)"><img border="0" src="images/member_msg_button01.jpg" width="97" height="30" id="Image20"></a></td>
                    </tr>
                  </table></td>
                </tr>
              <tr>
                <td height="30" colspan="4" align="center">&nbsp;</td>
                </tr>
              </table>
             </FORM> 
              </td>
            </tr>
        </table></td>
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
