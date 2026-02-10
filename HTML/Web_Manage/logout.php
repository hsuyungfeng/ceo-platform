<?php
session_start();
unset($_SESSION['admin']);
unset($_SESSION['uid']);
session_destroy();
echo "<script>window.open('login.html','_parent');</script>";
?>

