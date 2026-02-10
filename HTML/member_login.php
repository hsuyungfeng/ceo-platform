<? 
include("_config.php");
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

<body onLoad="MM_preloadImages('images/product_detail_join-1.jpg','images/product_detail_login-1.jpg','images/product_detail_menu01-1.jpg','images/product_detail_menu02-1.jpg','images/product_detail_menu03-1.jpg','images/product_detail_menu04-1.jpg','images/member_join_button01-1.jpg','images/member_join_button02-1.jpg','images/member_login_forget-1.jpg','images/member_login_join-1.jpg','images/member_login_button-1.jpg')">
<table width="100%" height="100%" border="0" cellspacing="0" cellpadding="0">
  <? include("top.php"); ?>  
  
  <tr>
    <td>&nbsp;</td>
    <td valign="top"><table width="995" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td width="39">&nbsp;</td>
        <td width="921" align="left" valign="top"><img src="images/member_login.jpg" width="224" height="59"></td>
        <td width="35">&nbsp;</td>
      </tr>
      <tr>
        <td>&nbsp;</td>
        <td height="30" align="left" valign="top">&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
      <tr>
        <td>&nbsp;</td>
        <td align="center" valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td width="100%" align="left" valign="top"><table width="855" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td background="images/member_loginbg.jpg" width="84" height="278" valign="top"><table width="855" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="74">&nbsp;</td>
                    <td width="496">
                    <FORM action="checklogin.php" method="post" enctype="multipart/form-data" name="form" id="form">
                    <table width="336" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td height="63" nowrap="nowrap" class="text12">&nbsp;</td>
                        <td align="left" class="text12">&nbsp;</td>
                        <td width="19" height="63" rowspan="4" align="center" valign="bottom" class="text12">&nbsp;</td>
                        <td class="text12">&nbsp;</td>
                      </tr>
                      <tr>
                        <td width="48" height="24" align="center" valign="top" nowrap="nowrap" class="text12">帳號 / </td>
                        <td width="185" align="left" valign="top" class="text12"><p>
                          <input name="account" type="text" class="text12" id="account" size="30" />
                        </p></td>
                        <td width="84" rowspan="3" class="text12"><a href="#" onClick="$('#form').submit()" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image17','','images/member_login_button-1.jpg',1)"><img border="0" src="images/member_login_button.jpg" width="65" height="59" id="Image17"></a></td>
                      </tr>
                      <tr>
                        <td height="8" colspan="2" align="center"></td>
                      </tr>
                      <tr>
                        <td height="24" align="center" valign="top" nowrap="nowrap"><span class="text12">密碼 /</span></td>
                        <td align="left" valign="top" class="text12"><input name="password" type="password" class="text12" id="password" size="30" /></td>
                      </tr>
                      <tr>
                        <td height="27" colspan="4" align="right"><img src="images/member_login_line.png" width="326" height="22" /></td>
                      </tr>
                      <tr>
                        <td height="24" colspan="4" align="center"><table border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td width="29" align="right">&nbsp;</td>
                            <td width="134" align="left"><a href="member_forget.php" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image15','','images/member_login_forget-1.jpg',1)"><img border="0" src="images/member_login_forget.jpg" width="128" height="45" id="Image15"></a></td>
                            <td width="170" align="left"><a href="member_join.php" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image16','','images/member_login_join-1.jpg',1)"><img border="0" src="images/member_login_join.jpg" width="128" height="45" id="Image16"></a></td>
                          </tr>
                        </table></td>
                      </tr>
                    </table>
                    </FORM>
                    </td>
                    <td width="285">&nbsp;</td>
                  </tr>
                </table></td>
              </tr>
            </table></td>
          </tr>
        </table></td>
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
