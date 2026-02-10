<?
if(!isset($_SESSION["utitle"]) || !isset($_SESSION["uid"]))
 {
      echo "<script type='text/javascript'>window.open('".$go."','_top');</script>";
      exit;  
 }
?>