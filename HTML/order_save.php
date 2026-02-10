<?php

include("_config.php");
include($inc_path."_imgupload.php");
$go = "index.php";
include("log.php");
$table = "ceo_order";
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Untitled Document</title>
</head>

<body>
<?php
$db = new Database($HS, $ID, $PW, $DB);
$db->connect();
$data["isshow"]=get("isshow");
$data["amount"]=get("amount");
$data["pid"]=get("pid");
$data["uid"]=get("uid");
$data["id"]=get("id");

$table = "ceo_order";
$sql="select $table.*
	,car.timeend as pid_timeend
	,car.timestart as pid_timestart
from $table 
	left join ceo_product as car on car.id=$table.pid 
where $table.id='".$data["id"]."'";

$row = $db->query_first($sql);
if($row){
	$pid=$row["pid"];
	$uid=$row["uid"];
	$amount=$row["amount"];
	$bonus=$row["bonus"];
	$content=$row["content"];
	$isshow=$row["isshow"];
	
	$pid_timeend=$row["pid_timeend"];
	$pid_timestart=$row["pid_timestart"];
	
}else{
 	script("資料不存在");
}

if($_SESSION["uid"]!=$uid or $pid_timeend < date("Y-m-d H:i:s") or $pid_timestart > date("Y-m-d H:i:s")){
 echo "<script type='text/javascript'>window.open('".$go."','_top');</script>";
 exit;  
}

//print_r($data);
//exit; 
  $sql = "UPDATE `ceo_order` SET `isshow` = ".$data["isshow"]." WHERE `ceo_order`.`id` = ".$data["id"].";";
  mysql_query($sql);

  if($data["isshow"]==4){
  $sql2 = "UPDATE `ceo_product` SET `total` = `total`-".$data["amount"]." WHERE `ceo_product`.`id` = ".$data["pid"].";";
  //echo $sql;
  //exit;
  mysql_query($sql2);
}
  

  $db->close();

  script("設置成功！","member_order.php");

?>
</body>
</html>
