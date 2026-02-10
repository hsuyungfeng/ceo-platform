<? include("_config.php"); ?>
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
<script src="scripts/public.js?" type="text/javascript"></script>
<script type="text/javascript">
$(function(){
$("#form2").submit(function(){
var re=true;
err_msg='';
//if(re){re=isselect("class","案件類別");}
if(re){re=isnull("title","公司名稱",0,1,30);}
if(re){re=isnull("name","主要聯絡人",0,1,30);}
if(re){re=isnull("tel","電話",0,1,30);}
if(re){re=isnull("mail","Email",0,1,30);}
if(re){re=isnull("content","留言內容 ",0,1,9999);}
	if (!re){
		alert(err_msg)
		
		return false;
		
	}
 return true;
});

});
</script>
</head>

<body onLoad="MM_preloadImages('images/product_detail_join-1.jpg','images/product_detail_login-1.jpg','images/product_detail_menu01-1.jpg','images/product_detail_menu02-1.jpg','images/product_detail_menu03-1.jpg','images/product_detail_menu04-1.jpg','images/member_join_button01-1.jpg','images/member_join_button02-1.jpg','images/member_write_button01-1.jpg','images/member_write_button02-1.jpg')">
<table width="100%" height="100%" border="0" cellspacing="0" cellpadding="0">
  <? include("top.php"); ?>  
  
  <tr>
    <td>&nbsp;</td>
    <td valign="top"><table width="995" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td width="39">&nbsp;</td>
        <td width="921" align="left" valign="top"><img src="images/contact_title.jpg" width="224" height="59"></td>
        <td width="35">&nbsp;</td>
      </tr>
      <tr>
        <td>&nbsp;</td>
        <td align="left" valign="top">
        <FORM action="contact_save.php" method="post" enctype="multipart/form-data" name="form2" id="form2">
        <table width="857" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td width="34%" rowspan="14" align="left" valign="bottom" class="text12"><img src="images/contact_pic.jpg" width="292" height="422"></td>
            <td width="2%" rowspan="14" align="left" valign="top" class="text12">&nbsp;</td>
            <td width="64%" height="40" align="left" class="gary12">（*為必填欄位）</td>
            </tr>
          <tr>
            <td align="left" class="gary12"><span class="text12">公司名稱 / </span>
              <input name="title" type="text" class="txtbox" id="title"></td>
            </tr>
          <tr>
            <td height="20" valign="top" class="gary10_airl">..................................................................................................................................................</td>
          </tr>
          <tr>
            <td align="left"><span class="text12"><span class="gary12"><span class="greentext14">*</span></span> 主要聯絡人</span> <span class="text12">/ 
              </span><span class="gary12">
                <input name="name" type="text" class="txtbox" id="name">
                </span></td>
          </tr>
          <tr>
            <td height="20" align="left"><span class="gary10_airl">..................................................................................................................................................</span></td>
            </tr>
          <tr>
            <td align="left"><span class="gary12"><span class="greentext14">*</span></span><span class="text12"> Email / </span><span class="gary12">
              <input name="mail" type="text" class="txtbox" id="mail" size="50">
            </span></td>
            </tr>
          <tr>
            <td height="20" valign="top"><span class="gary10_airl">..................................................................................................................................................</span></td>
            </tr>
          <tr>
            <td align="left" class="gary12"><span class="greentext14">*</span><span class="text12"> 電話 /</span>
              <input name="tel" type="text" class="txtbox" id="tel"></td>
            </tr>
          <tr>
            <td height="20" valign="top"><span class="gary10_airl">..................................................................................................................................................</span></td>
            </tr>
          <tr>
            <td align="left" class="gary12"><span class="text12">手機 /</span>
              <input name="cel" type="text" class="txtbox" id="cel"></td>
            </tr>
          <tr>
            <td height="20" valign="top"><span class="gary10_airl">..................................................................................................................................................</span></td>
            </tr>
          <tr>
            <td align="left" class="gary12"><span class="greentext14">* </span><span class="text12">留言內容 / </span>
              <textarea name="content" cols="50" rows="8" class="txtbox2" id="content"></textarea></td>
            </tr>
          <tr>
            <td height="20" valign="top"><span class="gary10_airl">..................................................................................................................................................</span></td>
            </tr>
          <tr>
            <td align="left" valign="top"><table width="195" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td width="95"><a href="contact.php" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image15','','images/member_write_button01-1.jpg',1)"><img border="0" src="images/member_write_button01.jpg" name="Image15" width="95" height="31" id="Image15"></a></td>
                <td>&nbsp;</td>
                <td width="95"><a href="#" onClick="$('#form2').submit()" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image16','','images/member_write_button02-1.jpg',1)"><img border="0" src="images/member_write_button02.jpg" name="Image16" width="95" height="31" id="Image16"></a></td>
              </tr>
            </table></td>
            </tr>
          <tr>
            <td align="left">&nbsp;</td>
            <td align="left">&nbsp;</td>
            <td align="left">&nbsp;</td>
            </tr>
          <tr>
            <td colspan="3" align="left" valign="middle" class="gary10_airl">&nbsp;</td>
            </tr>
          </table>
         </FORM>
         </td>
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
        <td width="82%" class="text12"><span class="black11_airl">TEL / </span><span class="gary_airl11"> 0922-255926 　&nbsp;&nbsp; </span><span class="black11_airl"> FAX / </span><span class="gary_airl11">04-22633648&nbsp;</span><span class="black11_airl"> 　ADD /</span> <span class="gary_airl11">402台中市南區福田路77巷2號&nbsp;　 </span><span class="black11_airl"> EMAIL /</span> <span class="gary_airl11">service@betterchoice.com.tw </span></td>
        <td width="15%" rowspan="2" class="text12"><a href="http://www.sale1688.com/" target="_blank"><img border="0" src="images/product_detail_79.jpg" width="112" height="18"></a></td>
      </tr>
      <tr>
        <td valign="top" class="gary_airl11">&nbsp;</td>
        <td valign="top" class="gary_airl11">COPYRIGHT CEO商品資訊網  2014 © All RIGHTS RESERVED </td>
      </tr>
    </table></td>
    <td bgcolor="#DEDEDE">&nbsp;</td>
  </tr>
</table>
</body>
</html>
