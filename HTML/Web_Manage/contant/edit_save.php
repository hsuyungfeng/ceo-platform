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
$data["title"]=post("title",1);
$data["name"]=post("name",1);
$data["tel"]=post("tel",1);
$data["cel"]=post("cel",1);
$data["mail"]=post("mail",1);
$data["content"]=br(request_str("content"));
$data["content2"]=br(request_str("content2"));

  $sn=$db->query_update($table,$data,"id=$id");

$content="
Dear　".$data['name'].":<BR><BR>
<table width='500' border='1' cellpadding='0' cellspacing='0'>
			<tr>
			  <td width='80'>留言內容</td>
			  <td width='440'>".$data["content"]."</td>
			</tr>
			<tr>
			  <td width='60'>回覆內容</td>
			  <td width='440'>".$data["content2"]."</td>
			</tr>
			</table>
			<BR>
			CEO商品資訊網<BR>
			http://www.betterchoice.com.tw/
			";
sendmail($sys_email,"CEO商品資訊網",$data["mail"],'','CEO商品資訊網 - 回覆留言',$content);			  
  $db->close();
  script("修改完成!","edit.php?id=".$id."&".$querystr);

?>
</body>
</html>
