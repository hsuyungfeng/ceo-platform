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
	$name=$row["name"];
	$tel=$row["tel"];
	$cel=$row["cel"];
	$mail=$row["mail"];
	$content=$row["content"];
	$content2=$row["content2"];
	$isshow=$row["isshow"];
	$createtime=$row["createtime"];
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
//if(re){re=isnull("gift","贈品",0,1,30);}
//if(re){re=isnull("name","姓名",0,1,30);}
//if(re){re=isnull("sex","性別",0,1,30);}
//if(re){re=isnull("tel","聯絡電話",0,1,30);}
//if(re){re=isnull("cel","行動電話",0,1,30);}
//if(re){re=isnull("mail","電子郵件",0,1,30);}
//if(re){re=isnull("addr","通訊地址",0,1,30);}

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
  <!--<tr>
    <td valign="top"><h4 class="input-text-title">最後修改時間</h4></td>
    <td><?php echo $createtime?></td>
    </tr>-->
  <!--<tr>
    <td valign="top"><h4 class="input-text-title">是否顯示</h4></td>
    <td><label>
      <input type="checkbox" name="isshow" id="isshow" <?php echo ($isshow==1) ? "checked" : "" ?> value="1" />
      顯示
    </label></td>
    </tr>-->
	
	<tr>
    <td valign="top"><h4 class="input-text-title">診所或藥局名稱</h4></td>
    <td>
    <?=$title?>    <input type="hidden" name="title" id="title" value="<?php echo $title ?>" /></td>
  </tr>
	
    <tr>
    <td valign="top"><h4 class="input-text-title">主要聯絡人</h4></td>
    <td><?php echo $name ?><input type="hidden" name="name" id="name" value="<?php echo $name ?>" /></td>
  </tr>
  
  <tr>
    <td valign="top"><h4 class="input-text-title">*聯絡電話</h4></td>
    <td><?php echo $tel ?><input type="hidden" name="tel" id="tel" value="<?php echo $tel ?>" /></td>
  </tr>
  
  <tr>
    <td valign="top"><h4 class="input-text-title">*行動電話</h4></td>
    <td><?php echo $cel ?><input type="hidden" name="cel" id="cel" value="<?php echo $cel ?>" /></td>
  </tr>
  
  <tr>
    <td valign="top"><h4 class="input-text-title">*電子信箱</h4></td>
    <td><?php echo $mail ?><input type="hidden" name="mail" id="mail" value="<?php echo $mail ?>" /></td>
  </tr>
  
    <tr>
      <td valign="top">&nbsp;</td>
      <td>&nbsp;</td>
    </tr>
    <tr>
    <td valign="top"><h4 class="input-text-title">留言內容</h4></td>
    <td><?php echo removebr($content) ?><input name="content" type="hidden" id="content" value="<?php echo removebr($content) ?>" /></td>
  </tr>
  
  <tr>
    <td valign="top"><h4 class="input-text-title">回覆內容</h4></td>
    <td><label for="content"></label>
      <textarea name="content2" id="content2" cols="80" rows="10"><?php echo removebr($content2) ?></textarea></td>
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
