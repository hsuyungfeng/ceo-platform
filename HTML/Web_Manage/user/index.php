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
	script("刪除成功");
}
//搜尋
$count=0;
$sqlstr="";
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
if ($keyword!="" && $stype!==""){
	switch($stype){
		case 0:
			$sqlstr=" and $table.title like '%$keyword%' ";
		break;
		case 1:
			$sqlstr=" and $table.title2 like '%$keyword%' ";
		break;
		case 2:
			$sqlstr=" and $table.name like '%$keyword%' ";
		break;
		case 3:
			$sqlstr=" and $table.name2 like '%$keyword%' ";
		break;
		case 4:
			$sqlstr=" and $table.tel like '%$keyword%' ";
		break;
		case 5:
			$sqlstr=" and $table.cel like '%$keyword%' ";
		break;
		case 6:
			$sqlstr=" and $table.mail like '%$keyword%' ";
		break;
		case 7:
			$sqlstr=" and $table.addr like '%$keyword%' ";
		break;

	}
	}


$sql="select * from  $table where 1 $sqlstr order by id desc";

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

            <option value="0" <?php echo ($stype=="0") ? "selected" : ""?>>公司名稱</option>
            <option value="1" <?php echo ($stype=="1") ? "selected" : ""?>>統一編號</option>
            <option value="2" <?php echo ($stype=="2") ? "selected" : ""?>>負責人</option>
            <option value="3" <?php echo ($stype=="3") ? "selected" : ""?>>主要聯絡人</option>
            <option value="4" <?php echo ($stype=="4") ? "selected" : ""?>>聯絡電話</option>
            <option value="5" <?php echo ($stype=="5") ? "selected" : ""?>>行動電話</option>
            <option value="6" <?php echo ($stype=="6") ? "selected" : ""?>>電子信箱</option>
            <option value="7" <?php echo ($stype=="7") ? "selected" : ""?>>通訊地址</option>
          </select>   
          <input name="keyword" type="text" size="20" value="<?php echo $keyword?>"> 
          審核狀態:
              <select name="isshow" id="isshow">
              	   <option value="" <?php echo ($isshow=="") ? "selected" : ""?>>不限</option>
                   <option value="1" <?php echo ($isshow=="1") ? "selected" : ""?>>審核通過</option>
                   <option value="0" <?php echo ($isshow=="0") ? "selected" : ""?>>審核中</option>
              </select>
		加入時間：
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
	<th width="20" align="center" >ID</th>
	<th width="50" align="center" >公司名稱</th>
	<th align="center" width="60">統一編號</th>
    <th width="40" align="center" >負責人</th>
    <th width="120" align="center" >主要聯絡人</th>
    <th width="70" align="center" >聯絡電話</th>
    <th width="80" align="center" >行動電話</th>
	<th width="100" align="center" >電子信箱</th>
	<th width="120" align="center" >通訊地址</th>
    <!--<th width="120" align="center" >執照</th>-->
   	<th width="60" align="center" >審核</th>
	<th width="120" align="center" >加入時間</th>
    <!-- <th width="60" height="28" align="center" >上移</th>
    <th width="60" height="28" align="center" >下移</th>-->
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
	  
	  <td align="center"><?php echo $row["title"]?></td>
	  
      <td align="center"><?php echo $row["title2"]?></td>
	  
	  <td align="center"><?php echo $row["name"]?></td>
      
      <td align="center"><?php echo $row["name2"]?></td>
      
      <td align="left"><?php echo $row["tel"]?></td>
	  
	  <td align="center"><?php echo $row["cel"]?></td>
      
      <td align="center"><?php echo $row["mail"]?></td>
	  
	  <td align="center"><?php echo $row["addr"]?></td>
      
      <!--<td align="center" style="word-break:break-all"><a title="<?php echo $row["title"] ?>" class="various" href=<?php echo $filepath.$row["pic"] ?> ><img width="50" src="<?php echo $filepath.'m'.$row["pic"]?>"></a></td>-->
      
	  <td align="center" ><?php echo $aryYN2[$row["isshow"]]?></td>
      <td align="center" ><?php echo $row["createtime"]?></td>
      <!--<td align="center"><a href="?remove=up&amp;nid=<?php echo $row["id"]."&".$querystr ?>">上移</a></td>
      <td align="center"><a href="?remove=down&amp;nid=<?php echo $row["id"]."&".$querystr ?>">下移</a></td>-->
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
	<th height="28" colspan="14" align="right"  class="tfoot" style="" scope="col"><?=showpage()?></th>
	</tr>
	</tfoot>
</table>
</div>
	</div>
</div>
</body>
</html>