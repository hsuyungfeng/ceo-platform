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
$id=post("zid");
$amount = request_ary("amount");
$amount_price = request_ary("amount_price");
$count = count($amount);
$data["promo"]=post("promo",1);
$data["aid"]=post("aid",1);
$data["bid"]=post("bid",1);
$data["cid"]=post("cid",1);
$data["title"]=post("title",1);
$data["title2"]=post("title2",1);
$data["title3"]=post("title3",1);
$data["content"]=br(request_str("content",2));
$data["createtime"]=request_cd();
$data["ind"]=getMaxInd($table,"ind","");
$data["price"]=post("price",1);
$data["capacity"]=post("capacity",1);
$data["sorder"]=post("sorder",1);
$data["scontent"]=post("scontent",1);
$data["scontent2"]=post("scontent2",1);
$data["endtime"]=post("endtime",1);
$data["mid"]=post("mid");
$data["timestart"]=post("timestart",1)."-".post("h_start",1).":00:00";
$data["timeend"]=post("timeend",1)."-".post("h_end",1).":00:00";
$data["mid"]=post("mid",1);
$data["sid"]=post("sid",1);

$file =new imgUploder($_FILES['pic']);
if ($file->file_name != "")
{		

	$rr=substr($file->file_name,-4);
	$file->set("file_name",time()."1".$rr);
	$file->set("file_max",1024*1024*3); 
	$file->set("file_dir",$filepath); 
	$file->set("overwrite","3"); 
	$file->set("fstyle","image"); 
	if ($file->upload() && $file->file_name!=""){
		$file->file_sname="m"; 
		$file->createSmailImg($data1_pic_w,$data1_pic_h,6);
		$data["pic"]=$file->file_name;
	}
	else{
		script($file->user_msg);
		exit;
	}	
}
  $sn=$db->query_update($table,$data,"id=$id");

$sql = "DELETE FROM ceo_range where pid=".$id.";";
mysql_query($sql);

  for($i=0;$i<$count;$i++)
{
if(!empty($amount[$i]) && !empty($amount_price[$i])){	
$sql = "INSERT INTO ceo_range (pid,amount, price) VALUES (".$id.",".$amount[$i].",".$amount_price[$i].");";
mysql_query($sql);
}

}
  
  $db->close();
  script("修改完成!","edit.php?id=".$id."&".$querystr);

?>
</body>
</html>
