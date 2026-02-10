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
$data["mail"]=post("mail",1);

//判斷統編是否重複
$sql = "SELECT * FROM  `ceo_user` WHERE  `mail` LIKE  '".$data["mail"]."'";
$row = $db->query_first($sql);
$name=$row["name"];
$title2=$row["title2"];
$password=$row["password"];
//echo $password;
//exit;
$content="<table width='500' border='1' cellpadding='0' cellspacing='0'>
			<tr>
			  <td width='60'>帳號</td>
			  <td width='440'>".$title2."</td>
			</tr>
			<tr>
			  <td width='60'>密碼</td>
			  <td width='440'>".$password."</td>
			</tr>
			</table>";
sendmail($sys_email,$name,$data["mail"],'','CEO商品資訊網 - 密碼通知',$content);  
  $db->close();

  script("密碼將會寄至您的信箱！","index.php");

?>
</body>
</html>
