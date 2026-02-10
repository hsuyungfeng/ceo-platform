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
//$data["isshow"]=post("isshow");
$data["amount"]=post("amount",1);
$data["createtime"]=request_cd();

$data["pid"]=post("pid");
$data["uid"]=post("uid");
$data["mid"]=post("mid");

$sql="select ceo_product.*
from ceo_product 
where 1 and ceo_product.id='".$data["pid"]."'";

$row = $db->query_first($sql);
if($row){
	$aid=$row["aid"];
	$bid=$row["bid"];
	$cid=$row["cid"];
	$pic=$row["pic"];
	$title=$row["title"];
	$title2=$row["title2"];
	$title3=$row["title3"];
	$price=$row["price"];
	$total=$row["total"];
	$sorder=$row["sorder"];
	$scontent=$row["scontent"];
	$scontent2 = $row["scontent2"];
	$endtime=$row["endtime"];
	
	$mid=$row["mid"];
	$timestart=$row["timestart"];
	$timeend=$row["timeend"];
	
	$content=$row["content"];
	$createtime=$row["createtime"];
}else{
 	script("資料不存在");
}

if($_SESSION["uid"]!=$data["uid"] or $timeend < date("Y-m-d H:i:s") or $timestart > date("Y-m-d H:i:s")){
 echo "<script type='text/javascript'>window.open('".$go."','_top');</script>";
 exit;  
}
//print_r($data);
//exit;
  $db->query_insert($table,$data);  
  $sql = "UPDATE `ceo_product` SET `total` = total+".$data["amount"]." WHERE `ceo_product`.`id` = ".$data["pid"].";";
  mysql_query($sql);
  $db->close();

  script("購買成功！","product_detail.php?id=".$data["pid"]);

?>
</body>
</html>
