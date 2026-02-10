<?php

include("_config.php");
include($inc_path."_imgupload.php");
$id=post("cid");
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

$data["createtime"]=request_cd();
$data["aid"]=post("aid");
$data["uid"]="0";
$data["content"]=br(request_str("content2"));

  $db->query_insert($table,$data);  

  $db->close();
  script("回覆成功!","edit.php?id=".$id."&".$querystr);

?>
</body>
</html>
