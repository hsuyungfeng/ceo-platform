<?php

include("_config.php");
include($inc_path."_imgupload.php");
$id=get("id");
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Untitled Document</title>
</head>

<body>
<?php
if ($id==0){
	script("資料傳輸不正確","index.php");
}
$db = new Database($HS, $ID, $PW, $DB);
$db->connect();
$sql="select * from $table where id='$id'";
$row = $db->query_first($sql);
if($row){
	if($row["fid"]==0){
	$fid=$row["id"];
	}else{	
	$fid=$row["fid"];
	}
	$promo=$row["promo"];
	$aid=$row["aid"];
	$bid=$row["bid"];
	$cid=$row["cid"];
	$pic=$row["pic"];
	$title=$row["title"];
	$title2=$row["title2"];
	$title3=$row["title3"];
	$price=$row["price"];
	$capacity=$row["capacity"];
	$sorder=$row["sorder"];
	$scontent=$row["scontent"];
	$scontent2=$row["scontent2"];
	$endtime=$row["endtime"];
	
	$mid=$row["mid"];
	$timestart=$row["timestart"];
	$timeend=$row["timeend"];
	
	$content=$row["content"];
	$createtime=$row["createtime"];
}else{
 	script("資料不存在");
}


//$data["isshow"]=post("isshow");
$amount = request_ary("amount");
$amount_price = request_ary("amount_price");
$count = count($amount);

$data["fid"]=$fid;
$data["promo"]=$promo;
$data["aid"]=$aid;
$data["bid"]=$bid;
$data["cid"]=$cid;
$data["title"]=$title;
$data["title2"]=$title2;
$data["title3"]=$title3;
$data["content"]=$content;
$data["createtime"]=request_cd();
$data["ind"]=getMaxInd($table,"ind","");
$data["price"]=$price;
$data["sorder"]=$sorder;
$data["scontent"]=$scontent;
$data["scontent2"]=$scontent2;
//$data["endtime"]=post("endtime",1);
$data["mid"]=$mid;
$data["pic"]=$pic;
$data["capacity"]=$capacity;


//$data["timestart"]=post("timestart",1)."-".post("h_start",1).":00:00";
//$data["timeend"]=post("timeend",1)."-".post("h_end",1).":00:00";


$pid= $db->query_insert($table,$data);

$db->query("insert into ceo_range (pid,amount,price) select $pid as pid,amount,price from ceo_range where pid='$id' ");  

/*
  for($i=0;$i<$count;$i++)
{
if(!empty($amount[$i]) && !empty($amount_price[$i])){
$sql = "INSERT INTO ceo_range (pid,amount, price) VALUES (".$pid.",".$amount[$i].",".$amount_price[$i].");";
}
mysql_query($sql);
}*/
  
  $db->close();

  script("重新刊登成功!","edit.php?id=".$pid."");

?>
</body>
</html>
