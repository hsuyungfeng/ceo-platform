<?php
$inc_path="../../inc/";
$manage_path="../";
include $inc_path."_config.php";


$filepath=$admin_path_case;

$table="ceo_order";

$stype=get("stype",1);
$stype2=get("stype2",1);
$keyword=get("keyword",1);
$isshow=get("isshow",1);
$sdate=get("sdate",1);
$edate=get("edate",1);
$page=request_pag("page");
$querystr="keyword=$keyword&isshow=$isshow&stype=$stype&page=".$page;
$mtitle="<a href='index.php?".$querystr."'>產生購物金</a>";
?>