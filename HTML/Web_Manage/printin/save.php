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
$data["createtime"]=request_cd();
$data["isshow"]=post("isshow");
$data["date_start"]=post("date_start",1);
$data["h_start"]=post("h_start",1);
$data["m_start"]=post("m_start",1);
$data["date_end"]=post("date_end",1);
$data["h_end"]=post("h_end",1);
$data["m_end"]=post("m_end",1);
$data["case_id"]=post("case_id");
$data["name"]=post("name",1);
$data["tel"]=post("tel",1);
$data["cel"]=post("cel",1);
$data["mail"]=post("mail",1);
$data["ordermail"]=post("ordermail");
$data["content"]=br(request_str("content"));
$data["ind"]=getMaxInd($table,"ind","");



  $db->query_insert($table,$data);
  
  $db->close();

  script("新增成功!","index.php?".$querystr);

?>
</body>
</html>
