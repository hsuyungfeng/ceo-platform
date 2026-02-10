<?php
include("_config.php");
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>回覆內容</title>
<script type="text/javascript" src="scripts/jquery-1.7.2.min.js"></script>
</head>

<body>
<FORM action="msg_save2.php" method="post" enctype="multipart/form-data" name="form" id="form">
<table>
<tr>
<td valign="top" class="text12"><textarea name="content2" cols="60" rows="5" id="content2"></textarea><input type="hidden" name="aid" value="<?php echo get("id");?>"></td>
</tr>
<tr>
<td width="134" align="center"><a href="#" onClick="$('#form').submit()" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image20','','images/member_msg_button01-1.jpg',1)"><img border="0" src="images/member_msg_button01.jpg" width="97" height="30" id="Image20"></a></td>
</tr>
</table>
</FORM>
</body>
</html>