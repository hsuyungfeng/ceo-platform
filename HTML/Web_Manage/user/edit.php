<?php
include("_config.php");
$id=get("id");

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<?php
if ($id==0){
	script("資料傳輸不正確","index.php");     
}
$db = new Database($HS, $ID, $PW, $DB);
$db->connect();
$sql="select * from $table where id='$id'";
$row = $db->query_first($sql);
if($row){
	$title=$row["title"];
	$title2=$row["title2"];
	$name=$row["name"];
	$name2=$row["name2"];
	$tel=$row["tel"];
	$cel=$row["cel"];
	$mail=$row["mail"];
	$addr=$row["addr"];
	$isshow=$row["isshow"];
	$createtime=$row["createtime"];
	$pic=$row["pic"];
	$title3=$row["title3"];
	$account=$row["account"];
	$password=$row["password"];
}else{
 	script("資料不存在");
}
?>
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
<script src="../../scripts/public.js" type="text/javascript"></script>
<script type="text/javascript">
$(function(){
$("form").submit(function(){
var re=true;
err_msg='';
//if(re){re=isnull("name","姓名",0,1,30);}
if(re){re=isnull("tel","聯絡電話",0,1,30);}
if(re){re=isnull("cel","行動電話",0,1,30);}
if(re){re=isnull("mail","電子郵件",0,1,30);}
if(re){re=isnull("addr","通訊地址",0,1,30);}
//if(re){re=isnull("title3","執照證號",0,1,30);}

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
		<h2> <img src="../images/admintitle.png" />&nbsp;&nbsp;<?php echo $mtitle?> >&nbsp;&nbsp;修改</h2>
  <div class="accordion ">
  
	<div class="tableheader">
	<div class="handlediv"></div>
	<p align="left">修改案件</p>	
	</div>
	<div class="listshow">	
	  <FORM action="edit_save.php?<?php echo $querystr ?>" method="post" enctype="multipart/form-data" name="form" id="form">	
      <input type="hidden" name="cid" value="<?php echo $id?>">
<table width="871" border="0" cellpadding="0" cellspacing="3">
  <tr>
    <td valign="top"><h4 class="input-text-title">最後修改時間</h4></td>
    <td><?php echo $createtime?></td>
    <td style="width:600px;" rowspan="11">&nbsp;
    	<? //if ($pic!=""){echo '<a href="'.$filepath.$pic.'" target="_blank"><img height="80" src="'.$filepath.$pic.'"></a>';}?>    	
    </td>
    </tr>
  <tr>
    <td valign="top"><h4 class="input-text-title">是否顯示</h4></td>
    <td><input id="isshow" name="isshow" type="radio" value="1" <?php echo (1==$row["isshow"]) ? 'checked' : ''  ?> />
      審核通過
      <input name="isshow" type="radio" id="isshow" value="0" <?php echo (0==$row["isshow"]) ? 'checked' : ''  ?> />
      審核中</td>
    </tr>
	
	<tr>
            <td valign="top"><h4 class="input-text-title">*公司名稱</h4></td>
            <td><label>
              <input type="text" name="title" id="title" value="<?php echo $title ?>" />
            </label></td>
            </tr>
          <tr>
            <td valign="top"><h4 class="input-text-title">*統一編號</h4></td>
            <td><label>
              <input type="text" name="title2" id="title2" value="<?php echo $title2 ?>" readonly="value" />
            </label></td>
            </tr>
	
    <tr>
    <td valign="top"><h4 class="input-text-title">負責人</h4></td>
    <td><label>
      <input type="text" name="name" id="name" value="<?php echo $name ?>" />
    </label></td>
    </tr>
  <tr>
            <td valign="top"><h4 class="input-text-title">主要聯絡人</h4></td>
            <td><label>
              <input type="text" name="name2" id="name2" value="<?php echo $name2 ?>" />
            </label></td>
            </tr>
  
  <tr>
    <td valign="top"><h4 class="input-text-title">*聯絡電話</h4></td>
    <td><label>
      <input type="text" name="tel" id="tel" value="<?php echo $tel ?>" />
    </label></td>
    </tr>
  
  <tr>
    <td valign="top"><h4 class="input-text-title">*行動電話</h4></td>
    <td><label>
      <input type="text" name="cel" id="cel" value="<?php echo $cel ?>" />
    </label></td>
    </tr>
  
  <tr>
    <td valign="top"><h4 class="input-text-title">*電子信箱</h4></td>
    <td><label>
      <input type="text" name="mail" id="mail" value="<?php echo $mail ?>" />
    </label></td>
    </tr>
  
  <tr>
    <td valign="top"><h4 class="input-text-title">*通訊地址</h4></td>
    <td><label>
      <input type="text" name="addr" id="addr" value="<?php echo $addr ?>" />
    </label></td>
    </tr>
    
    <!--<tr>
    <td valign="top"><h4 class="input-text-title">*帳號</h4></td>
    <td><label>
      <input type="text" name="account" id="account" value="<?php echo $account ?>" />
    </label></td>
    </tr>-->
    
    <tr style="display: none;">
    <td valign="top"><h4 class="input-text-title">執照證號</h4></td>
    <td><label>
      <input type="text" name="title3" id="title3" value="<?php echo $title3 ?>" />
    </label></td>
    </tr>
    <tr>
    <td valign="top"><h4 class="input-text-title">*密碼</h4></td>
    <td><label>
      <input type="text" name="password" id="password" value="<?php echo $password ?>" />
    </label></td>
    </tr>
  
  <tr style="display: none;">
    <td width="122" valign="top"><h4 class="input-text-title">執照</h4></td>
    <td width="332"><p>
      <input type="file" name="pic" id="pic" />
    </td>
    </tr>
    
    <tr>
      <td valign="top">&nbsp;</td>
      <td colspan="2">&nbsp;</td>
    </tr>
    
    <tr>
    <td></td>
   <td height="30" colspan="2"><input name="savenews" type="submit" id="savenews" value=" 送 出 " />
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
