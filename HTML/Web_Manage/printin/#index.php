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
	//$db->query("delete from kingflyn_case where class='$did'");
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
			$sqlstr=" and car3.title like '%$keyword%' ";
		break;
	}
	
}
$ssdate=$sdate;
  if($sdate!=""){
	  //$sdate=date("Y/m/d",strtotime($sdate));

	  $sqlstr.=" and $table.createtime2 >='$sdate' ";

  }
  $eedate=$edate;
  if($edate!=""){

	  $edate= date("Y/m/d",strtotime($edate." +1 days"));
	  $sqlstr.=" and $table.createtime2 <='$edate' ";
  }
  
  if($sdate=="" && $edate==""){
	  $sqlstr.=" and $table.createtime2 IS NULL ";
	  }

$sql="select $table.*
	,car.title as pid_title
	,car.price as pid_price
	,car.timeend as pid_timeend
	,car.total as pid_total
	,car2.title as uid_title
	,car2.tel as uid_tel
	,car2.addr as uid_addr
	,car3.title as mid_title
from $table 
	left join ceo_product as car on car.id=$table.pid 
	left join ceo_user as car2 on car2.id=$table.uid
	left join ceo_firm as car3 on car3.id=$table.mid 
where 1 $sqlstr and (car.timeend < '".date("Y-m-d H:i:s")."' or $table.isshow = '2') and `createtime3` IS NULL $sqlstr group by $table.mid desc";
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

            <option value="0" <?php echo ($stype=="0") ? "selected" : ""?>>廠商</option>
          </select>  
          <input name="keyword" type="text" size="20" value="<?php echo $keyword?>"> 
<!--          訂單狀態:
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
    <th width="60" align="center" >廠商</th>
    <th width="240" align="center" >客戶資料</th>
    <th width="60" align="center" >狀態</th>
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
$rows = $db->fetch_all_array($sql);
foreach($rows as $row)
{
?>
	<tr>
	  <td align="center"><?php echo $row["id"]?></td>
	  
	  <td align="center"><?php echo $row["mid_title"]?></td>
      
      <td align="center"><?php echo printin_product($row["mid"])?></td>
      
      <?php if($row["createtime2"]){?>
      <td align="center">已匯出</td>
      <? }else{ ?>
      <td align="center">未匯出</td>
      <? } ?>
	  
	 <!-- <td align="center"><?php echo $row["amount"]?></td>
	  
	  <td align="center"><?php echo ceo_range($row["pid"],$row["pid_total"],$row["amount"])?></td>
      <?php if($row["isshow"]!=2){$sum =  ceo_range($row["pid"],$row["pid_total"],$row["amount"]);}else{$sum =  $row["amount"]*$row["pid_price"];}?>
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
function printin_product($mid)
{
	global $HS, $ID, $PW, $DB, $table,$sqlstr;
	$title="";
	
 $sql="select $table.*
	,car.title2 as pid_title
	,car.title3 as pid_title3
	,car.price as pid_price
	,car.timeend as pid_timeend
	,car.total as pid_total
	,car.sid as pid_sid
	,car2.title as uid_title
	,car2.title2 as uid_title2
	,car2.tel as uid_tel
	,car2.addr as uid_addr
	,car3.title as mid_title,
	sum($table.amount) as totals
from $table 
	left join ceo_product as car on car.id=$table.pid 
	left join ceo_user as car2 on car2.id=$table.uid 
	left join ceo_firm as car3 on car3.id=$table.mid 
where 1 $sqlstr and ceo_order.mid =".$mid." and $table.isshow != '4' and `createtime3` IS NULL and (car.timeend < '".date("Y-m-d H:i:s")."' or $table.isshow = '2') group by $table.pid,$table.uid order by $table.uid";
  //echo $sql;
  $db = new Database($HS, $ID, $PW, $DB);
	$db->connect();
	$rows = $db->fetch_all_array($sql);

	$i=1;
	$allsum=0;
	$tallsum=0;
	$tmp_uid = "";
	foreach($rows as $row){ 
	if($row["isshow"]!=2){$sum =  ceo_range($row["pid"],$row["pid_total"]);}else{$sum =  ceo_range_top($row["pid"],$row["pid_total"]);}
	
	$title .= "<tr><td align=\"center\">".$i."</td><td align=\"center\">".$row["uid_title"]."</td><td align=\"center\">".$row["uid_title2"]."</td><td align=\"center\">".$row["pid_title3"]."</td><td align=\"center\">".$row["pid_title"]."</td><td align=\"center\">".$row["pid_sid"]."</td><td align=\"center\">".$row["totals"]."</td><td align=\"center\">".$sum."</td><td align=\"center\">".$row["totals"]*$sum."</td>";
	$tallsum += $row["totals"]*$sum;
	if($tmp_uid==$row["uid_title"]){
	$title .= "<tr><td align=\"center\"></td><td align=\"center\"></td><td align=\"center\"></td><td align=\"center\"></td><td align=\"center\"></td><td align=\"center\"></td><td align=\"center\">小計</td><td align=\"center\">".$tallsum."</td>";
	$tallsum=0;
	}
	$allsum += $row["totals"]*$sum;
	$i++;
	$tmp_uid = $row["uid_title"];
	}
	$title = "<table width=\"100%\" cellspacing=\"0\" class=\"list-table\"><thead><th align=\"center\" >No.</th><th align=\"center\" >客戶名稱</th><th align=\"center\" >統一編號</th><th align=\"center\" >健保代碼</th><th align=\"center\" >藥品名稱</th><th align=\"center\" >供應商</th><th align=\"center\" >數量</th><th align=\"center\" >單價</th><th align=\"center\" >金額</th></thead><tbody id=\"the-list\" class=\"list:cat\">".$title."<tr><td align=\"right\" colspan=\"6\">銷售合計<td><td align=\"center\">".$allsum."<td></tr></tbody></table>";
  return $title;
}

?>