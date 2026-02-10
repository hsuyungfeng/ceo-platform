<?php 
include("_config.php");
include($inc_path."_getpage.php");
$db = new Database($HS, $ID, $PW, $DB);
$db->connect();
$reind=trim(get("remove",1));
if ($reind!=""){
	$nid=get("nid",0);

	if ($nid>0 ){
		getOrder($reind,$table,"ind",$nid,"");
	}
}
//刪除用的
if (get("isdel",1)=='y')
{
$did=get("did");
  	$db->query("delete from $table where id='$did'");
	$db->query("delete from kingflyn_case where class='$did'");
	script("刪除成功");
}
//搜尋
$count=0;
$sqlstr="";
if ($isshow!=""){
	if($isshow==-1){$sqlstr.=" and car.timeend>'".date("Y-m-d H:i:s")."' and $table.isshow != '2'";}
	elseif($isshow==0){$sqlstr.=" and $table.isshow=$isshow and car.timeend<'".date("Y-m-d H:i:s")."'";}
	else{$sqlstr.=" and $table.isshow=$isshow";}
}
if ($keyword!="" && $stype!==""){
	switch($stype){
		case 0:
			$sqlstr=" and car2.title like '%$keyword%' ";
		break;
		case 1:
			$sqlstr=" and car2.tel like '%$keyword%' ";
		break;
		case 2:
			$sqlstr=" and car2.addr like '%$keyword%' ";
		break;
	}
	
}
$ssdate=$sdate;
  if($sdate!=""){
	  //$sdate=date("Y/m/d",strtotime($sdate));

	  $sqlstr.=" and $table.createtime3 >='$sdate' ";

  }
  $eedate=$edate;
  if($edate!=""){

	  $edate= date("Y/m/d",strtotime($edate." +1 days"));
	  $sqlstr.=" and $table.createtime3 <='$edate' ";
  }
  
  if($sdate=="" && $edate==""){
	  $sqlstr.=" and $table.createtime3 IS NULL ";
	  }
	  
$sql="select $table.*
	,car.title2 as pid_title
	,car.price as pid_price
	,car.timeend as pid_timeend
	,car.total as pid_total
	,car2.title as uid_title
	,car2.tel as uid_tel
	,car2.cel as uid_cel
	,car2.addr as uid_addr
	,car2.bonus as uid_bonus
from $table 
	left join ceo_product as car on car.id=$table.pid 
	left join ceo_user as car2 on car2.id=$table.uid 
where 1 $sqlstr and ceo_order.createtime2 IS NOT NULL order by $table.uid desc";
//echo $sql;
//echo request_cd(); 
getsql($sql,15,$querystr);
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Untitled Document</title>
<link href="../css/admin_style_gray.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="../../scripts/jquery-1.6.1rc1.min.js"></script>
<!-- Add fancyBox -->
<link rel="stylesheet" href="../../source/jquery.fancybox.css?v=2.1.4" type="text/css" media="screen" />
<script type="text/javascript" src="../../source/jquery.fancybox.pack.js?v=2.1.4"></script>
<script type="text/javascript" src="../../scripts/selectdate.js"></script>

<script type="text/javascript">
$(document).ready(function(){
	
	$(".accordion .tableheader:first").addClass("active");
	$(".accordion .tableheader").toggle(function(){
		$(this).next().slideDown("fast");
	},function(){
	   $(this).next().slideUp("fast");
	   $(this).siblings("tableheader").removeClass("active");

	});
	
	$(".various")
    .attr('rel', 'gallery')
    .fancybox({
		width		: '80%',
		height		: '67%',
		autoSize	: false,
		padding     : 0,
		helpers : {
			overlay : {
				css : {
					'background' : 'rgba(0, 0, 0, 0.60)'
				}
			}
		}
    });


});

</script>
</head>

<body>

<div id="mgbody-content">
		<div id="panel">
	
	<br />
	</div>
 
<!--<p class="slide">
<a href="add.php" class="btn-slide">新增</a></p>-->
 
        <div id="adminlist">
		<h2> <img src="../images/admintitle.png" />&nbsp;&nbsp;<?php echo $mtitle?></h2>
        <br><form method="get" action="index.php">
        關鍵字:
        <select id="stype" name="stype">

            <option value="0" <?php echo ($stype=="0") ? "selected" : ""?>>購買人</option>
            <option value="1" <?php echo ($stype=="1") ? "selected" : ""?>>聯絡電話</option>
            <option value="2" <?php echo ($stype=="2") ? "selected" : ""?>>通訊地址</option>
          </select>  
          <input name="keyword" type="text" size="20" value="<?php echo $keyword?>"> 
          <!--訂單狀態:
              <select name="isshow" id="isshow">
              	   <option value="" <?php echo ($isshow=="") ? "selected" : ""?>>不限</option>
                   <option value="-1" <?php echo ($isshow=="-1") ? "selected" : ""?>>進行中</option>
                   <option value="0" <?php echo ($isshow=="0") ? "selected" : ""?>>處理中</option>
                   <option value="1" <?php echo ($isshow=="1") ? "selected" : ""?>>暫停出貨</option>
                   <option value="2" <?php echo ($isshow=="2") ? "selected" : ""?>>立即取貨</option>
                   <option value="3" <?php echo ($isshow=="3") ? "selected" : ""?>>已出貨</option>
                   <option value="4" <?php echo ($isshow=="4") ? "selected" : ""?>>取消訂單</option>
              </select>-->
已匯出EXCEL日期:  
          
          
<input name="sdate" type="text" id="sdate" onfocus="HS_setDate(this)" value="<?php echo $ssdate?>" size="12" maxlength="12" />
          ~
          <input name="edate" type="text" id="edate" onfocus="HS_setDate(this)" value="<?php echo $eedate?>" size="12" maxlength="12" />             
          <input name="" type="submit" value="搜尋" />
          
          
          &nbsp;&nbsp;<a href="excel.php?keyword=<?=$keyword?>&stype=<?=$stype?>&sdate=<?=$sdate?>&edate=<?=$edate?>" target="_blank" onclick="return confirm('您確定要匯出Excel?')"><B>匯出EXCEL</B></a>&nbsp;&nbsp;共<?php echo $count?>筆資料
        </form>
		<div class="accordion">
		
	<table width="100%" cellspacing="0" class="list-table">
	<thead>

	<tr>
	<th width="60" align="center" >ID</th>
    <th width="120" align="center" >購買人</th>
    <th width="120" align="center" >聯絡電話</th>
    <th width="120" align="center" >行動電話</th>
    <th width="120" align="center" >通訊地址</th>
    <th width="120" align="center" >購買商品</th>
    <th width="120" align="center" >數量</th>
    <th width="120" align="center" >應收金額</th>
    <!--<th width="120" align="center" >扣除購物金後</th>-->
    <th width="120" align="center" >狀態</th>
    <!--<th width="120" align="center" >團購數量</th>
	<th width="120" align="center" >階段金額</th>
    <th width="120" align="center" >應付金額</th>
    <th width="120" align="center" >訂單狀態</th>
    <th width="120" align="center" >會員購物金</th>
   	<th width="60" align="center" >顯示</th>
	<th width="120" align="center" >購買日期</th>
	<th width="60" height="28" align="center" >修改</th>
	<th width="60" align="center" >刪除</th>-->
	</tr>
	</thead>
	<tbody id="the-list" class="list:cat">
<?php
$uid="";
$total_sum=0;
$rows = $db->fetch_all_array($sql);
foreach($rows as $row)
{
	      
	  $sum=0;
	  if($row["isshow"]!=2){	
	$sum = ceo_range($row["pid"],$row["pid_total"])*$row["amount"];
	}else{
	$sum =	ceo_range_top($row["pid"],$row["pid_total"])*$row["amount"];
	}
	  
	
 if($uid != $row["uid"] && $uid!=""){
	 
	?>
    <tr>
    <td></td>
    <td></td>
    <td></td>
    <td colspan="2" align="right"><? if($isshow!=3){?><strong>現有購物金:<?php echo $uid_bonus?></strong><? } ?></td>
    <td></td>
    <td></td>
    <?
    $tsum = $total_sum-$uid_bonus+$shipping;
	if($tsum<0){$tsum=0;}
	if($isshow==3){$tsum = $bonus2;}
	?>
    <td align="center"><strong>銷售額合計:<?php echo $tsum?></strong></td>
    <?
    $bsum = $uid_bonus-$total_sum-$shipping;
	if($bsum<0){$bsum=0;}
	?>
    <td align="right"><? if($isshow!=3){?><strong>剩餘購物金:<?php echo $bsum?><? } ?></strong></td>
    </tr>
<?php
$total_sum  = 0;	
} ;
$total_sum += $sum;
$uid = $row["uid"];
$uid_bonus = $row["uid_bonus"];
$bonus2 = $row["bonus2"];
$bonus3 = $row["bonus3"];
$isshow = $row["isshow"];
?>
	<tr>
	  <td align="center"><?php echo $row["id"]?></td>
	  
	  <td align="center"><a href="../user/edit.php?id=<?php echo $row["uid"]?>"><?php echo $row["uid_title"]?></a></td>
      
      <td align="center"><?php echo $row["uid_tel"]?></td>
      
      <td align="center"><?php echo $row["uid_cel"]?></td>
      
      <td align="center"><?php echo $row["uid_addr"]?></td>
      
      <!--<td align="center"><?php echo printout_product($row["uid"])?></td>-->
      
      <td align="center"><?php echo $row["pid_title"]?></td>
      
      <td align="center"><?=$row["amount"]?></td>
		<? if($isshow==3){$sum = $bonus3;} ?>
      <td align="center"><?php echo $sum ?></td>
      
      <!--<td align="center"><?php echo printout_money($row["uid"])?></td>-->
      
      <!--<td align="center"><?php if($row["isshow"]==3){echo $row["bonus2"];}else{if((printout_money($row["uid"])-printout_bonus($row["uid"]))<0){echo "0";}else{echo printout_money($row["uid"])-printout_bonus($row["uid"]);}}?></td>-->
	  <?php if($row["isshow"]==3){?>
      <td align="center">已匯出</td>
      <? }else{ ?>
      <td align="center">未匯出</td>
      <? } ?>
	 <!-- <td align="center"><?php echo $row["amount"]?></td>
	  
	  <td align="center"><?php echo ceo_range2($row["pid"],$row["pid_total"],$row["amount"])?></td>
      <?php if($row["isshow"]!=2){$sum =  ceo_range2($row["pid"],$row["pid_total"],$row["amount"]);}else{$sum =  $row["amount"]*$row["pid_price"];}?>
      <td align="center"><?php if($sum>5000){echo $sum;}else{echo $sum+$shipping;}?></td>
      
      <td align="center"><?php if(date("Y-m-d H:i:s")<$row["pid_timeend"] && $row["isshow"]!=2){echo "進行中";}else{echo $aryYN3[$row["isshow"]];}?></td>
      
      <td align="center"><?php echo $row["bonus"]?></td>
      
	  <td align="center" ><?php echo $aryYN[$row["isshow"]]?></td>
      <td align="center" ><?php echo $row["createtime"]?></td>
	  <td align="center"><a href="edit.php?id=<?php echo $row["id"]?>">修改</a></td>
	   <!--<td align="center" ><a href="index.php?isdel=y&did=<?php echo $row["id"]?>" onclick="return confirm('您確定要刪除這筆記錄?')">刪除</a></td>-->
	</tr>

<?php

}

?>

<tr>
    <td></td>
    <td></td>
    <td></td>
    <td colspan="2" align="right"><? if($isshow!=3){?><strong>現有購物金:<?php echo @$row["uid_bonus"]?></strong><? } ?></td>
    <td></td>
    <td></td>
    <?
    @$tsum = $total_sum-$uid_bonus+$shipping;
	if($tsum<0){$tsum=0;}
	if($isshow==3){$tsum = $bonus2;}
	?>
    <td align="center"><strong>銷售額合計:<?php echo $tsum?></strong></td>
    <?
    @$bsum = $uid_bonus-$total_sum-$shipping;
	if($bsum<0){$bsum=0;}
	?>
    <td align="right"><? if($isshow!=3){?><strong>剩餘購物金:<?php echo $bsum?></strong><? } ?></td>
</tr>

<?
$db->close();
?>
	</tbody>
		<tfoot>
	<tr>
	<th height="28" colspan="14" align="right"  class="tfoot" style="" scope="col"><?=showpage()?></th>
	</tr>
	</tfoot>
</table>
</div>
	</div>
</div>
</body>
</html>
<?
function printout_product($uid)
{
	global $HS, $ID, $PW, $DB, $table,$sqlstr;
	$title="";
	
  $sql = "SELECT * FROM  `ceo_order` WHERE  `uid` =".$uid."";
  $sql="select $table.*
	,car.title2 as pid_title
	,car.price as pid_price
	,car.timeend as pid_timeend
	,car.total as pid_total
	,car2.title as uid_title
	,car2.tel as uid_tel
	,car2.addr as uid_addr,
	sum($table.amount) as totals
from $table 
	left join ceo_product as car on car.id=$table.pid 
	left join ceo_user as car2 on car2.id=$table.uid 
 WHERE 1 $sqlstr and `uid` =".$uid." and `createtime2` IS NOT NULL group by $table.pid ";
 //echo $sql;
  $db = new Database($HS, $ID, $PW, $DB);
	$db->connect();
	$rows = $db->fetch_all_array($sql);

	foreach($rows as $row){ 
	$title .= $row["pid_title"]."X".$row["totals"]."<BR>";
	}
  return $title;
}

function printout_money($uid)
{
	$sum=0;
	global $HS, $ID, $PW, $DB, $table,$shipping_back,$shipping,$sqlstr;
	
$sql="select * from ceo_user where id='".$uid."'";
$db = new Database($HS, $ID, $PW, $DB);
$db->connect();
$row = $db->query_first($sql);
$uid_bonus = $row["bonus"];
//echo $uid_bonus;

 $sql="select $table.*
	,car.title as pid_title
	,car.price as pid_price
	,car.timeend as pid_timeend
	,car.total as pid_total
	,car2.title as uid_title
	,car2.tel as uid_tel
	,car2.addr as uid_addr
from $table 
	left join ceo_product as car on car.id=$table.pid 
	left join ceo_user as car2 on car2.id=$table.uid 
 WHERE 1 $sqlstr and `uid` =".$uid." and `createtime2` IS NOT NULL";
 //echo $sql;
 //exit;
$db = new Database($HS, $ID, $PW, $DB);
	$db->connect();
	$rows = $db->fetch_all_array($sql);
	
	foreach($rows as $row){
	if($row["isshow"]!=2){	
	$sum += ceo_range($row["pid"],$row["pid_total"])*$row["amount"]+$row["bonus"];
	}else{
	$sum +=	ceo_range_top($row["pid"],$row["pid_total"])*$row["amount"]+$row["bonus"];
	}
	}
	if($sum>$shipping_back){$sum = $sum;}else{$sum = $sum+$shipping;}
	if($row["isshow"]!=3){
	$sum2 = abs($uid_bonus - $sum);
	}
  return $sum;
}

function printout_bonus($uid)
{
	$sum=0;
	global $HS, $ID, $PW, $DB;
	
$sql="select * from ceo_user where id='".$uid."'";
$db = new Database($HS, $ID, $PW, $DB);
$db->connect();
$row = $db->query_first($sql);
$uid_bonus = $row["bonus"];
//echo $uid_bonus;

  return $uid_bonus;
}

function ceo_range2($pid,$total,$amount=null)
{
	//echo $total;
	global $HS, $ID, $PW, $DB;
	$value=0;
	$sql = "SELECT * FROM  `ceo_product` WHERE  `id` =".$pid."";	
$db = new Database($HS, $ID, $PW, $DB);
	$db->connect();
	$row2 = $db->query_first($sql);
	
  $sql = "SELECT * FROM  `ceo_range` WHERE  `pid` =".$pid." ORDER BY  `ceo_range`.`amount` ASC ";
  $db = new Database($HS, $ID, $PW, $DB);
	$db->connect();
	$rows = $db->fetch_all_array($sql);
	$value=$row2["price"];
	foreach($rows as $row){
		//echo $total;
		if($total>=$row["amount"]){$value=$row["price"];}
	//echo $total;
	//echo "<BR>";
	//echo $row["amount"].">>".$row["price"]."=".$value;
	//echo "<BR>";
	}
  return $value*$amount;
}
?>