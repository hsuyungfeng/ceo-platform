<?php
include("_config.php");
$id=get("id");

?>
<?php
if ($id==0){
	script("資料傳輸不正確","index.php");
}
$db = new Database($HS, $ID, $PW, $DB);
$db->connect();
$sql="select * from ceo_product where id='$id'";
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
	$capacity=$row["capacity"];
	$total=$row["total"];
	$sorder=$row["sorder"];
	$scontent=$row["scontent"];
	$scontent2 = $row["scontent2"];
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
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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
<link rel="stylesheet" type="text/css" href="range.css"/>
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
<script src="scripts/jquery.timers.js" type="text/javascript"></script>
<script type="text/javascript">
var startDate = new Date();
var endDate = new Date('<? echo str_replace('-','/',$row["timeend"]); ?>');
var spantime = (endDate - startDate)/1000;
  
 $(document).ready(function () {
        $(this).everyTime('1s', function(i) {
             spantime --;
             var d = Math.floor(spantime / (24 * 3600));
             var h = Math.floor((spantime % (24*3600))/3600);
             var m = Math.floor((spantime % 3600)/(60));
             var s = Math.floor(spantime%60);
 
             if(spantime>0){
				 $("#day").text(d);
                $("#hour").text(h);
                $("#min").text(m);
                $("#sec").text(s);
             }else{ // 避免倒數變成負的
                $("#day").text(0);
				$("#hour").text(0);
                $("#min").text(0);
                $("#sec").text(0);
             }
         });
   });
</script>
<script type="text/javascript">
$(function(){
	
$("#mymenu ul li").nextAll("ul").hide();
    $("#mymenu ul li").mouseover(function()
    {
     $(this).nextAll("ul").toggle("fast");
    });
	
});

</script> 
</head>

<body onLoad="MM_preloadImages('images/product_detail_join-1.jpg','images/product_detail_login-1.jpg','images/product_detail_menu01-1.jpg','images/product_detail_menu02-1.jpg','images/product_detail_menu03-1.jpg','images/product_detail_menu04-1.jpg','images/product_detail_button-1.jpg','images/product_detail_button02-1.jpg','images/product_detail_button03-1.jpg')">
<table width="100%" height="100%" border="0" cellspacing="0" cellpadding="0">
  <? include("top.php"); ?>  
  
  <tr>
    <td>&nbsp;</td>
    <td valign="top"><table width="995" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td width="39">&nbsp;</td>
        <td width="224" align="left" valign="top"><table width="224" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td><img src="images/product_detail_title.jpg" width="224" height="59"></td>
          </tr>
          <tr>
          <td>
          <div id="mymenu">
         <?php
		$db = new Database($HS, $ID, $PW, $DB);
		$db->connect();
$sql1="select ceo_product.*
	,car.title as aid_title
from ceo_product 
	left join ceo_product1 as car on car.id=ceo_product.aid 
where 1 and ceo_product.timeend > '".date("Y-m-d H:i:s")."' and ceo_product.timestart < '".date("Y-m-d H:i:s")."' group by aid asc";
		$rows1 = $db->fetch_all_array($sql1);
		foreach($rows1 as $row1)
		{
		?>
          <UL>
          <li style="background-image: url(images/product_detail_leftbg01.jpg);">　<img src="images/product_detail_icon01.jpg" width="6" height="6"> <span class="white12"><a href="product.php?aid=<?=$row1["aid"]?>"><?php echo $row1["aid_title"] ?></a></span></li>
        <?php
		$db = new Database($HS, $ID, $PW, $DB);
		$db->connect();
		$sql2="select ceo_product.*
	,car.title as bid_title
from ceo_product 
	left join ceo_product2 as car on car.id=ceo_product.bid 
where 1 and ceo_product.aid = ".$row1["aid"]." and ceo_product.timeend > '".date("Y-m-d H:i:s")."' and ceo_product.timestart < '".date("Y-m-d H:i:s")."' group by bid asc";
		$rows2 = $db->fetch_all_array($sql2);
		foreach($rows2 as $row2)
		{
		?>
              <UL>
              <li style="background-image: url(images/product_detail_leftbg02.jpg);">　　<img src="images/product_detail_icon02.jpg" width="9" height="3"> <span class="white12"><a href="product.php?bid=<?=$row2["bid"]?>"><?php echo $row2["bid_title"] ?></a></span></li>
                  <?php
		$db = new Database($HS, $ID, $PW, $DB);
		$db->connect();
		$sql3="select ceo_product.*
	,car.title as cid_title
from ceo_product 
	left join ceo_product3 as car on car.id=ceo_product.cid 
where 1 and ceo_product.bid = ".$row2["bid"]." and ceo_product.timeend > '".date("Y-m-d H:i:s")."' and ceo_product.timestart < '".date("Y-m-d H:i:s")."' group by cid asc";
		$rows3 = $db->fetch_all_array($sql3);
		foreach($rows3 as $row3)
		{
		?>  
                  <UL>
                  <li style="background-image: url(images/product_detail_leftbg03.jpg);"><span style="margin-left:40px;" class="airal12">- <a href="product.php?cid=<?=$row3["cid"]?>"><?php echo $row3["cid_title"] ?></a></span></li>
                  </UL>
                  <?
			}
			?>
              </UL>
              <?
			}
			?>
          </UL>
          <?
			}
			?> 
          </div>
          </td>
          </tr>
          
          <tr>
            <td>&nbsp;</td>
          </tr>
        </table></td>
        <td width="16">&nbsp;</td>
        <td width="677" align="left" valign="top"><table width="677" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td height="24" valign="middle" class="arrowtext12"><span class="airal12"><a href="index.php">首頁 / </a> <a href="product.php">團購類別 </a>/ <a href="product.php"><?=$aid_title?> </a>/ <?=$bid_title?> / <?=$cid_title?> / <?=$title?></span></td>
          </tr>
          <tr>
            <td><table width="677" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td><img src="images/product_detail_midtop.jpg" width="677" height="41"></td>
              </tr>
              <tr>
                <td background="images/product_detail_midbg.jpg"><table width="677" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="40">&nbsp;</td>
                    <td width="399" align="right"><table width="547" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="120" align="left" valign="top"><table width="120" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td height="13" colspan="3"><img src="images/product_detail_picblurtop.jpg" width="120" height="13"></td>
                          </tr>
                          <tr>
                            <td width="11" align="left" valign="top"><img src="images/product_detail_picblurleft.jpg" width="11" height="101"></td>
                            <td width="101" height="101" align="left" valign="top"><img src="<?php echo $path_case.'m'.$row["pic"]?>" width="101" height="101"></td>
                            <td width="8" valign="top"><img src="images/product_detail_picblurright.jpg" width="8" height="101"></td>
                          </tr>
                          <tr>
                            <td height="8" colspan="3"><img src="images/product_detail_picblurdown.jpg" width="120" height="8"></td>
                          </tr>
                        </table></td>
                        <td width="28">&nbsp;</td>
                        <td width="399" align="left" valign="top"><table width="399" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td><span class="title_a">商品材料&nbsp;/&nbsp;</span><span class="airal12"><?php echo $title ?></span></td>
                          </tr>
                          <tr>
                            <td><img src="images/product_detail_line.jpg" width="399" height="12"></td>
                          </tr>
                          <tr>
                            <td><span class="title_a">商品名稱&nbsp;/&nbsp;</span><span class="airal12"><?php echo $title2 ?></span></td>
                          </tr>
                          <tr>
                            <td><img src="images/product_detail_line.jpg" width="399" height="12"></td>
                          </tr>
                          <tr>
                            <td><span class="title_a">商品編號&nbsp;/&nbsp;</span><span class="airal12"><?php echo $title3 ?></span></td>
                          </tr>
                          <tr>
                            <td><img src="images/product_detail_line.jpg" width="399" height="12"></td>
                          </tr>
                          <tr>
                            <td><span class="title_a">一般售價&nbsp;/&nbsp;</span><span class="airal12">$ <?php echo $price ?></span></td>
                          </tr>
                          <tr>
                            <td><img src="images/product_detail_line.jpg" width="399" height="12"></td>
                          </tr>
                          <? if(!empty($_SESSION["uid"])){?>
                          <tr>
                            <td><span class="title_a">目前價格&nbsp;/&nbsp;</span><span class="greentext14">$ <?php echo ($capacity > 0) ? round(ceo_range($row["id"],$row["total"])/$capacity,2) : "N/A";?></span></td>
                          </tr>
                          <tr>
                            <td><img src="images/product_detail_line.jpg" width="399" height="12"></td>
                          </tr>
                          <tr>
                            <td><span class="title_a">獲利率&nbsp;/&nbsp;</span><span class="greentext14"><? echo @ceo_profit($row["price"],ceo_range($row["id"],$row["total"])/$row["capacity"]);?>%</span></td>
                          </tr>
                          <tr>
                            <td ><div style="clear:both;position:relative">
                            <?php
								drawProductStrip($id,$total,$capacity);
							?>
                            </div>
                            </td>
                          </tr>
                          <tr>
                            <td><img src="images/product_detail_line.jpg" width="399" height="12"></td>
                          </tr>
                          <tr>
                            <td><span class="title_a">最小訂購量&nbsp;/&nbsp;</span><span class="airal12"><?php echo $sorder ?><?php echo $scontent2 ?></span></td>
                          </tr>
                          <tr>
                            <td><img src="images/product_detail_line.jpg" width="399" height="12"></td>
                          </tr>
                          <? } ?>
                          <tr>
                            <td><span class="title_a">尺寸&nbsp;/&nbsp;</span><span class="airal12"><?php echo $scontent ?></span></td>
                          </tr>
                          <tr>
                            <td><img src="images/product_detail_line.jpg" width="399" height="12"></td>
                          </tr>
                          <tr style="display: none;">
                            <td><img src="images/product_detail_stitle09.jpg" width="44" height="19" align="absmiddle" ><span class="airal12"><?php echo $endtime ?> </span></td>
                          </tr>
                          <tr style="display: none;">
                            <td><img src="images/product_detail_line.jpg" width="399" height="12"></td>
                          </tr>
                          <tr style="display: none;">
                            <td><img src="images/product_detail_stitle10.jpg" width="44" height="19" align="absmiddle" ><span class="airal12"><?php echo $mid_title ?></span></td>
                          </tr>
                          <tr style="display: none;">
                            <td><img src="images/product_detail_line.jpg" width="399" height="12"></td>
                          </tr>
                          <? if(!empty($_SESSION["uid"])){?>
                          <tr>
                            <td><span class="black11"><img src="images/product_detail_clock.jpg" width="18" height="22" /><span class="gary11">剩 </span></span><span class="graytext16"><strong><span id="day"></span></strong></span><span class="black11"><span class="gary11"> 天 </span></span><span class="graytext16"><span class="graytext16"><strong><span id="hour"></span></strong></span><span class="black11"><span class="gary11"> 時 </span></span><span class="graytext16"><strong><span id="min"></span></strong></span><span class="black11"><span class="gary11"> 分 </span></span><span class="graytext16"><strong><span id="sec"></span></strong></span><span class="black11"><span class="gary11"> 秒</span></span></td>
                          </tr>
                          <? } ?>
                          <tr>
                            <td height="17">&nbsp;</td>
                          </tr>
                          <? if(!empty($_SESSION["uid"])){?>
                          <tr>
                            <td><a href="product_shop.php?id=<?=$row["id"]?>" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image39','','images/product_detail_button-1.jpg',1)">
                            <? if(date("Y-m-d H:i:s")<$row["timeend"]){?>
                            <img border="0" src="images/product_detail_button.jpg" name="Image39" width="167" height="36" id="Image39">
                            <? } ?>
                            </a></td>
                          </tr>
                          <? } ?>
                        </table></td>
                      </tr>
                    </table></td>
                    <td width="90">&nbsp;</td>
                  </tr>
                  <? if(!empty($_SESSION["uid"])){?>
                  <tr>
                    <td colspan="3" align="center"><img src="images/product_detail_line02.jpg" width="661" height="33"></td>
                  </tr>
                  <tr>
                    <td>&nbsp;</td>
                    <td align="left" valign="top"><img src="images/product_detail_stitle11.jpg" width="49" height="31" align="absmiddle" ></td>
                    <td>&nbsp;</td>
                  </tr>
                  <tr>
                    <td>&nbsp;</td>
                    <td align="left" valign="top" class="text12"><table width="547" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="5">&nbsp;</td>
                        <td width="537" class="text12"><?php echo $content ?></td>
                      </tr>
                    </table></td>
                    <td>&nbsp;</td>
                  </tr>
                  <? } ?>
                </table></td>
              </tr>
              <tr>
                <td valign="top"><img src="images/product_detail_middown.jpg" width="677" height="38"></td>
              </tr>
            </table></td>
          </tr>
          <tr>
            <td align="center"><table width="261" border="0" cellspacing="0" cellpadding="0">
              <tr>
              <? if(!empty($_SESSION["uid"])){?>
                <td width="132"><a href="product_shop.php?id=<?=$row["id"]?>" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image45','','images/product_detail_button02-1.jpg',1)">
                <? if(date("Y-m-d H:i:s")<$row["timeend"]){?>
                <img border="0" src="images/product_detail_button02.jpg" name="Image45" width="132" height="52" id="Image45">
                <? } ?>
                </a></td>
              <? } ?>
                <td align="center"><a href="product.php" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image46','','images/product_detail_button03-1.jpg',1)"><img border="0" src="images/product_detail_button03.jpg" width="129" height="52" id="Image46"></a></td>
              </tr>
            </table></td>
          </tr>
          <tr>
            <td>&nbsp;</td>
          </tr>
        </table></td>
        <td width="39">&nbsp;</td>
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
