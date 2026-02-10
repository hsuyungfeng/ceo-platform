<?php
include("_config.php");
?>
<?
if(!isset($_SESSION["utitle"]) || !isset($_SESSION["uid"]))
 {
      echo "<script type='text/javascript'>window.open('member_login.php','_top');</script>";
      exit;  
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
            <td height="24" colspan="2" valign="middle" class="arrowtext12"><span class="airal12"><a href="member.php">首頁 / 會員專區 </a>/ <a href="member.php">使用說明</a></span></td>
          </tr>
          <tr>
            <td colspan="2" align="left"><img src="images/member_pic.jpg" width="677" height="437"></td>
          </tr>
          <tr>
            <td colspan="2" align="left">&nbsp;</td>
          </tr>
          <tr>
            <td width="43" align="left" valign="top" class="text12_hight24"><strong>備註</strong>：<br></td>
            <td width="634" align="left" class="text12_hight24">(1)若想要提早取貨，可至會員專區裡的「進行中團購」中點選「立即取貨」按鈕，團購結束後，即會結算訂購時之團購金額與最終團購金額之價差，若有多餘的差額，即成為「會員購物金」可折抵下次團購之金額。</td>
          </tr>
          <tr>
            <td height="8" colspan="2" align="left"></td>
            </tr>
          <tr>
            <td align="left">&nbsp;</td>
            <td align="left"><span class="text12_hight24">(2)單筆訂單滿 5,000元免運費</span></td>
          </tr>
          <tr>
            <td colspan="2" align="left">&nbsp;</td>
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
