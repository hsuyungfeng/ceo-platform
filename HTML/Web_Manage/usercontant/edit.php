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
$sql="select $table.*
	,car.title as uid_title
from $table 
	left join ceo_user as car on car.id=$table.uid 
	where $table.id = '$id'";
$row = $db->query_first($sql);
if($row){
	$uid_title=$row["uid_title"];
	$content=$row["content"];
	$content2=$row["content2"];
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
    <td valign="top"><h4 class="input-text-title">留言時間</h4></td>
    <td><?php echo $createtime?>
      <input name="aid" type="hidden" id="aid" value="<?=$id?>" /></td>
    </tr>
	
    <tr>
      <td valign="top"><h4 class="input-text-title">*姓名</h4></td>
      <td><?php echo $uid_title ?></td>
    </tr>
  
    <tr>
      <td valign="top"><h4 class="input-text-title">留言內容</h4></td>
      <td><?php echo $content ?></td>
    </tr>
    <?php
		$db = new Database($HS, $ID, $PW, $DB);
		$db->connect();
$sql1="select $table.*
	,car.name as uid_title
from $table 
	left join ceo_user as car on car.id=$table.uid 
	where $table.aid = '$id'";
		$rows1 = $db->fetch_all_array($sql1);
		foreach($rows1 as $row1)
		{
		?>
    <tr>
      <td valign="top"><h4 class="input-text-title"><?=$row1["uid_title"]?><? if(!$row1["uid_title"]){echo "站長";}?></h4></td>
      <td>留言內容：<?=$row1["content"]?><BR />留言時間：<?=$row1["createtime"]?></td>
    </tr>
  		<?
		}
		?> 
    <tr>
    <td valign="top"><h4 class="input-text-title">回覆</h4></td>
    <td><label for="content"></label>
      <textarea name="content2" id="content2" cols="80" rows="20"></textarea></td>
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
