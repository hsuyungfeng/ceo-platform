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
$password1=post('password1',1);
$password2=post('password2',1);
$password3=post('password3',1);

//echo $password2;
//echo $password3;
if($password1!="" && $password2!="" && $password3!="" && $password2==$password3){
  $db = new Database($HS, $ID, $PW, $DB);
  $db->connect();
	
  $sql="select id,password from ceo_user where id='".$_SESSION["uid"]."' and password='$password1'";
  $row = $db->query_first($sql);
  if(!$row){script("舊密碼不正確！");}
  $sql3 = "UPDATE `ceo_user` SET  `password` =  ".$password3." WHERE  `ceo_user`.`password` =".$password1."";	
  //echo $sql3;
  //exit;
  mysql_query($sql3);
  script("密碼修改完成！","member_pas.php");
  
 }else{
 script("密碼前後不符！");
 } 
?>
</body>
</html>