<?php 
$manage_path="";
$inc_path="../inc/";
include('_config.php');
$db = new Database($HS, $ID, $PW, $DB);
$db->connect();
$sql="select * from ceo_user where 1 and isshow = 0 order by id desc";
$rows = $db->fetch_all_array($sql);
$sql2="select * from ceo_order where 1 and isshow = 2 order by id desc";
$rows2 = $db->fetch_all_array($sql2);
$sql3="select ceo_order.*
	,car.timeend as pid_timeend
from ceo_order 
	left join ceo_product as car on car.id=ceo_order.pid 
where 1 and ceo_order.isshow != 1 and ceo_order.isshow != 3 and ceo_order.isshow != 4 and car.timeend < '".date("Y-m-d H:i:s")."' order by ceo_order.id desc";
$rows3 = $db->fetch_all_array($sql3);

$sql4="select * from ceo_contact where 1 and content2 = '' order by id desc";
$rows4 = $db->fetch_all_array($sql4);

$sql5="select * from ceo_usercontact where 1 and aid != '0' order by id desc";
$rows5 = $db->fetch_all_array($sql5);
$kaid ='';
foreach($rows5 as $row5)
{
	$kaid .=  "and id != '".$row5["aid"]."'";
	//$sql6="select * from ceo_usecontact where 1 and id != '".$row5["aid"]."' order by id desc";
	//echo $kaid;
	//echo "<BR>";
	//$rows6 = $db->fetch_all_array($sql6);
}

$sql6="select * from ceo_usercontact where 1 ".$kaid." order by id desc";
	//echo $sql6;
	//echo "<BR>";
	$rows6 = $db->fetch_all_array($sql6);
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Untitled Document</title>
<link href="css/admin_style_gray.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="../scripts/jquery-1.6.1rc1.min.js"></script>
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

</head>

<body>
<div id="mgbody-content">
		<div id="panel">
	
	溫馨提示：請在左邊的功能列表中,用滑鼠左鍵點選您需要操作的功能<br />
	</div>
 
<p class="slide">
<a href="#" class="btn-slide">Help</a></p>
	<div id="adminlist">
		<h2> <img src="images/admintitle.png" />&nbsp;&nbsp;首頁管理</h2>	
        
	<div class="accordion ">
	<div class="tableheader">
	<div class="handlediv"></div>
	<p>&nbsp;</p>	
	</div>
	<div class="listshow">
	<P>&nbsp;&nbsp;歡迎登入網站管理系統</P>
	<P>&nbsp;&nbsp;</P>
    <P>&nbsp;&nbsp;未通過審核會員人數：<a href="user/index.php?isshow=0"><? echo count($rows); ?></a></P>
    <P>&nbsp;&nbsp;未處理立即取貨訂單：<a href="order/index.php?isshow=2"><? echo count($rows2); ?></a></P>
    <P>&nbsp;&nbsp;未處團購已結束訂單：<a href="order/index.php?isshow=0"><? echo count($rows3); ?></a></P>
    <P>&nbsp;&nbsp;未回覆詢問單：：<a href="contant/index.php"><? echo count($rows4); ?></a></P>
    <P>&nbsp;&nbsp;未處理留言：：<a href="usercontant/index.php"><? echo count($rows6); ?></a></P>
	</div>
	

</div>
	</div>
	</div>
</body>
</html>
