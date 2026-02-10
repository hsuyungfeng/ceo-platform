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
if(re){re=isnull("title","案件名稱",0,1,30);}
if(re){re=isnull("people","人數",0,1,30);}
if(re){re=isnull("pack","行李",0,1,30);}
if(re){re=isnull("money","價格",0,1,30);}
if(re){re=isnull("desc","型態",0,1,30);}
if(re){re=isnull("pic","大圖",0,1,80);}
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
		<h2> <img src="../images/admintitle.png" />&nbsp;&nbsp;<?php echo $mtitle?> >&nbsp;&nbsp;新增123</h2>
  <div class="accordion ">
  
	<div class="tableheader">
	<div class="handlediv"></div>
	<p align="left">新增案件</p>	
	</div>
	<div class="listshow">	
	  <FORM action="save.php?<?php echo $querystr ?>" method="post" enctype="multipart/form-data" name="form" id="form">	
<table width="800" border="0" cellpadding="0" cellspacing="3">
  <tr>
    <td valign="top"><h4 class="input-text-title">是否顯示</h4></td>
    <td><label>
      <input type="checkbox" name="isshow" id="isshow" checked value="1"/>
      顯示
    </label></td>
  </tr>
  
  <tr>
    <td valign="top"><h4 class="input-text-title">*案件名稱</h4></td>
    <td><label>
      <input type="text" name="title" id="title" />
    </label></td>
  </tr>
  
  <tr>
    <td valign="top"><h4 class="input-text-title">*人數</h4></td>
    <td><label>
      <input type="text" name="people" id="people" />
    </label></td>
  </tr>
  
  <tr>
    <td valign="top"><h4 class="input-text-title">*行李</h4></td>
    <td><label>
      <input type="text" name="pack" id="pack" />
    </label></td>
  </tr>
  
  <tr>
    <td valign="top"><h4 class="input-text-title">*價格</h4></td>
    <td><label>
      <input type="text" name="money" id="money" />
    </label></td>
  </tr>
  
  <tr>
    <td valign="top"><h4 class="input-text-title">*型態</h4></td>
    <td><label>
      <input type="text" name="desc" id="desc" />
    </label></td>
  </tr>

    <tr>
    <td width="122" valign="top"><h4 class="input-text-title">*圖片</h4></td>
    <td width="669"><p>
      <input type="file" name="pic" id="pic" />
      </td>
    </tr>
    <tr>
    <td valign="top"><h4 class="input-text-title">內文</h4></td>
    <td>
      <label for="content"></label>
      <textarea name="content" id="content" cols="80" rows="20"></textarea></td>
  </tr>
    <tr>
    <td></td>
   <td height="30"><input name="savenews" type="submit" id="savenews" value=" 送 出 " />
	&nbsp;&nbsp;&nbsp;<input name="" type="reset" value=" 重 設 " /></td>
  </tr>
</table>
</FORM>
</div>
</div>
</div>
</div>
</body>
</html>
