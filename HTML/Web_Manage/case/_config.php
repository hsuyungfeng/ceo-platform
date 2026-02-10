<?php
$inc_path="../../inc/";
$manage_path="../";
include('../_config.php');


$filepath=$admin_path_case;

$table="kingflyn_case";

$stype=get("stype",1);
$keyword=get("keyword",1);
$isshow=get("isshow",1);
$sdate=get("sdate",1);
$edate=get("edate",1);
$page=request_pag("page");
$querystr="keyword=$keyword&isshow=$isshow&stype=$stype&page=".$page;
$mtitle="<a href='index.php?".$querystr."'>藥品團購管理</a>";
?>