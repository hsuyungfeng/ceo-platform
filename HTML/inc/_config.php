<?PHP
  ini_set('display_errors', 1);   # 0不顯示 1顯示
  error_reporting(E_ALL);         # report all errors
  date_default_timezone_set("Asia/Taipei");
  mb_internal_encoding("UTF-8");
  set_magic_quotes_runtime(0); //關閉
  ob_start();
  session_start();
  header("Content-type: text/html; charset=utf-8");
  $webname="一企實業有限公司";
  $copyright="";
  $description="";
  $keywords="";

 

  $weburl="http://www.betterchoice.com.tw/";

  /*Database*/

  $HS = "localhost";
  $ID = "betterchoice";
  $PW = "zAQ!2WSx";
  $DB = "betterchoice";


  /*SMTP Server*/
  $smtp_auth = false;
  $smtp_host = "127.0.0.1";
  $smtp_port = 25;
  $smtp_id   = "";
  $smtp_pw   = "";

  /*Upload path*/
  //底圖
  $path_backimg = "upload/backimg/";
  $admin_path_backimg = "../../upload/backimg/";
  
  //案件
  $path_case = "upload/case/";
  $admin_path_case = "../../upload/case/";
 

  
  /*縮圖尺寸*/
  $backimg_pic_w=1650; 
  $backimg_pic_h=1100;
  
  $case_pic_h=580;
  
  $case_pic2_w=190; //小圖
  $case_pic2_h=165;
  
  $data1_pic_w=190;//這個金翔租車
  $data1_pic_h=165;
  
  

  

  

  /*資料用ARY*/
  $aryYN=array('否','是');
  $aryYN2=array('審核中','審核通過');
  $aryYN3=array('處理中','暫停出貨','立即取貨','已出貨','取消訂單');


  /*Email*/
  $sys_email="service@betterchoice.com.tw";
  $sys_name="CEO商品資訊網";

  require_once($inc_path."_func.php");
  require_once($inc_path."_database.class.php");
  require_once($inc_path."_func_smtp.php");
  
  //運費設定
  $shipping = 150;
  $shipping_back = 5000;
  
  //目前價格
function ceo_range($pid,$total)
{
	global $HS, $ID, $PW, $DB;
	$value=0;
  $sql = "SELECT * FROM `ceo_range` WHERE pid=$pid and amount>=$total order by amount asc limit 1";
  //echo $sql;
  $db = new Database($HS, $ID, $PW, $DB);
	$db->connect();
	$row = $db->query_first($sql);
 if(!$row){
	$sql = "SELECT * FROM `ceo_range` WHERE pid=$pid and amount<=$total order by amount desc limit 1"; 
	$row = $db->query_first($sql);
 }
	$value=$row["price"];
	
  return $value;
}

  //即時購買價格
function ceo_range_top($pid,$total)
{
	global $HS, $ID, $PW, $DB;
	$value=0;
  $sql = "SELECT * FROM `ceo_range` WHERE pid=$pid order by amount asc limit 1";
  //echo $sql;
  $db = new Database($HS, $ID, $PW, $DB);
	$db->connect();
	$row = $db->query_first($sql);

	$value=$row["price"];
	
  return $value;
}
//獲利率
function ceo_profit($price,$nowprice)
{
	$value=0;
  $value = intval((($price-$nowprice)/$nowprice)*100);
  return $value;
}

//if(!empty($_SESSION["utitle"])){
//echo $_SESSION["utitle"]."您好;<a href=\"logout.php\">登出</a>";
//}
?>