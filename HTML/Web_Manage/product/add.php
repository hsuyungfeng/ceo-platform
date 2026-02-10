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
<script type="text/javascript" src="../../scripts/selectdate.js"></script>
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
<script src="../../scripts/public.js?" type="text/javascript"></script>
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
<script type="text/javascript">
function uniqueArray(a){
    temp = new Array();
    for(var i = 0; i < a.length; i ++){
        if(!contains(temp, a[i])){
            temp.length+=1;
            temp[temp.length-1] = a[i];
        }
    }
    return temp;
}
function contains(a, e){
    for(j=0;j<a.length;j++)if(a[j]==e)return true;
    return false;
}
</script>
<script type="text/javascript">

$(function(){
$("form").submit(function(){
var re=true;
err_msg='';
if(re){re=isnull("aid","大分類",0,1,30);}
if(re){re=isnull("bid","中分類",0,1,30);}
if(re){re=isnull("cid","小分類",0,1,30);}
if(re){re=isnull("title","商品材料",0,1,30);}
if(re){re=isnull("title2","商品名稱",0,1,30);}
if(re){re=isnull("title3","商品編碼",0,1,30);}
if(re){re=isnull("price","一般售價",0,1,30);}
if(re){re=isnull("capacity","容量",0,1,30);}
if(re){re=iscc("cc","團購價設定");}
//比對有無相同數量
		var amount_rang = new Array(),
			sort_rang = new Array();
		$('.cc').each(function(n){
			amount_rang[n] = $(this).val();
		});
		//先排序數量區間rang小到大，重覆的話刪除，直接比對數量判斷是否正常設定
		amount_rang.sort(function(a, b){ return a - b; });
		sort_rang = uniqueArray(amount_rang);
		sort_rang = $.unique(sort_rang);
		if( amount_rang.length != sort_rang.length ) {
			alert( '團過設定數量重複!!!' );
			return false;
		}
		//針對所有.ff的class按照.cc小到大排序，價格即為大到小
		var $ff = $('.ff').get();
		$ff.sort(function(a, b){
			var valA = $(a).find('.cc').val(),
				valB = $(b).find('.cc').val();
			return valA - valB;
		});
		//判斷價格是否未由大到小排序判斷金額是否設定正常
		var $dd = $($ff).find('.dd'), check = true;
		$dd.each(function(n){
			var $next = $dd.eq(n + 1);
			if( $next.length ){
				var nowVal = $(this).val(),
					nextVal = $next.val();
				if( nowVal <= nextVal ){
					check = false;
					return false;
				}
			}
		})
		if( !check ){
			alert('團購設定價格區間有誤!!!');
			return false;
		}
if(re){re=isnull("sorder","最小訂購量",0,1,30);}
if(re){re=isnull("scontent","成分含量(單位)",0,1,30);}
//if(re){re=isnull("endtime","效期",0,1,30);}
if(re){re=isnull("mid","廠商",0,1,30);}
if(re){re=isnull("timestart","開始時間",0,1,30);}
if(re){re=isnull("timeend","結束時間",0,1,30);}
//if(re){re=isnull("content","內文",0,1,999);}
	if (!re){
		alert(err_msg)
		
		return false;
		
	}
 return true;
});

});


$(function(){
 classarr=new Array();
<?php 
$nc=0;
$sql="select title,id,aid from ceo_product2 order by ind desc";
	$db = new Database($HS, $ID, $PW, $DB);
	$db->connect();
	$rows = $db->fetch_all_array($sql);

 	foreach($rows as $row){
?>
classarr[<?php echo $nc?>]=['<?php echo $row["aid"]?>','<?php echo $row["title"]?>','<?php echo $row["id"]?>'];
<?php 
$nc++;
}

?>

	$("#aid").change(function(){
	 var aid=$(this).val();
	 $("#bid").empty();
	 $("#bid").get(0).options.add(new Option("請選擇",""));
		 for(var i=0;i<classarr.length;i++){
		   if(aid==classarr[i][0]){
			$("#bid").get(0).options.add(new Option(classarr[i][1],classarr[i][2]));
		   }
		 }	
	})
})


$(function(){
 classarr2=new Array();
<?php 
$nc2=0;
$sql="select title,id,bid from ceo_product3 order by ind desc";
	$db = new Database($HS, $ID, $PW, $DB);
	$db->connect();
	$rows = $db->fetch_all_array($sql);

 	foreach($rows as $row){
?>
classarr2[<?php echo $nc2?>]=['<?php echo $row["bid"]?>','<?php echo $row["title"]?>','<?php echo $row["id"]?>'];
<?php 
$nc2++;
}

?>

	$("#bid").change(function(){
	 var bid2=$(this).val();
	 //alert(bid2);
	 $("#cid").empty();
	 $("#cid").get(0).options.add(new Option("請選擇",""));
		 for(var j=0;j<classarr2.length;j++){
		//alert(j);	 
		   if(bid2==classarr2[j][0]){
			$("#cid").get(0).options.add(new Option(classarr2[j][1],classarr2[j][2]));
		   }
		 }	
	})
})


$(function(){

$("#addrange").click(function() {
  $("#range").append("<span class='ff'>數量：<input type='text class='cc' name='amount[]' id='amount[]' />&nbsp;&nbsp;&nbsp;&nbsp;價格：<input type='text' class='dd' name='amount_price[]' id='amount_price[]' /></span><BR />"); 
});	

$("#delrange").click(function() {
  $("#range").find('.ff:last').empty().remove(); 
});	

})
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
<table width="800" border="0" cellpadding="0" cellspacing="3">
  <tr>
    <td valign="top"><h4 class="input-text-title">是否促銷</h4></td>
    <td><label>
      <input type="checkbox" name="promo" id="promo" value="1"/>
      促銷
    </label></td>
  </tr>
  <tr>
    <td valign="top"><h4 class="input-text-title">*商品大分類</h4></td>
    <td><select name="aid" id="aid">
       	<option value="">請選擇</option>
        <?php
		$db = new Database($HS, $ID, $PW, $DB);
		$db->connect();
		$sql="select id, title from ceo_product1";
		$rows = $db->fetch_all_array($sql);
		foreach($rows as $row)
		{
		?>
			<option value="<?php echo $row["id"] ?>"><?php echo $row["title"] ?></option>
        <?php	
		}
		$db->close();
		?>
      </select></td>
  </tr>
  <tr>
    <td valign="top"><h4 class="input-text-title">*商品中分類</h4></td>
    <td><select name="bid" id="bid">
       	
      </select></td>
  </tr>
  <tr>
    <td valign="top"><h4 class="input-text-title">*商品小分類</h4></td>
    <td><select name="cid" id="cid">
       	
      </select></td>
  </tr>
  <tr>
    <td valign="top"><h4 class="input-text-title">*商品材料</h4></td>
    <td><label>
      <input type="text" name="title" id="title" />
    </label></td>
  </tr>
  <tr>
    <td valign="top"><h4 class="input-text-title">*商品名稱</h4></td>
    <td><label>
      <input type="text" name="title2" id="title2" />
    </label></td>
  </tr>
  <tr>
    <td valign="top"><h4 class="input-text-title">*商品編號<h4></td>
    <td><label>
      <input type="text" name="title3" id="title3" />
    </label></td>
  </tr>
  
  <tr>
    <td valign="top"><h4 class="input-text-title">*一般售價</h4></td>
    <td><label>
      <input type="text" name="price" id="price" />
    </label></td>
  </tr>
  
  <tr style="display: none;">
    <td valign="top"><h4 class="input-text-title">*容量</h4></td>
    <td><label>
      <input type="text" name="capacity" id="capacity" value="1" />
    </label></td>
  </tr>
  
  <tr>
    <td valign="top"><h4 class="input-text-title">*團購價設定</h4>&nbsp;&nbsp;&nbsp;</td>
    <td>
    <div id="range">
    <span class='ff'>
      數量：<input class="cc" type="text" name="amount[]" id="amount[]" />
      &nbsp;&nbsp;&nbsp;價格：<input type="text" class="dd" name="amount_price[]" id="amount_price[]" />
      &nbsp;&nbsp;&nbsp;</span><BR />
      </div>
      <a href="#" id="addrange">新增</a>&nbsp;&nbsp;&nbsp;<a href="#" id="delrange">刪除</a>
      </td>
  </tr>
  
  <tr>
    <td valign="top"><h4 class="input-text-title">*最小訂購量</h4></td>
    <td><label>
      <input type="text" name="sorder" id="sorder" />
    </label></td>
  </tr>
  
  <tr>
    <td valign="top"><h4 class="input-text-title">*單位</h4></td>
    <td><label>
      <input type="text" name="scontent2" id="scontent2" />
    </label></td>
  </tr>
  
  <tr>
    <td valign="top"><h4 class="input-text-title">*尺寸</h4></td>
    <td><label>
      <input type="text" name="scontent" id="scontent" />
    </label></td>
  </tr>
  
  <tr style="display: none;">
    <td valign="top"><h4 class="input-text-title">效期</h4></td>
    <td><label>
      <input type="text" name="endtime" id="endtime" onfocus="HS_setDate(this)" />
    </label></td>
  </tr>
  <tr style="display: none;">
    <td valign="top"><h4 class="input-text-title">*廠商</h4></td>
    <td><select name="mid" id="mid">
       	<option value="">請選擇</option>
        <?php
		$db = new Database($HS, $ID, $PW, $DB);
		$db->connect();
		$sql="select id, title from ceo_firm";
		$rows = $db->fetch_all_array($sql);
		foreach($rows as $row)
		{
		?>
			<option value="<?php echo $row["id"] ?>" selected><?php echo $row["title"] ?></option>
        <?php	
		}
		$db->close();
		?>
      </select></td>
  </tr>
  
  <tr style="display: none;">
    <td valign="top"><h4 class="input-text-title">供應商</h4></td>
    <td><label>
      <input name="sid" type="text" id="sid"/>
    </label></td>
  </tr>
  
  <tr>
    <td valign="top"><h4 class="input-text-title">*開始時間</h4></td>
    <td><label>
      <input type="text" name="timestart" id="timestart" onfocus="HS_setDate(this)" />
    </label>
      <label for="h_start"></label>
      <select name="h_start" id="h_start">
        <? for($i=0;$i<24;$i++){ ?>
                <option value="<?=$i?>"><? echo ($i<10)? "0":""; ?><?=$i?></option>
			  <? } ?>
      </select>	點</td>
  </tr>
  
  <tr>
    <td valign="top"><h4 class="input-text-title">*結束時間</h4></td>
    <td><label>
      <input type="text" name="timeend" id="timeend" onfocus="HS_setDate(this)" />
    </label>
    <label for="h_end"></label>
      <select name="h_end" id="h_end">
      <? for($i=0;$i<24;$i++){ ?>
                <option value="<?=$i?>"><? echo ($i<10)? "0":""; ?><?=$i?></option>
			  <? } ?>
      </select>	點</td>
  </tr>

    <tr>
    <td width="122" valign="top"><h4 class="input-text-title">*圖片</h4></td>
    <td width="669"><p>
      <input type="file" name="pic" id="pic" />
      </td>
    </tr>
    <tr>
    <td valign="top"><h4 class="input-text-title">備註</h4></td>
    <td>
      <label for="content"></label>
      <textarea name="content" id="content" cols="80" rows="20"></textarea></td>
  </tr>
    <tr>
    <td></td>
   <td height="30"><input name="savenews" type="submit" id="savenews" value=" 送 出 " />
	&nbsp;&nbsp;&nbsp;<input name="" type="reset" value=" 重 設 " /></td>
  </tr>
</table>
</FORM>
</div>
</div>
</div>
</div>
</body>
</html>
