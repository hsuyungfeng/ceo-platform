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
$table ="ceo_contact";
$db = new Database($HS, $ID, $PW, $DB);
$db->connect();
$data["createtime"]=request_cd();
$data["title"]=post("title",1);
$data["name"]=post("name",1);
$data["tel"]=post("tel",1);
$data["cel"]=post("cel",1);
$data["mail"]=post("mail",1);
$data["content"]=br(request_str("content"));


  $db->query_insert($table,$data);
  
  $db->close();

  script("留言成功!","contact.php");

?>
</body>
</html>
