<?php
include("_config.php");
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Untitled Document</title>
<!--<link href="admin_style.css" rel="stylesheet" type="text/css" />-->
<link href="../css/admin_style_gray.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="../../scripts/jquery-1.6.1rc1.min.js"></script>
<script type="text/javascript">
$(document).ready(function(){
	
	$(".accordion .tableheader:first").addClass("active");
	$(".accordion .tableheader").toggle(function(){
		$(this).next().slideDown("fast");
	},function(){
	   $(this).next().slideUp("fast");
	   $(this).siblings("tableheader").removeClass("active");

	});
 
});
$(document).ready(function(){
 
	$(".btn-slide").click(function(){
		$("#panel").slideToggle("slow");
		$(this).toggleClass("active"); return false;
	});
	
	 
});

</script>
<script src="../../scripts/public.js?" type="text/javascript"></script>
<script type="text/javascript">
$(function(){
$("form").submit(function(){
var re=true;
err_msg='';
//if(re){re=isselect("class","案件類別");}
if(re){re=isnull("gift","贈品",0,1,30);}
if(re){re=isnull("name","姓名",0,1,30);}
if(re){re=isnull("sex","性別",0,1,30);}
if(re){re=isnull("tel","聯絡電話",0,1,30);}
if(re){re=isnull("cel","行動電話",0,1,30);}
if(re){re=isnull("mail","電子郵件",0,1,30);}
if(re){re=isnull("addr","通訊地址",0,1,30);}
	if (!re){
		alert(err_msg)
		
		return false;
		
	}
 return true;
});

});
</script>
</head>

<body>
<div id="mgbody-content">

 
        <div id="adminlist">
		<h2> <img src="../images/admintitle.png" />&nbsp;&nbsp;<?php echo $mtitle?> >&nbsp;&nbsp;新增</h2>
  <div class="accordion ">
  
	<div class="tableheader">
	<div class="handlediv"></div>
	<p align="left">新增案件</p>	
	</div>
	<div class="listshow">	
	  <FORM action="save.php?<?php echo $querystr ?>" method="post" enctype="multipart/form-data" name="form" id="form">
	    <table width="871" border="0" cellpadding="0" cellspacing="3">
          <tr>
            <td valign="top"><h4 class="input-text-title">是否顯示</h4></td>
            <td><label>
              <input type="checkbox" name="isshow" id="isshow" checked value="1" />
              顯示 </label></td>
          </tr>
          <tr>
            <td valign="top"><h4 class="input-text-title">*聯絡主題</h4></td>
            <td><label>
              <input type="text" name="title" id="title" />
            </label></td>
          </tr>
          <tr>
            <td valign="top"><h4 class="input-text-title">*姓名</h4></td>
            <td><label>
              <input type="text" name="name" id="name" />
            </label></td>
          </tr>
          <tr>
            <td valign="top"><h4 class="input-text-title">*性別</h4></td>
            <td><input id="sex" name="sex" type="radio" value="1" />
              男
              <input id="sex" name="sex" type="radio" value="0" />
              女</td>
          </tr>
          <tr>
            <td valign="top"><h4 class="input-text-title">*聯絡電話</h4></td>
            <td><label>
              <input type="text" name="tel" id="tel" />
            </label></td>
          </tr>
          <tr>
            <td valign="top"><h4 class="input-text-title">*行動電話</h4></td>
            <td><label>
              <input type="text" name="cel" id="cel" />
            </label></td>
          </tr>
          <tr>
            <td valign="top"><h4 class="input-text-title">*電子信箱</h4></td>
            <td><label>
              <input type="text" name="mail" id="mail" />
            </label></td>
          </tr>
          <tr>
            <td valign="top"><h4 class="input-text-title">*通訊地址</h4></td>
            <td><label>
              <input type="text" name="addr" id="addr" />
            </label></td>
          </tr>
          <tr>
            <td valign="top">&nbsp;</td>
            <td>&nbsp;</td>
          </tr>
          <tr>
            <td valign="top"><h4 class="input-text-title">備註</h4></td>
            <td><label for="content"></label>
                <textarea name="content" id="content" cols="80" rows="20"></textarea></td>
          </tr>
          <tr>
            <td></td>
            <td height="30"><input name="savenews" type="submit" id="savenews" value=" 送 出 " />
              &nbsp;&nbsp;&nbsp;
              <input name="Input" type="reset" value=" 重 設 " /></td>
          </tr>
        </table>
	  </FORM>
</div>
</div>
</div>
</div>
</body>
</html>
