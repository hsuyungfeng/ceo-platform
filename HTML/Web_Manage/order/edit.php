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
//$sql="select * from $table where id='$id'";

$sql="select $table.*
	,car.title2 as pid_title
	,car.price as pid_price
	,car.timeend as pid_timeend
	,car.total as pid_total
	,car2.title as uid_title
from $table 
	left join ceo_product as car on car.id=$table.pid 
	left join ceo_user as car2 on car2.id=$table.uid 
where $table.id='$id'";

$row = $db->query_first($sql);
if($row){
	$pid=$row["pid"];
	$uid=$row["uid"];
	$amount=$row["amount"];
	$bonus=$row["bonus"];
	$content=$row["content"];
	$isshow=$row["isshow"];
	
	$pid_title=$row["pid_title"];
	$pid_price=$row["pid_price"];
	$pid_timeend=$row["pid_timeend"];
	$uid_title=$row["uid_title"];
	
}else{
 	script("資料不存在");
}
?>
<title>Untitled Document</title>
<!--<link href="admin_style.css" rel="stylesheet" type="text/css" />-->
<link href="../css/admin_style_gray.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="../../scripts/selectdate.js"></script>
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
//if(re){re=isnull("date_start","取車日期",0,1,30);}

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
            <td width="112" valign="top"><h4 class="input-text-title">訂單狀態</h4></td>
            <td>
            <input <? if($row["isshow"]==3 or $row["isshow"]==4){?>disabled<? } ?> id="isshow" name="isshow" type="radio" value="-1" <?php echo (0==$row["isshow"] && $pid_timeend > date("Y-m-d H:i:s")) ? 'checked' : ''  ?> />
     		 進行中
            <input <? if($row["isshow"]==3 or $row["isshow"]==4){?>disabled<? } ?> id="isshow" name="isshow" type="radio" value="0" <?php echo (0==$row["isshow"] && $pid_timeend < date("Y-m-d H:i:s")) ? 'checked' : ''  ?> />
     		 處理中
     		 <input <? if($row["isshow"]==3 or $row["isshow"]==4){?>disabled<? } ?> name="isshow" type="radio" id="isshow" value="1" <?php echo (1==$row["isshow"]) ? 'checked' : ''  ?> />
     		 暫停出貨
             
			 
             <input <? if($row["isshow"]==3 or $row["isshow"]==4){?>disabled<? } ?> id="isshow" name="isshow" type="radio" value="2" <?php echo (2==$row["isshow"]) ? 'checked' : ''  ?> />
     		 立即取貨
            
     		 <input <? if($row["isshow"]==3 or $row["isshow"]==4){?>disabled<? } ?> name="isshow" type="radio" id="isshow" value="3" <?php echo (3==$row["isshow"]) ? 'checked' : ''  ?> />
     		 已出貨
             
             <input <? if($row["isshow"]==3 or $row["isshow"]==4){?>disabled<? } ?> name="isshow" type="radio" id="isshow" value="4" <?php echo (4==$row["isshow"]) ? 'checked' : ''  ?> />
     		 取消訂單   
            </td>
          </tr>
		  
		  <tr>
            <td valign="top"><h4 class="input-text-title">團購品名</h4></td>
            <td><a href="../product/edit.php?id=<?php echo $row["pid"]?>"><?php echo $pid_title ?><input name="pid" type="hidden" id="pid" value="<?php echo $pid ?>" /></a></td>
            </tr>
		  
		  
		  <tr>
            <td valign="top"><h4 class="input-text-title">購買人</h4></td>
            <td><a href="../user/edit.php?id=<?php echo $row["uid"]?>"><?php echo $uid_title ?></a>
              <input name="uid" type="hidden" id="uid" value="<?php echo $uid ?>" /></td>
            </tr>
		  
          <tr>
            <td valign="top"><h4 class="input-text-title">團購數量</h4></td>
            <td>
			<?php echo $amount ?><input name="sum3" type="hidden" id="sum3" value="<?php echo $amount?>" />
            </td>
          </tr>
          <tr>
            <td valign="top"><h4 class="input-text-title">階段金額</h4></td>
            <td><?php echo ceo_range($row["pid"],$row["pid_total"])*$row["amount"]?><input name="sum" type="hidden" id="sum" value="<?php echo ceo_range($row["pid"],$row["pid_total"])*$row["amount"]?>" /></td>
          </tr>
        
          <tr>
            <td valign="top"><h4 class="input-text-title">應付金額</h4></td>
            <?php if($row["isshow"]!=2){$sum =  ceo_range($row["pid"],$row["pid_total"])*$row["amount"];}else{$sum =  ceo_range_top($row["pid"],$row["pid_total"])*$row["amount"];}?>
            <td><?php if($sum>5000){echo $sum+$row["bonus"];}else{echo $sum+$row["bonus"];}?><input name="sum2" type="hidden" id="sum2" value="<?php echo $sum ?>" /></td>
          </tr>
          <tr>
            <td valign="top"><h4 class="input-text-title">會員購物金</h4></td>
            <td><?php echo $row["bonus"]?></td>
          </tr>
          
         
          <tr>
            <td valign="top"><h4 class="input-text-title">備註</h4></td>
            <td><label for="content"></label>
                <textarea name="content" id="content" cols="50" rows="10"><?php echo removebr($content) ?></textarea></td>
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

