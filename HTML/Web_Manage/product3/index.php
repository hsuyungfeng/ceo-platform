<?php 
include("_config.php");
include($inc_path."_getpage.php");
$db = new Database($HS, $ID, $PW, $DB);
$db->connect();
//排序用的
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
$sql="select * from ceo_product where 1 and cid = '".$did."' order by ind desc";
$rows = $db->fetch_all_array($sql);
if(count($rows)!=0)
{
	script("底下還有商品無法刪除");
	exit;
}
  	$db->query("delete from $table where id='$did'");
	script("刪除成功");
}
//搜尋用的
$count=0;
$sqlstr="";
if ($keyword!="" && $stype!==""){

	switch($stype){
		case 0:
			$sqlstr=" and car.title like '%$keyword%' ";
		break;
		case 1:
			$sqlstr=" and car2.title like '%$keyword%' ";
		break;
		
		case 2:
			$sqlstr=" and $table.title like '%$keyword%' ";
		break;


	}

}
if ($isshow!=""){
	$sqlstr.=" and isshow=$isshow";

}
$ssdate=$sdate;
 if($sdate!=""){
	  $sdate=date("Y/m/d",strtotime($sdate));

	  $sqlstr.=" and createtime >='$sdate' ";

  }
$eedate=$edate;
  if($edate!=""){

	  $edate= date("Y/m/d",strtotime($edate." +1 days"));

	  $sqlstr.=" and createtime <='$edate' ";

  }	

//$sql="select * from  $table where 1 $sqlstr order by ind desc";
		
$sql="select $table.* 
	,car.title as aid_title
	,car2.title as bid_title 
	from $table
	left join ceo_product1 as car on car.id=$table.aid 
	left join ceo_product2 as car2 on car2.id=$table.bid 
	 where 1 $sqlstr order by ind desc";
//echo $sql;	 
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
 
<p class="slide">
<a href="add.php" class="btn-slide">新增</a></p>
 
        <div id="adminlist">
		<h2> <img src="../images/admintitle.png" />&nbsp;&nbsp;<?php echo $mtitle?></h2>
        <br><form method="get" action="index.php">
        關鍵字: 
		<select id="stype" name="stype">

            <option value="0" <?php echo ($stype=="0") ? "selected" : ""?>>商品大分類</option>
            <option value="1" <?php echo ($stype=="1") ? "selected" : ""?>>商品中分類</option>
            <option value="2" <?php echo ($stype=="2") ? "selected" : ""?>>商品小分類</option>
          </select> 
          <input name="keyword" type="text" size="20" value="<?php echo $keyword?>"> 
<!--          顯示:
              <select name="isshow" id="isshow">
              	   <option value="" <?php echo ($isshow=="") ? "selected" : ""?>>不限</option>
                   <option value="1" <?php echo ($isshow=="1") ? "selected" : ""?>>顯示</option>
                   <option value="0" <?php echo ($isshow=="0") ? "selected" : ""?>>隱藏</option>
              </select>-->
		最後修改日期:
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
    <th align="left" width="60">商品大分類</th>
	<th align="left" width="60">商品中分類</th>
    <th align="left" width="60">商品小分類</th>
	<th width="120" align="center" >最後修改日期</th>
    <th width="60" height="28" align="center" >上移</th>
    <th width="60" height="28" align="center" >下移</th>
	<th width="60" height="28" align="center" >修改</th>
	<th width="60" align="center" >刪除</th>
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
	  <td style="word-break:break-all"><?php echo $row["aid_title"]?></td>
      <td style="word-break:break-all"><?php echo $row["bid_title"]?></td>
	  <td style="word-break:break-all"><?php echo $row["title"]?></td>
      <td align="center" ><?php echo $row["createtime"]?></td>
      <td align="center"><a href="?remove=up&amp;nid=<?php echo $row["id"]."&".$querystr ?>">上移</a></td>
      <td align="center"><a href="?remove=down&amp;nid=<?php echo $row["id"]."&".$querystr ?>">下移</a></td>
	  <td align="center"><a href="edit.php?id=<?php echo $row["id"]?>">修改</a></td>
	  <td align="center" ><a href="index.php?isdel=y&did=<?php echo $row["id"]?>" onclick="return confirm('您確定要刪除這筆記錄?')">刪除</a></td>
	</tr>
<?php
}
$db->close();
?>
	</tbody>
		<tfoot>
	<tr>
	<th height="28" colspan="18" align="right"  class="tfoot" style="" scope="col"><?=showpage()?></th>
	</tr>
	</tfoot>
</table>
</div>
	</div>
</div>
</body>
</html>