<?php
session_start();
unset($_SESSION['utitle']);
unset($_SESSION['uid']);
session_destroy();
echo "<script>window.open('member_login.php','_parent');</script>";
?>

