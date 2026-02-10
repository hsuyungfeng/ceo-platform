<? 
include("_config.php");
include($inc_path."_getpage.php");

$cid=get("cid",1);
$keyword=get("keyword",1);
$page=request_pag("page");
$querystr="keyword=$keyword&page=".$page."&cid=".$cid;
$kind ="";
if(!empty($cid)){
$kind .= "and cid = ".$cid."";
}
$db = new Database($HS, $ID, $PW, $DB);
$db->connect();
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
where 1 ".$kind." and ceo_product.timeend > '".date("Y-m-d H:i:s")."' and ceo_product.timestart < '".date("Y-m-d H:i:s")."' order by ceo_product.total desc";
$sql3="select ceo_product.*
	,car.title as aid_title
	,car2.title as bid_title
	,car3.title as cid_title
	,car4.title as mid_title
from ceo_product 
	left join ceo_product1 as car on car.id=ceo_product.aid 
	left join ceo_product2 as car2 on car2.id=ceo_product.bid
	left join ceo_product3 as car3 on car3.id=ceo_product.cid
	left join ceo_firm as car4 on car4.id=ceo_product.mid 
where 1 ".$kind." and ceo_product.timeend > '".date("Y-m-d H:i:s")."' and ceo_product.timestart < '".date("Y-m-d H:i:s")."' and promo = 1 order by ceo_product.id desc";
getsql($sql,10,$querystr); 
?>
<?
$now=date("U");
$end=mktime(14,0,0,6,5,2013);
$time=$end-$now;
$time = date('H:i:s',$time);
//echo $time;
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
function MM_swapImgRestore() { //v3.0
  var i,x,a=document.MM_sr; for(i=0;a&&i<a.length&&(x=a[i])&&x.oSrc;i++) x.src=x.oSrc;
}
function MM_preloadImages() { //v3.0
  var d=document; if(d.images){ if(!d.MM_p) d.MM_p=new Array();
    var i,j=d.MM_p.length,a=MM_preloadImages.arguments; for(i=0; i<a.length; i++)
    if (a[i].indexOf("#")!=0){ d.MM_p[j]=new Image; d.MM_p[j++].src=a[i];}}
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
</head>

<body onLoad="MM_preloadImages('images/product_detail_join-1.jpg','images/product_detail_login-1.jpg','images/product_detail_menu01-1.jpg','images/product_detail_menu02-1.jpg','images/product_detail_menu03-1.jpg','images/product_detail_menu04-1.jpg','images/index_framemore-1.jpg','images/index_button01-1.png','images/index_button02-1.png','images/index_sbutton01-1.jpg','images/index_sbutton02-1.jpg')">
<table width="100%" height="100%" border="0" cellspacing="0" cellpadding="0">
<? include("top.php"); ?>  
  <tr>
    <td>&nbsp;</td>
    <td valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td width="39">&nbsp;</td>
        <td width="919" valign="top"><table width="919" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td><img src="images/index_menutop.jpg" width="919" height="16"></td>
          </tr>
          <tr>
            <td valign="middle" background="images/index_menubg.jpg"><table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td width="9%" valign="middle"><img src="images/index_text.png" width="87" height="18"></td>
                <td width="2%">&nbsp;</td>
                <td width="88%" class="white12_arial">
        <?php
		$db = new Database($HS, $ID, $PW, $DB);
		$db->connect();
		$sql2="select id, title from ceo_product1";
		$rows2 = $db->fetch_all_array($sql2);
		foreach($rows2 as $row2)
		{
		?>
        <?php
        $sql99="select * from ceo_product where 1 and aid = '".$row2["id"]."' order by ind desc";
        $rows99 = $db->fetch_all_array($sql99);
		if(count($rows99)!=0){
		?>
        
        <?php echo "<a style='color : #ffffff;text-decoration: none;' href=./product.php?aid=".$row2["id"].">".$row2["title"]."</a>         "; ?>
        
          <?php
		}
		}
		?>
                </td>
                <td width="1%">&nbsp;</td>
              </tr>
            </table></td>
          </tr>
          <tr>
            <td height="16"><img src="images/index_menudown.jpg" width="919" height="16"></td>
          </tr>
          <tr>
            <td height="16"><img src="images/index_blur.jpg" width="919" height="27"></td>
          </tr>
        </table></td>
        <td width="37">&nbsp;</td>
      </tr>
      <tr>
        <td>&nbsp;</td>
        <td><table width="919" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td width="680" align="left" valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td><table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="106"><a href="#"><img border="0" src="images/index_frame01.jpg" width="106" height="33"></a></td>
                    <td width="107"><a href="index2.php"><img border="0" src="images/index_frame02.jpg" width="107" height="33"></a></td>
                    <td width="411"><img src="images/index_frame.jpg" width="411" height="33"></td>
                    <td><a href="#" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image20','','images/index_framemore-1.jpg',1)"><!--<img border="0" src="images/index_framemore.jpg" width="56" height="33" id="Image20">--></a></td>
                  </tr>
                </table></td>
              </tr>
              <tr>
                <td height="27">&nbsp;</td>
              </tr>
<?php
$rows = $db->fetch_all_array($sql);
foreach($rows as $row)
{
$scontent2 = $row["scontent2"];
?>
<script type="text/javascript">
var startDate = new Date();
var endDate<?=$row["id"]?> = new Date('<? echo str_replace('-','/',$row["timeend"]); ?>');
var spantime<?=$row["id"]?> = (endDate<?=$row["id"]?> - startDate)/1000;
  
 $(document).ready(function () {
        $(this).everyTime('1s', function(i) {
             spantime<?=$row["id"]?> --;
             var d = Math.floor(spantime<?=$row["id"]?> / (24 * 3600));
             var h = Math.floor((spantime<?=$row["id"]?> % (24*3600))/3600);
             var m = Math.floor((spantime<?=$row["id"]?> % 3600)/(60));
             var s = Math.floor(spantime<?=$row["id"]?>%60);
 
             if(spantime<?=$row["id"]?>>0){
                $("#day<?=$row["id"]?>").text(d);
                $("#hour<?=$row["id"]?>").text(h);
                $("#min<?=$row["id"]?>").text(m);
                $("#sec<?=$row["id"]?>").text(s);
             }else{ // 避免倒數變成負的
			 $("#day<?=$row["id"]?>").text(0);
                $("#hour<?=$row["id"]?>").text(0);
                $("#min<?=$row["id"]?>").text(0);
                $("#sec<?=$row["id"]?>").text(0);
             }
         });
   });
</script>            

              <tr>
                <td valign="top"><table width="680" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td height="6" colspan="4"><img src="images/index_tabletop.jpg" width="680" height="6"></td>
                    </tr>
                  <tr>
                    <td width="9" background="images/index_tableleft.png">&nbsp;</td>
                    <td width="472"><table width="472" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="20">&nbsp;</td>
                        <td colspan="2">&nbsp;</td>
                        <td width="4">&nbsp;</td>
                      </tr>
                      <tr>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td width="305"><span class="title_a">商品材料&nbsp;/&nbsp;</span><span class="airal12"><? echo $row["title"]?></span></td>
                        <td>&nbsp;</td>
                      </tr>
                      <tr>
                        <td>&nbsp;</td>
                        <td style="position: relative;"><div id="indexpic" <? if(empty($_SESSION["uid"])){?>style="top:-40px"<? } ?>>
                          <table width="120" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td height="13" colspan="3"><img src="images/product_detail_picblurtop.png" width="120" height="13"></td>
                            </tr>
                            <tr>
                              <td width="11" align="left" valign="top"><img src="images/product_detail_picblurleft.png" width="11" height="101"></td>
                              <td width="101" height="101" align="left" valign="top"><img src="<?php echo $path_case.'m'.$row["pic"]?>" width="101" height="101"></td>
                              <td width="8" valign="top"><img src="images/product_detail_picblurright.png" width="8" height="101"></td>
                            </tr>
                            <tr>
                              <td height="8" colspan="3"><img src="images/product_detail_picblurdown.png" width="120" height="8"></td>
                            </tr>
                          </table>
                        </div></td>
                        <td><img src="images/index_line003.png" width="305" height="11"></td>
                        <td>&nbsp;</td>
                      </tr>
                      <tr>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td><span class="title_a">商品名稱&nbsp;/&nbsp;</span><span class="airal12"><? echo $row["title2"];?></span></td>
                        <td>&nbsp;</td>
                      </tr>
                      <tr>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td><img src="images/index_line003.png" width="305" height="11"></td>
                        <td>&nbsp;</td>
                      </tr>
                      <tr>
                        <td>&nbsp;</td>
                        <td width="143">&nbsp;</td>
                        <td width="305"><span class="title_a">一般售價&nbsp;/&nbsp;</span><span class="airal12"><? echo $row["price"];?></span></td>
                        <td>&nbsp;</td>
                      </tr>
                      <? if(!empty($_SESSION["uid"])){?>
                      <tr>
                        <td bgcolor="#ececec">&nbsp;</td>
                        <td bgcolor="#ececec">&nbsp;</td>
                        <td bgcolor="#ececec"><img src="images/index_line003.png" width="305" height="11"></td>
                        <td bgcolor="#ececec">&nbsp;</td>
                      </tr>
                      <tr>
                        <td bgcolor="#ececec">&nbsp;</td>
                        <td bgcolor="#ececec">&nbsp;</td>
                        <td bgcolor="#ececec"><span class="title_a">目前價格&nbsp;/&nbsp;</span><span class="greentext14">$ <? echo ($row["capacity"] > 0) ? round(ceo_range($row["id"],$row["total"])/$row["capacity"],2) : "N/A";?></span></td>
                        <td bgcolor="#ececec">&nbsp;</td>
                      </tr>
                      <tr>
                        <td bgcolor="#ececec">&nbsp;</td>
                        <td bgcolor="#ececec">&nbsp;</td>
                        <td bgcolor="#ececec"><img src="images/index_line003.png" width="305" height="11"></td>
                        <td bgcolor="#ececec">&nbsp;</td>
                      </tr>
                      <tr>
                        <td bgcolor="#ececec">&nbsp;</td>
                        <td bgcolor="#ececec">&nbsp;</td>
                        <td bgcolor="#ececec"><span class="title_a">獲利率&nbsp;/&nbsp;</span><span class="greentext14"><? echo @ceo_profit($row["price"],ceo_range($row["id"],$row["total"])/$row["capacity"]);?>%</span></td>
                        <td bgcolor="#ececec">&nbsp;</td>
                      </tr>
                      <tr>
                        <td height="8" colspan="4" bgcolor="#ececec"></td>
                        </tr>
                      <tr>
                        <td bgcolor="#ececec">&nbsp;</td>
                        <td colspan="2" align="right" bgcolor="#ececec">
                        	<?php
								drawProductStrip($row["id"],$row["total"],$row["capacity"]);	
							?></td>
                        <td bgcolor="#ececec">&nbsp;</td>
                      </tr>
                      <? } ?>
                    </table></td>
                    <td width="190" align="left" valign="top" bgcolor="#c9c9c9"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="8%">&nbsp;</td>
                        <td width="85%" height="50">&nbsp;</td>
                        <td width="7%">&nbsp;</td>
                      </tr>
                      <? if(!empty($_SESSION["uid"])){?>
                      <tr>
                        <td>&nbsp;</td>
                        <td><table width="183" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td width="28"><img src="images/index_timeleft.png" width="28" height="23"></td>
                            <td width="130" bgcolor="#FFFFFF"><span class="black11"><span class="gary11">剩 </span></span><span class="graytext16"><strong><span id="day<?=$row["id"]?>"></span></strong></span><span class="black11"><span class="gary11"> 天 </span><span class="graytext16"><strong><span id="hour<?=$row["id"]?>"></span></strong></span><span class="black11"><span class="gary11"> 時 </span></span><span class="graytext16"><strong><span id="min<?=$row["id"]?>"></span></strong></span><span class="black11"><span class="gary11"> 分 </span></span><span class="graytext16"><strong><span id="sec<?=$row["id"]?>"></span></strong></span><span class="black11"><span class="gary11"> 秒</span></span></td>
                            <td width="12"><img src="images/index_timeright.png" width="12" height="23"></td>
                          </tr>
                        </table></td>
                        <td>&nbsp;</td>
                      </tr>
                      <? } ?>
                      <tr>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                      </tr>
                      <tr>
                        <td>&nbsp;</td>
                        <td align="center"><a href="product_detail.php?id=<?=$row["id"]?>" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image40','','images/index_button01-1.png',1)"><img  border="0" src="images/index_button01.png" width="167" height="36" id="Image40"></a></td>
                        <td>&nbsp;</td>
                      </tr>
                      <tr>
                        <td height="10" colspan="3"></td>
                        </tr>
                        <? if(!empty($_SESSION["uid"])){?>
                      <tr>
                        <td>&nbsp;</td>
                        <td align="center"><a href="product_shop.php?id=<?=$row["id"]?>" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image41','','images/index_button02-1.png',1)"><img border="0" src="images/index_button02.png" width="167" height="39" id="Image41"></a></td>
                        <td>&nbsp;</td>
                      </tr>
                      <? } ?>
                      <tr>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                      </tr>
                    </table></td>
                    <td background="images/index_tableright.png" width="9">&nbsp;</td>
                  </tr>
                  <tr>
                    <td height="6" colspan="4"><img src="images/index_tabledown.jpg" width="680" height="6"></td>
                    </tr>
                </table></td>
              </tr>
              <tr>
                <td>&nbsp;</td>
              </tr>
          <?php
}
?>
<tr>
            <!--<td align="center"><span class="black11_airl">1     2    3   4   5   6   7   8   9   10 <span class="gary_airl11"> <a href="#"> 下一頁</a></span></span></td>-->
             <td align="center"><span class="black11_airl"><?=showpage3()?></span></td>
          </tr>              
              <tr>
                <td>
                
                </td>
              </tr>
             
              <tr>
                <td>
                
                </td>
              </tr>
              
              <tr>
                <td>
                
                </td>
              </tr>

            </table></td>
            <td width="18">&nbsp;</td>
            <td width="221" align="left" valign="top"><table width="221" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td height="41" valign="top"><img src="images/index_righttop.jpg" width="221" height="41"></td>
              </tr>
              <tr>
                <td align="center" background="images/index_rightbg.jpg"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="96%" height="10" align="center"></td>
                    <td width="4%"></td>
                  </tr>
<?php
$rows = $db->fetch_all_array($sql3);
foreach($rows as $row)
{
?>
<script type="text/javascript">
var startDate = new Date();
var endDate<?=$row["id"]?> =  new Date('<? echo str_replace('-','/',$row["timeend"]); ?>');
var spantime<?=$row["id"]?> = (endDate<?=$row["id"]?> - startDate)/1000;
  
 $(document).ready(function () {
        $(this).everyTime('1s', function(i) {
             spantime<?=$row["id"]?> --;
             var d = Math.floor(spantime<?=$row["id"]?> / (24 * 3600));
             var h = Math.floor((spantime<?=$row["id"]?> % (24*3600))/3600);
             var m = Math.floor((spantime<?=$row["id"]?> % 3600)/(60));
             var s = Math.floor(spantime<?=$row["id"]?>%60);
 
             if(spantime<?=$row["id"]?>>0){
                $("#sday<?=$row["id"]?>").text(d);
                $("#shour<?=$row["id"]?>").text(h);
                $("#smin<?=$row["id"]?>").text(m);
                $("#ssec<?=$row["id"]?>").text(s);
             }else{ // 避免倒數變成負的
			 $("#sday<?=$row["id"]?>").text(0);
                $("#shour<?=$row["id"]?>").text(0);
                $("#smin<?=$row["id"]?>").text(0);
                $("#ssec<?=$row["id"]?>").text(0);
             }
         });
   });
</script>

                  <tr>
                    <td align="center"><table width="194" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="221" height="8"><img src="images/index_righttop02.jpg" width="194" height="8"></td>
                      </tr>
                      <tr>
                        <td width="194" align="center" background="images/index_rightbg02.png"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td width="5%">&nbsp;</td>
                            <td width="90%"><table width="181" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td width="74" rowspan="2"><table width="74" border="0" cellspacing="0" cellpadding="0">
                                  <tr>
                                    <td height="5" colspan="3"><img src="images/index_rightblurtop.jpg" width="74" height="5"></td>
                                  </tr>
                                  <tr>
                                    <td width="7" align="left" valign="top"><img src="images/index_rightblurleft.jpg" width="7" height="63"></td>
                                    <td width="62" height="63" align="left" valign="top"><img src="<?php echo $path_case.'m'.$row["pic"]?>" width="62" height="63"></td>
                                    <td width="5" valign="top"><img src="images/index_rightblurright.jpg" width="5" height="63"></td>
                                  </tr>
                                  <tr>
                                    <td height="6" colspan="3"><img src="images/index_leftblurdown.jpg" width="74" height="6"></td>
                                  </tr>
                                </table></td>
                                <td width="5" rowspan="2"></td>
                                <td width="115" height="6" valign="top"></td>
                              </tr>
                              <tr>
                                <td valign="top"><img src="images/product_detail_stitle01.jpg" width="72" height="19" align="absmiddle" ><br>
                                  <span class="airal12"><? echo $row["title"];?></span></td>
                              </tr>
                              <tr>
                                <td height="3" ></td>
                              </tr>
                              <tr>
                                <td colspan="3"><img src="images/index_righttitle01.jpg" width="63" height="17" align="absmiddle" ><span class="airal12"><? echo $row["title2"];?></span></td>
                              </tr>
                              <tr>
                                <td colspan="3"><img src="images/index_rightline.jpg" width="181" height="7"></td>
                              </tr>
                              <tr>
                                <td colspan="3"><img src="images/index_righttitle02.jpg" width="63" height="18" align="absmiddle" ><span class="airal12"><? echo $row["price"];?></span></td>
                              </tr>
                              <tr>
                                <td height="5" colspan="3"></td>
                              </tr>
                              <? if(!empty($_SESSION["uid"])){?>
                              <tr>
                                <td colspan="3" bgcolor="#848484"><img src="images/index_righttitle03.jpg" width="69" height="20" align="absmiddle"><span class="white12_arial">$ <? echo ceo_range($row["id"],$row["total"])/$row["capacity"];?></span></td>
                              </tr>
                              <tr>
                                <td colspan="3" bgcolor="#848484"><img src="images/index_righttitle04.jpg" width="55" height="16"><span class="textgreen02"><? echo @ceo_profit($row["price"],ceo_range($row["id"],$row["total"])/$row["capacity"]);?>%</span></td>
                              </tr>
                              <tr>
                                <td height="8" colspan="3"></td>
                              </tr>
                              <tr>
                                <td colspan="3" align="left"><span class="black11"><img src="images/index_clock.jpg" width="26" height="24" /><span class="gary11">剩 </span></span><span class="orgtext16"><strong><span id="sday<?=$row["id"]?>"></span></strong></span><span class="black11"><span class="gary11"> 天 </span></span><span class="orgtext16"><strong><span id="shour<?=$row["id"]?>"></span></strong></span><span class="black11"><span class="gary11"> 時 </span></span><span class="orgtext16"><strong><span id="smin<?=$row["id"]?>"></span></strong></span><span class="black11"><span class="gary11"> 分</span></span> <span class="orgtext16"><strong><span id="ssec<?=$row["id"]?>"></span></strong></span><span class="black11"><span class="gary11"> 秒</span></span></td>
                              </tr>
                              <? } ?>
                              <tr>
                                <td height="5" colspan="3"></td>
                              </tr>
                              <tr>
                                <td colspan="3" align="center"><table width="185" border="0" cellspacing="0" cellpadding="0">
                                  <tr>
                                    <td width="90" align="center"><a href="product_detail.php?id=<?=$row["id"]?>" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image57','','images/index_sbutton01-1.jpg',1)"> <img src="images/index_sbutton01.jpg" name="Image57" width="92" height="33" id="Image57" border="0"></a></td>
                                    <? if(!empty($_SESSION["uid"])){?>
                                    <td><a href="product_shop.php?id=<?=$row["id"]?>" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image57','','images/index_sbutton02-1.jpg',1)"><img src="images/index_sbutton02.jpg" name="Image4" width="95" height="33" id="Image4" border="0"></a></td>
                                    <? } ?>
                                  </tr>
                                </table></td>
                              </tr>
                            </table></td>
                            <td width="5%">&nbsp;</td>
                          </tr>
                        </table></td>
                      </tr>
                      <tr>
                        <td height="9"><img src="images/index_rightdown02.jpg" width="194" height="9"></td>
                      </tr>
                    </table></td>
                    <td>&nbsp;</td>
                  </tr>
                  <tr>
                    <td align="center">&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
<?php 
}
$db->close();
?>
                </table></td>
              </tr>
              <tr>
                <td height="15" valign="top"><img src="images/index_rightdown.jpg" width="221" height="15"></td>
              </tr>
            </table></td>
          </tr>
        </table></td>
        <td>&nbsp;</td>
      </tr>
      <tr>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
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
