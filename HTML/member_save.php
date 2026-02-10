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
$table ="ceo_user";
$db = new Database($HS, $ID, $PW, $DB);
$db->connect();
$data["createtime"]=request_cd();
$data["isshow"]=post("isshow");
$data["title"]=post("title",1);
$data["title2"]=post("title2",1);
$data["title3"]=post("title3",1);

//判斷統編是否重複
$sql = "SELECT * FROM  `ceo_user` WHERE  `title2` LIKE  '".$data["title2"]."'";
$rows = $db->fetch_all_array($sql);
if(count($rows)!=0)
{
	script("統一編號(登入帳號)重複!","member_write.php");
	exit;
}
$data["name"]=post("name",1);
$data["name2"]=post("name2",1);
$data["tel"]=post("tel",1);
$data["cel"]=post("cel",1);
$data["password"]=post("tel",1);
$data["mail"]=post("mail",1);
$data["addr"]=post("addr",1);

$filepath = $path_case;
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


  $db->query_insert($table,$data);
  
  $db->close();

  script("註冊成功，待審核通過，帳號密碼將會寄至您的信箱！","index.php");

?>
</body>
</html>
