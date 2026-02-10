<?php
include("_config.php");
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Untitled Document</title>
<!--<link href="admin_style.css" rel="stylesheet" type="text/css" />-->
<link href="../css/admin_style_gray.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="../../scripts/jquery-1.6.1rc1.min.js"></script>
<script type="text/javascript">
$(document).ready(function(){
	
	$(".accordion .tableheader:first").addClass("active");
	$(".accordion .tableheader").toggle(function(){
		$(this).next().slideDown("fast");
	},function(){
	   $(this).next().slideUp("fast");
	   $(this).siblings("tableheader").removeClass("active");

	});
 
});
$(document).ready(function(){
 
	$(".btn-slide").click(function(){
		$("#panel").slideToggle("slow");
		$(this).toggleClass("active"); return false;
	});
	
	 
});

</script>
<script type="text/javascript" src="../../scripts/selectdate.js"></script>
<script src="../../scripts/public.js?" type="text/javascript"></script>
<script type="text/javascript">
$(function(){
$("form").submit(function(){
var re=true;
err_msg='';
//if(re){re=isselect("class","案件類別");}
if(re){re=isnull("date_start","取車日期",0,1,30);}
if(re){re=isnull("h_start","取車時間",0,1,30);}
if(re){re=isnull("m_start","取車時間",0,1,30);}
if(re){re=isnull("date_end","還車日期",0,1,30);}
if(re){re=isnull("h_end","還車時間",0,1,30);}
if(re){re=isnull("m_end","還車時間",0,1,30);}
if(re){re=isnull("case_id","預約車型",0,1,30);}
if(re){re=isnull("name","預約人姓名",0,1,30);}
if(re){re=isnull("tel","聯絡電話",0,1,30);}
if(re){re=isnull("cel","行動電話",0,1,30);}
if(re){re=isnull("mail","電子郵件",0,1,30);}
	if (!re){
		alert(err_msg)
		
		return false;
		
	}
 return true;
});

});
</script>
</head>

<body>
<div id="mgbody-content">

 
        <div id="adminlist">
		<h2> <img src="../images/admintitle.png" />&nbsp;&nbsp;<?php echo $mtitle?> >&nbsp;&nbsp;新增</h2>
  <div class="accordion ">
  
	<div class="tableheader">
	<div class="handlediv"></div>
	<p align="left">新增案件</p>	
	</div>
	<div class="listshow">	
	  <FORM action="save.php?<?php echo $querystr ?>" method="post" enctype="multipart/form-data" name="form" id="form">
	    <table width="871" border="0" cellpadding="0" cellspacing="3">
          <tr>
            <td width="112" valign="top"><h4 class="input-text-title">是否顯示</h4></td>
            <td colspan="6"><label>
              <input type="checkbox" name="isshow" id="isshow" checked value="1" />
              顯示 </label></td>
          </tr>
		  
		  <tr>
            <td valign="top"><h4 class="input-text-title">取車日期</h4></td>
            <td width="172"><label>
              <input type="text" name="date_start" id="date_start" onfocus="HS_setDate(this)" />
            </label></td>
            <td width="111"><h4 class="input-text-title">取車時間</h4></td>
            <td width="50">
              <select name="h_start" id="h_start">
			  <option value="">請選擇</option>
			  <? for($i=0;$i<24;$i++){ ?>
                <option value="<?=$i?>"><? echo ($i<10)? "0":""; ?><?=$i?></option>
			  <? } ?>
              </select>
              </td>
		    <td width="38" align="left">時</td>
		    <td width="50"><select name="m_start" id="m_start">
			<option value="">請選擇</option>
              <? for($i=0;$i<60;$i++){ ?>
              <option value="<?=$i?>"><? echo ($i<10)? "0":""; ?><?=$i?></option>
              <? } ?>
            </select></td>
		    <td width="321" align="left">分</td>
		  </tr>
		  
		  
		  <tr>
            <td valign="top"><h4 class="input-text-title">還車日期</h4></td>
            <td><label>
              <input type="text" name="date_end" id="date_end" onfocus="HS_setDate(this)" />
            </label></td>
            <td><h4 class="input-text-title">還車時間</h4></td>
            <td><select name="h_end" id="h_end">
			<option value="">請選擇</option>
              <? for($i=0;$i<24;$i++){ ?>
                <option value="<?=$i?>"><? echo ($i<10)? "0":""; ?><?=$i?></option>
			  <? } ?>
            </select></td>
		    <td align="left">時</td>
		    <td><select name="m_end" id="m_end">
			<option value="">請選擇</option>
              <? for($i=0;$i<60;$i++){ ?>
              <option value="<?=$i?>"><? echo ($i<10)? "0":""; ?><?=$i?></option>
              <? } ?>
            </select></td>
		    <td align="left">分</td>
		  </tr>
		  
          <tr>
            <td valign="top"><h4 class="input-text-title">預約車型</h4></td>
            <td colspan="6">
			<select name="case_id" id="case_id">
       	<option value="">請選擇</option>
        <?php
		$db = new Database($HS, $ID, $PW, $DB);
		$db->connect();
		$sql="select id, title from kingflyn_case";
		$rows = $db->fetch_all_array($sql);
		foreach($rows as $row)
		{
		?>
			<option value="<?php echo $row["id"] ?>"><?php echo $row["title"] ?></option>
        <?php	
		}
		$db->close();
		?>
      </select>			</td>
          </tr>
          <tr>
            <td valign="top"><h4 class="input-text-title">*預約人姓名</h4></td>
            <td colspan="6"><label>
              <input type="text" name="name" id="name" />
            </label></td>
          </tr>
        
          <tr>
            <td valign="top"><h4 class="input-text-title">*聯絡電話</h4></td>
            <td colspan="6"><label>
              <input type="text" name="tel" id="tel" />
            </label></td>
          </tr>
          <tr>
            <td valign="top"><h4 class="input-text-title">*行動電話</h4></td>
            <td colspan="6"><label>
              <input type="text" name="cel" id="cel" />
            </label></td>
          </tr>
          <tr>
            <td valign="top"><h4 class="input-text-title">*電子信箱</h4></td>
            <td><label>
              <input type="text" name="mail" id="mail" />
            </label></td>
            <td><h4 class="input-text-title">訂閱優惠通知</h4></td>
            <td colspan="4"><input type="checkbox" name="ordermail" id="ordermail" value="1" /></td>
            </tr>
         
          <tr>
            <td valign="top"><h4 class="input-text-title">留言內容</h4></td>
            <td colspan="6"><label for="content"></label>
                <textarea name="content" id="content" cols="80" rows="20"></textarea></td>
          </tr>
          <tr>
            <td></td>
            <td height="30" colspan="6"><input name="savenews" type="submit" id="savenews" value=" 送 出 " />
              &nbsp;&nbsp;&nbsp;
              <input name="Input" type="reset" value=" 重 設 " /></td>
          </tr>
        </table>
	  </FORM>
</div>
</div>
</div>
</div>
</body>
</html>
