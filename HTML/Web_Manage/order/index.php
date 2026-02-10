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
	if($isshow==-1){$sqlstr.=" and car.timeend>'".date("Y-m-d H:i:s")."' and $table.isshow != '2' and $table.isshow != '4' and $table.isshow != '3'";}
	elseif($isshow==0){$sqlstr.=" and $table.isshow=$isshow and car.timeend<'".date("Y-m-d H:i:s")."'";}
	else{$sqlstr.=" and $table.isshow=$isshow";}
}
if ($keyword!="" && $stype!==""){
	switch($stype){
		case 0:
			$sqlstr=" and car.title2 like '%$keyword%' ";
		break;
		case 1:
			$sqlstr=" and car2.title like '%$keyword%' ";
		break;
	}
	
}
$ssdate=$sdate;
  if($sdate!=""){
	  $sdate=date("Y/m/d",strtotime($sdate));

	  $sqlstr.=" and $table.createtime >='$sdate' ";

  }
  $eedate=$edate;
  if($edate!=""){

	  $edate= date("Y/m/d",strtotime($edate." +1 days"));
	  $sqlstr.=" and $table.createtime <='$edate' ";
  }	

$sql="select $table.*
	,car.title2 as pid_title
	,car.price as pid_price
	,car.timeend as pid_timeend
	,car.total as pid_total
	,car2.title as uid_title
from $table 
	left join ceo_product as car on car.id=$table.pid 
	left join ceo_user as car2 on car2.id=$table.uid 
where 1 $sqlstr order by $table.id desc";
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

            <option value="0" <?php echo ($stype=="0") ? "selected" : ""?>>團購品名</option>
            <option value="1" <?php echo ($stype=="1") ? "selected" : ""?>>購買人</option>
          </select>  
          <input name="keyword" type="text" size="20" value="<?php echo $keyword?>"> 
          訂單狀態:
              <select name="isshow" id="isshow">
              	   <option value="" <?php echo ($isshow=="") ? "selected" : ""?>>不限</option>
                   <option value="-1" <?php echo ($isshow=="-1") ? "selected" : ""?>>進行中</option>
                   <option value="0" <?php echo ($isshow=="0") ? "selected" : ""?>>處理中</option>
                   <option value="1" <?php echo ($isshow=="1") ? "selected" : ""?>>暫停出貨</option>
                   <option value="2" <?php echo ($isshow=="2") ? "selected" : ""?>>立即取貨</option>
                   <option value="3" <?php echo ($isshow=="3") ? "selected" : ""?>>已出貨</option>
                   <option value="4" <?php echo ($isshow=="4") ? "selected" : ""?>>取消訂單</option>
              </select>
 購買日期:  
          
          
<input name="sdate" type="text" id="sdate" onfocus="HS_setDate(this)" value="<?php echo $ssdate?>" size="12" maxlength="12" />
          ~
          <input name="edate" type="text" id="edate" onfocus="HS_setDate(this)" value="<?php echo $eedate?>" size="12" maxlength="12" />             
          <input name="" type="submit" value="搜尋" />
          
          
          &nbsp;&nbsp;共<?php echo $count?>筆資料
        </form>
		<div class="accordion">
		
	<table width="100%" cellspacing="0" class="list-table">
	<thead>

	<tr>
	<th width="60" align="center" >ID</th>
	<th width="120" align="center" >團購品名</th>
    <th width="120" align="center" >購買人</th>
    <th width="120" align="center" >團購數量</th>
	<th width="120" align="center" >階段金額</th>
    <th width="120" align="center" >應付金額</th>
    <th width="120" align="center" >訂單狀態</th>
    <th width="120" align="center" >會員購物金</th>
   	<!--<th width="60" align="center" >顯示</th>-->
	<th width="120" align="center" >購買日期</th>
	<th width="60" height="28" align="center" >修改</th>
	<!--<th width="60" align="center" >刪除</th>-->
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
	  
	  <td align="center"><a href="../product/edit.php?id=<?php echo $row["pid"]?>"><?php echo $row["pid_title"]?></a></td>
	  
	  <td align="center"><a href="../user/edit.php?id=<?php echo $row["uid"]?>"><?php echo $row["uid_title"]?></a></td>
	  
	  <td align="center"><?php echo $row["amount"]?></td>
	  
	  <td align="center"><?php echo ceo_range($row["pid"],$row["pid_total"])*$row["amount"]?></td>
      <?php if($row["isshow"]!=2){$sum =  ceo_range($row["pid"],$row["pid_total"])*$row["amount"];}else{$sum =  ceo_range_top($row["pid"],$row["pid_total"])*$row["amount"];}?>
      <? if($row["isshow"]==3){$sum = $row["bonus3"];} ?>
      <td align="center"><?php if($sum>5000){echo $sum+$row["bonus"];}else{echo $sum+$row["bonus"];}?></td>
      
      <td align="center"> <?php if($row["createtime2"] && empty($row["createtime3"])){echo "可出貨";}else{if(date("Y-m-d H:i:s")<$row["pid_timeend"] && $row["isshow"]!=1 && $row["isshow"]!=2 && $row["isshow"]!=3 && $row["isshow"]!=4){echo "進行中";}else{echo $aryYN3[$row["isshow"]];}}?></td>
      
      <td align="center"><?php echo $row["bonus"]?></td>
      
	  <!--<td align="center" ><?php echo $aryYN[$row["isshow"]]?></td>-->
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