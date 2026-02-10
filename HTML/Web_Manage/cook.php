<?
$sid=session_id();
if(!isset($_SESSION["admin"]) || !isset($_SESSION["userid"]))
 {
      echo "<script type='text/javascript'>window.open('".$manage_path."login.html','_top');</script>";
      exit;  
 }
?>