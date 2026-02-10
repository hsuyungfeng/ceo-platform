<?php
$inc_path="inc/";
include $inc_path."_config.php";

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Untitled Document</title>
</head>
<body>
<?
$username=post('account',1);
$password=post('password',1);

if($username!="" && $password!=""){
  $db = new Database($HS, $ID, $PW, $DB);
  $db->connect();
  $sql="select title,title2,account,id,password from ceo_user where title2='$username' and password='$password' and isshow=1";
  //echo $sql;
  //exit;
  $row = $db->query_first($sql);
  if($row)
   {
	 $_SESSION["utitle"]=$row["title"];
	 $_SESSION["uid"]=$row["id"];
	 redirect("member.php");
   }else{
     script("登入失敗,帳號或密碼不正確!");
   }
   $db->close();
 }else{
 script("帳號或密碼不能為空!");
 } 
?>
</body>
</html>