<?php
include $inc_path."_config.php";
include $inc_path."_web_func.php";
$sid=session_id();

if(!isset($_SESSION["madmin"]) || !isset($_SESSION["userid"]))
 {
      echo "<script type='text/javascript'>window.open('".$manage_path."login.html','_top');</script>";
      exit;  
 }
 
 function isExist($table,$field,$val,$where){
	global $db;
	$row=$db->query_first("select $field  from $table where $field=$val $where",$field);
	return ($row) ? true : false;
}
 								   

function reviewPic($reviewpic){
	global $managepath;
	echo (trim($reviewpic)=="") ? "" : "<a href='$managepath$reviewpic' target='_blank'>瀏覽</a>";
}

function getOrder($order,$table,$field,$nid,$where){ //上移下移的function
	global $db;
	$sql="";
	$row=$db->query_first("select $field from $table where id=".$nid);
	$ind=$row[$field];

	if ($order=="down"){
		$sql="Select  id as id,$field as field from $table where  $field < $ind  $where order by $field desc limit 1 ";
	}
	else{
		$sql="Select  id as id ,$field as field from $table where  $field > $ind $where order by $field limit  1 ";
	}

	$row=$db->query_first($sql);
	if ($row){
		$new_nid=$row["id"];   //要換順序的id
		$new_ind=$row["field"];//新的順序
	
		$db->query("update $table set $field=$new_ind where id=$nid"); //將指定id換到新順序
		$db->query("update $table set $field=$ind where id=$new_nid"); //將要換順序的id換到舊順序
	}
}
function getMaxInd($table,$field,$where){
	global $db;
	$row=$db->query_first("select max($field) as max from $table $where","max");
	$maxind=intval($row["max"]);
	
	if ($maxind==0){
		$maxind=1;
	}
	else{
		$maxind+=5;
	}
	return $maxind;
}
?>