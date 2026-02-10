<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Untitled Document</title>
<link href="css/admin_style_gray.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="../scripts/jquery-1.6.1rc1.min.js"></script>
<script type="text/javascript">
$(function(){
        $(".mg-menu-toggle").toggle(function(){
		$(this).parent().parent().find("li").slideDown("fast");
	  },function(){
		$(this).parent().parent().find("li").slideUp("fast");
	  });
$("ul li").hide();
 $(".menu-top").find("a").click(function(){
  $(".menutitle-on").removeClass("menutitle-on");
  $(".menu-open").removeClass().addClass("menu-close");
  $(this).parent().parent().removeClass().addClass("menu-open");
  $(this).parent().parent().find("li").slideDown("fast");
 });
 
 $("#adminmenu li a").click(function(){
 $(".menutitle-on").removeClass("menutitle-on");
 $(".menu-open").removeClass().addClass("menu-close");
 $(this).parent().parent().removeClass().addClass("menu-open");
   $("#adminmenu li").removeClass();
   $(this).parent().addClass("current");
 });
});

</script>
</head>

<body>
<div id="adminmenu">
	<div id="adminmenu_title"  class="menutitle-on"><img src="images/menutitle.png" />&nbsp;&nbsp;功能列表</div>
	
    <ul>
      <div class="clear"></div>
	</ul>
    
    <ul>
      <div class="clear"></div>
	</ul>
    
    <ul>
	<div class="menu-close">
    
    <div class="menu-top"> <div class="mg-menu-toggle"><br /></div><span>團購建立</span> </div>
    <li><a href="product1/index.php" target="main" onFocus="this.blur()"><span>團購大分類</span></a></li>
    <li><a href="product2/index.php" target="main" onFocus="this.blur()"><span>團購中分類</span></a></li>
    <li><a href="product3/index.php" target="main" onFocus="this.blur()"><span>團購小分類</span></a></li>
	<li><a href="product/index.php" target="main" onFocus="this.blur()"><span>團購內容</span></a></li> 
    
	</div>
    
    
	<div class="menu-close">
	<div class="menu-top"><div class="mg-menu-toggle"><br /></div>
	<span>廠商管理</span></div>
	<li><a href="firm/index.php" target="main" onFocus="this.blur()"><span>廠商列表</span></a></li> 
	</div>
    <div class="menu-close">
	<div class="menu-top"><div class="mg-menu-toggle"><br /></div>
	<span>會員管理</span></div>
	<li><a href="user/index.php" target="main" onFocus="this.blur()"><span>會員列表</span></a></li> 
    <li><a href="usercontant/index.php" target="main" onFocus="this.blur()"><span>會員留言</span></a></li>
	</div>
    
    <div class="menu-close">
	<div class="menu-top"><div class="mg-menu-toggle"><br /></div>
	<span>訂單管理</span></div>
	<li><a href="order/index.php" target="main" onFocus="this.blur()"><span>訂單列表</span></a></li>
    <li><a href="order/index.php?isshow=-1" target="main" onFocus="this.blur()"><span>進行中訂單</span></a></li>
    <li><a href="order/index.php?isshow=0" target="main" onFocus="this.blur()"><span>處理中訂單</span></a></li>
    <li><a href="order/index.php?isshow=1" target="main" onFocus="this.blur()"><span>暫停出貨訂單</span></a></li>
    <li><a href="order/index.php?isshow=2" target="main" onFocus="this.blur()"><span>立即取貨訂單</span></a></li>
    <li><a href="order/index.php?isshow=3" target="main" onFocus="this.blur()"><span>已出貨訂單</span></a></li>
    <li><a href="order/index.php?isshow=4" target="main" onFocus="this.blur()"><span>取消訂單</span></a></li>
    <li><a href="printin/index.php" target="main" onFocus="this.blur()"><span>列印進貨單</span></a></li>
    <li><a href="printout/index.php" target="main" onFocus="this.blur()"><span>列印出貨單</span></a></li>
    <li><a href="addbonus/index.php" target="main" onFocus="this.blur()"><span>產生購物金</span></a></li>
	</div>
    
    <div class="menu-close">
	<div class="menu-top"><div class="mg-menu-toggle"><br /></div>
	<span>聯絡我們</span></div>
	<li><a href="contant/index.php" target="main" onFocus="this.blur()"><span>聯絡我們</span></a></li> 
	</div>
	<div class="clear"></div>
	</ul>

	<ul>
	<div class="menu-close">
	<div class="menu-top "> <div class="mg-menu-toggle"><br /></div><span>管理員設置</span></div>
	<li><a href="logout.php" target="main" onFocus="this.blur()"><span>退出系統</span></a></li>

	</div>
	<div class="clear"></div>
	</ul>
	
	</div>
</body>
</html>
