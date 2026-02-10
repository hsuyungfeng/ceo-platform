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
$data["createtime"]=request_cd();
$data["isshow"]=post("isshow");
$data["title"]=post("title",1);
$data["title2"]=post("title2",1);
$data["name"]=post("name",1);
$data["name2"]=post("name2",1);
$data["tel"]=post("tel",1);
$data["cel"]=post("cel",1);
$data["mail"]=post("mail",1);
$data["addr"]=post("addr",1);
$data["account"]=post("account",1);
$data["password"]=post("password",1);
$data["title3"]=post("title3",1);

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

  
  $db->close();
  

$content="
親愛的會員您好：<BR>
非常歡迎您加入CEO商品資訊網會員。<BR>
<BR>
<table width='500' border='1' cellpadding='0' cellspacing='0'>
			<tr>
			  <td width='60'>帳號</td>
			  <td width='440'>".$data["title2"]."</td>
			</tr>
			<tr>
			  <td width='60'>密碼</td>
			  <td width='440'>".$data["password"]."</td>
			</tr>
			</table>
			<BR>
			會員登入：http://www.betterchoice.com.tw/member_login.php<BR>
			<BR>
			<BR>
			*此為系統發出信件，請勿直接回覆；若您對本信函有任何疑問，<BR>
			請洽CEO商品資訊網客服中心，再次感謝您對我們的支持!
			";
//echo "123";			
//echo $data["isshow"];			
if($data["isshow"]==1){
sendmail($sys_email,"CEO商品資訊網",$data["mail"],'','CEO商品資訊網 - 審核通過',$content);
}
script("修改完成!","edit.php?id=".$id."&".$querystr);
?>
</body>
</html>
