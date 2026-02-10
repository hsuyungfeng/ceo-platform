<?php

include("_config.php");
include($inc_path."_imgupload.php");

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
$id=post("cid");
$data["uid"]=post("uid");
$data["pid"]=post("pid");
$data["isshow"]=post("isshow");
$data["content"]=br(request_str("content"));

if($data["isshow"]==3){
	$bonus = post("sum2") - post("sum");
  $sql = "UPDATE `ceo_order` SET `bonus` = ".$bonus." WHERE `ceo_order`.`id` = ".$id.";";
  $sql2 = "UPDATE `ceo_user` SET  `bonus` =  `bonus`+".$bonus." WHERE  `ceo_user`.`id` =".$data["uid"]."";
  //echo $sql;
  //exit;
  mysql_query($sql);
  mysql_query($sql2);
}

  if($data["isshow"]==4){
	  $amount = post("sum3");
  $sql3 = "UPDATE `ceo_product` SET `total` = `total`-".$amount." WHERE `ceo_product`.`id` = ".$pid.";";
  //echo $sql;
  //exit;
  mysql_query($sql3);
}


  $sn=$db->query_update($table,$data,"id=$id");

  $db->close();
  script("修改完成!","edit.php?id=".$id."&".$querystr);

?>
</body>
</html>
