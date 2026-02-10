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
//$data["isshow"]=post("isshow");
$data["title"]=post("title",1);

$data["createtime"]=request_cd();
$data["ind"]=getMaxInd($table,"ind","");




  $db->query_insert($table,$data);
  
  $db->close();

  script("新增成功!","index.php?".$querystr);

?>
</body>
</html>
