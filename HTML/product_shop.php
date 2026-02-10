<?php
include("_config.php");
$id=get("id");
?>
<?
if(!isset($_SESSION["utitle"]) || !isset($_SESSION["uid"]))
 {
      echo "<script type='text/javascript'>window.open('member_login.php','_top');</script>";
      exit;  
 }
?>
<?php
if ($id==0){
	script("資料傳輸不正確","index.php");
}
$db = new Database($HS, $ID, $PW, $DB);
$db->connect();
$sql="select * from ceo_user where id='".$_SESSION["uid"]."'";
$row = $db->query_first($sql);
$uid_bonus = $row["bonus"];
$sql="select ceo_product.*
	,car.title as aid_title
	,car2.title as bid_title
	,car3.title as cid_title
	,car4.title as mid_title
from ceo_product 
	left join ceo_product1 as car on car.id=ceo_product.aid 
	left join ceo_product2 as car2 on car2.id=ceo_product.bid
	left join ceo_product3 as car3 on car3.id=ceo_product.cid
	left join ceo_firm as car4 on car4.id=ceo_product.mid
where 1 and ceo_product.id='$id'";
$row = $db->query_first($sql);
if($row){
	$aid=$row["aid"];
	$aid_title=$row["aid_title"];
	$bid=$row["bid"];
	$bid_title=$row["bid_title"];
	$cid=$row["cid"];
	$cid_title=$row["cid_title"];
	$pic=$row["pic"];
	$title=$row["title"];
	$title2=$row["title2"];
	$title3=$row["title3"];
	$price=$row["price"];
	$sorder=$row["sorder"];
	$scontent=$row["scontent"];
	$scontent2=$row["scontent2"];
	$endtime=$row["endtime"];
	
	$mid=$row["mid"];
	$mid_title=$row["mid_title"];
	$timestart=$row["timestart"];
	$timeend=$row["timeend"];
	
	$content=$row["content"];
	$createtime=$row["createtime"];
}else{
 	script("資料不存在");
}
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
<script>
$(document).ready(function(){ 
  $("#amount").change(function(){
    //alert( $("#amount").val() );
	$("#total").html($("#amount").val()*<? echo ceo_range($row["id"],$row["total"])?>);
	var total = $("#amount").val()*<? echo ceo_range($row["id"],$row["total"])?>;
	//alert(total);
	if(total<5000)
	{
	$("#sum").html($("#amount").val()*<? echo ceo_range($row["id"],$row["total"])?>);
	}
	else
	{
	$("#shipping").html('0');
	$("#sum").html($("#amount").val()*<? echo ceo_range($row["id"],$row["total"])?>);
	}
  });
});
</script>
</head>

<body onLoad="MM_preloadImages('images/product_detail_join-1.jpg','images/product_detail_login-1.jpg','images/product_detail_menu01-1.jpg','images/product_detail_menu02-1.jpg','images/product_detail_menu03-1.jpg','images/product_detail_menu04-1.jpg','images/contact_sure-1.png','images/contact_back-1.png')">
<table width="100%" height="100%" border="0" cellspacing="0" cellpadding="0">
  <? include("top.php"); ?> 
  <tr>
    <td>&nbsp;</td>
    <td valign="top"><table width="995" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td width="39">&nbsp;</td>
        <td width="921" align="left" valign="top"><img src="images/product_detail_title.jpg" width="224" height="59"></td>
        <td width="35">&nbsp;</td>
      </tr>
      <tr>
        <td>&nbsp;</td>
        <td height="30" align="left" valign="top">
        <FORM action="shop_save.php" method="post" enctype="multipart/form-data" name="form" id="form">
        <input name="pid" type="hidden" id="pid" value="<?=$id?>">
        <input name="uid" type="hidden" id="uid" value="<?=$_SESSION["uid"]?>">
        <input name="mid" type="hidden" id="mid" value="<?=$mid?>">
<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
            <td width="100%" height="24" valign="middle" class="arrowtext12"><span class="airal12"><a href="index.php">首頁 / </a> <a href="product.php">團購類別 </a>/ 確認訂單</span></td>
          </tr>
          <tr>
            <td valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td width="100%">&nbsp;</td>
              </tr>
              <tr>
                <td height="172" valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td height="30" colspan="4" align="center" bgcolor="#999999" class="white12">確認訂單</td>
                  </tr>
                  <tr>
                    <td width="26%" height="30" align="center" bgcolor="#333333" class="white12">團購藥名</td>
                    <td width="24%" align="center" bgcolor="#333333" class="white12">階段金額</td>
                    <td width="31%" align="center" bgcolor="#333333" class="white12">團購數量</td>
                    <td width="19%" align="center" bgcolor="#333333" class="white12">小計</td>
                  </tr>
                  <tr>
                    <td height="40" align="center" valign="middle" class="black11_airl"><span class="airal12"><?=$title2?></span></td>
                    <td align="center" valign="middle" class="text12_airl"><?php echo ceo_range($row["id"],$row["total"])?></td>
                    <td align="center" valign="middle" nowrap class="text12"><label for="select3"></label>
                      <select name="amount" id="amount">
                      <? for($i=$sorder;$i<=15;$i++){?>
                        <option value="<?=$i?>"><?=$i?><?=$scontent2?></option>
                      <? } ?>  
                      </select></td>
                    <td align="center" valign="middle" class="text12_airl"><span id="total"><? echo ceo_range($row["id"],$row["total"])*$sorder ?></span></td>
                  </tr>
                  <tr>
                    <td height="1" colspan="4" align="center" valign="top" bgcolor="#999999" class="black11_airl"></td>
                  </tr>
                  <tr>
                    <td height="32" colspan="4" align="center" valign="top" class="black11_airl"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <!--
                      <tr>
                        <td width="694" height="40" align="right" class="text12">&nbsp;</td>
                        <td width="128" align="right" class="text12_airl">運費：</td>
                        <td width="99" align="left" class="text12_airl">+ <span id="shipping"><?=$shipping?></span></td>
                      </tr>
                      -->
                      <tr>
                        <td height="2" colspan="3" align="right" bgcolor="#999999" class="text12"></td>
                      </tr>
                      </table></td>
                    </tr>
                  <tr>
                    <td height="32" align="center" valign="top" class="black11_airl">&nbsp;</td>
                    <td height="32" align="center" valign="top" class="black11_airl">&nbsp;</td>
                    <td height="32" align="center" valign="middle" class="black11_airl"><!--<strong class="greentext14"><span class="text12_airl">購物金：</span><span><? echo $uid_bonus ?></span></strong>--></td>
                    <td height="32" align="center" valign="middle" class="black11_airl"><strong class="greentext14"><span class="text12_airl">NT</span><span id="sum">$<? echo ceo_range($row["id"],$row["total"])*$sorder ?></span></strong></td>
                  </tr>
                  <tr>
                    <td height="1" colspan="4" align="center" valign="middle"></td>
                  </tr>
                </table></td>
              </tr>
            </table></td>
          </tr>
          <tr>
            <td align="center" valign="top">&nbsp;</td>
          </tr>
          <tr>
            <td align="center"><table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td width="29" align="right"><a href="javascript:history.go(-1);" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image14','','images/contact_back-1.png',1)"><img border="0" src="images/contact_back.png" width="110" height="41" id="Image14"></a></td>
                <td width="134" align="center"><a href="#" onClick="$('#form').submit()" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image15','','images/contact_sure-1.png',1)"><img border="0" src="images/contact_sure.png" width="109" height="41" id="Image15"></a></td>
              </tr>
            </table></td>
          </tr>
      </table>
        </FORM>
        </td>
        <td>&nbsp;</td>
      </tr>
      <tr>
        <td>&nbsp;</td>
        <td align="center" valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td width="100%" align="left" valign="top">&nbsp;</td>
          </tr>
        </table></td>
        <td>&nbsp;</td>
      </tr>
    </table>
      <br></td>
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
