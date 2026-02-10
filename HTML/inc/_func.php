<?php
//=============================================//
//輸入

#request GET及POST值

function request_pag($name="page"){
  $page = request_num($name);
  if ( $page == "" ){
    return 1;
  }
  else if ($page < 1){
    return 1;
  }
  else{
    return $page;
  }
}

function request_str($name)
{
  $value = request($name);
  //如果magie_qutes_gpc 為ON ，則恢復
  if (get_magic_quotes_gpc()) {
    $value=stripslashes($value);
  }
  return $value;
}

function request_num($name)
{
  $value = request($name);
  //如果magie_qutes_gpc 為ON ，則恢復
  if (get_magic_quotes_gpc()) {
    $value=stripslashes($value);
  }

  if(is_numeric($value)){
    return $value;
  }else{
    return "0";
  }
}

function request_ary($name)
{
  $data = request($name);
  if(gettype($data) == "array"){
    if (get_magic_quotes_gpc()) {
      $d = array();
      foreach($data as $key =>$value )
      {
        $v = stripslashes($value);
        $d[$key] = $v;
      }
      return $d;
    }else{
      return $data;
    }
  }else{
    return array();
  }
}

function request_ip()
{
  return $_SERVER["REMOTE_ADDR"];
}

function request_cd()
{
  return datetime();
}


function request_url()
{

  return "http://".dirname($_SERVER["HTTP_HOST"].$_SERVER["SCRIPT_NAME"])."/";
}

function request_weburl()
{

  return "http://".$_SERVER["HTTP_HOST"]."/";
}

function request_ref()
{
  return $_SERVER["http_referer"];
}

function request_date($name,$default="")
{
  $value=request($name);
  //如果magie_qutes_gpc 為ON ，則恢復
  if (get_magic_quotes_gpc()) {
    $value=stripslashes($value);
  }

  if(strlen($value)>=8){
    $dat=strtotime($value);
    if($dat){
      return $value;
    }else{
      return $default;
    }
  }else{
    return $default;
  }

}

function request($name)
{
  $value="";
  if(isset($_GET[$name])){
    $value = $_GET[$name];
  }
  else if(isset($_POST[$name])){
    $value = $_POST[$name];
  }else{
    $value = "";
  }
  return $value;
}
function get($str, $type=0)
{
  if (!isset($_GET[$str]))
  	return "";
  $gstr=trim($_GET[$str]);
  switch($type)
  {
    case 0:
	   return intval($gstr);
	 break;
	 case 1:
	 $gstr=htmlspecialchars($gstr);
	 if(!get_magic_quotes_gpc())
     {
      $gstr=addslashes($gstr);
     }
	 return $gstr;
	 break;
	case 3://float
		return floatval($gstr);
	 break;	 	 
  }
}
function post($str, $type=0)
{
  if (!isset($_POST[$str]))
  	return "";	
  $gstr=trim($_POST[$str]);
  switch($type)
  {
    case 0:
	 	return intval($gstr);
	 break;
	 case 1:
	 	$gstr=htmlspecialchars($gstr);
	 	if(!get_magic_quotes_gpc())
     	{
      	$gstr=addslashes($gstr);
     	}
	 return trim($gstr);
	 break;
	case 2://admin

	 if(!get_magic_quotes_gpc())
     {
      $gstr=addslashes($gstr);
     }
	 return trim($gstr);
	 break;
	case 3://float
		return floatval($gstr);
	 break;	 
  }
}
//=============================================//
//輸出
function hc($str)
{
  //輸出字串並將html字符編碼
  return htmlentities($str,ENT_QUOTES,"UTF-8");
}

function uc($str)
{
  //url字符編碼
  return urlencode($str);
}

function sc($str)
{
	$str=str_replace("\r","\\r",$str);
	$str=str_replace("\n","\\n",$str);
	$str=addslashes(str_replace("\"","''",$str));
  return $str;
}
function br($str){
	return preg_replace("/(\015\012)|(\015)|(\012)/","<br/>",$str);
}
function removebr($str){
	return preg_replace("/<br[[:space:]]*\/?[[:space:]]*>/","\015\012",$str);
}
function echoln($str){
  echo $str;
  echo "<br>";
}


function bugshow($str){
  echo $str;
  echo "<br>";
}

function bugout($str){
  die($str);
}

function tc_left($s,$c){
  if(mb_strlen($s) > $c){
    return left($s,$c)."…";
  }else{
    return $s;
  }
}
function GBsubstr($string, $start, $length) {
	$beginIndex=$start;
	if (strlen($string)<$start){
		return "";
	}
    if(strlen($string) < $length){
		
        return substr($string, $beginIndex);
    }
 
    $char = ord($string[$beginIndex + $length - 1]);
    if($char >= 224 && $char <= 239){
        $str = substr($string, $beginIndex, $length - 1)."...";
        return $str;
    }
 
    $char = ord($string[$beginIndex + $length - 2]);
    if($char >= 224 && $char <= 239){
        $str = substr($string, $beginIndex, $length - 2)."...";
        return $str;
    }
 
    return substr($string, $beginIndex, $length)."...";

}
//輸出table
//傳入陣列,TABLE STYLE,一列幾欄,輸出格式化後的table
function fillTable($ary,$style,$c){
	$iaryCount=count($ary);
	if ($iaryCount>0){
		$stemp="<table style='$style'>";
		for($i=0;$i<$iaryCount;$i++){
			if($i%$c==0){
				$stemp.=($i>0) ? "</tr><tr>" : "<tr>";
			}
			$stemp.='<td >'.$ary[$i].'</td>';
		}
		if ($i%$c>0){
			for ($j=0;$j<($i%$c);$j++){
				$stemp.='<td>&nbsp;</td>';
			}
			$stemp.='</tr>';
		}		

		$stemp.='</table>';
		return $stemp;
	}
	else{
		return "";
	}
}
//做unescape的處理
function phpUnescape($escstr)   
{   
    preg_match_all("/%u[0-9A-Za-z]{4}|%.{2}|[0-9a-zA-Z.+-_]+/", $escstr, $matches);   
    $ar = &$matches[0];   
    $c = "";   
    foreach($ar as $val)   
    {   
        if (substr($val, 0, 1) != "%")   
        {   
            $c .= $val;   
        } elseif (substr($val, 1, 1) != "u")   
        {   
            $x = hexdec(substr($val, 1, 2));   
            $c .= chr($x);   
        }    
        else  
        {   
            $val = intval(substr($val, 2), 16);   
            if ($val < 0x7F) // 0000-007F   
            {   
                $c .= chr($val);   
            } elseif ($val < 0x800) // 0080-0800   
            {   
                $c .= chr(0xC0 | ($val / 64));   
                $c .= chr(0x80 | ($val % 64));   
            }    
            else // 0800-FFFF   
            {   
                $c .= chr(0xE0 | (($val / 64) / 64));   
                $c .= chr(0x80 | (($val / 64) % 64));   
                $c .= chr(0x80 | ($val % 64));   
            }    
        }    
    }    
  
    return $c;   
} 

//=============================================//
//格式檢查

function chkUrl($str){
	if (substr($str,0,7)!='http://'){
		$str='http://'.$str;
	}
	return $str;
}

//=============================================//
//字串
function right($value, $count){
  return mb_substr($value, ($count*-1));
}

function left($string, $count){
  return mb_substr($string, 0, $count);
}


//=============================================//
//SQL




//=============================================//
//Session

#取得session
function session($name){
  if(isset($_SESSION[$name]) || !empty($_SESSION[$name])){
    return $_SESSION[$name];
  }else{
    return "";
  }
}
#取得session
function getSession($name){
  return session($name);
}

#設定session
function setSession($name,$value){
    $_SESSION[$name]=$value;
}

#清除session
function unSession($name){
  unset($_SESSION["$name"]);
}


//=============================================//
//cookie

#取得cookie
function cookie($name){
  if(isset($_COOKIE[$name]) || !empty($_COOKIE[$name])){
    return phpUnescape($_COOKIE[$name]);
  }else{
    return "";
  }
}
#取得cookie
function getCookie($name){
  return cookie($name);
}

#清除cookie
function unCookie($name){
  setcookie($name,"",time()-1800);
}
function saveCookieHour($name,$val,$h){
	$expire=time( )+$h*60*60;
	unCookie($name);
	setcookie($name,urlencode($val),$expire);
}

function saveCookie($name,$val){
	global $iCookMainExpireDay;
	$expire=time( )+$iCookMainExpireDay*24*60*60;
	unCookie($name);
	setcookie($name,urlencode($val),$expire);
}


//=============================================//
//日期時間
function   DateDiff($d1,$d2= "now"){ 
  if(is_string($d1))$d1=strtotime($d1); 
  if(is_string($d2))$d2=strtotime($d2); 
  return   ($d2-$d1)/86400; 
} 

function datetime($form="Y/m/d H:i:s",$value="now"){
  //Y/m/d H:i:s
  return date($form,strtotime($value));
}

function datetime_addMin($form="Y/m/d H:i:s",$value="now",$second=0){

  return datetime($form,$value." +{$second} minutes");
}
function datetime_addDay($form="Y/m/d H:i:s",$value="now",$second=0){

  return datetime($form,$value." +{$second} days");
}
function datetime_addMonth($form="Y/m/d H:i:s",$value="now",$second=0){

  return datetime($form,$value." +{$second} month");
}
//=============================================//
//分頁

function flip_page($page,$totalrows,$show_num=10,$num_page=10)
{
    if((int)$totalrows>0){
      $pagecount=ceil($totalrows/$show_num);
    }else{
      $pagecount=1;
      $totalrows=0;
    }

    if((int)$page<1){
      $page=1;
    }else if($page>$pagecount){
      $page=$pagecount;
    }

    $sno=(int)($num_page/2)-1;
    $eno=$sno*2+1;
    $sec_start = $page-$sno;
    if($sec_start <1){$sec_start = 1;}

    $sec_end = $sec_start + $eno;
    if ($sec_end > $pagecount){$sec_end = $pagecount;}

    $fpage=array();

    $fpage["page"]        =  $page;      //頁碼
    $fpage["pagecount"]  =  $pagecount;  //總頁數
    $fpage["sec_start"]  =  $sec_start;  //分頁起點
    $fpage["sec_end"]    =  $sec_end;    //分頁終點
    $fpage["rs_begin"]  = ($page-1) * $show_num; //mysql limit 分頁起點
    $fpage["show_num"]  = $show_num;  //每頁筆數

    return $fpage;

}






//=============================================//
//檔案
function filesize_check($file,$size=1000)
{
  //檔案大小測試
  if(isset($file))
  {
    if($file["size"]<= 1024 * $size)
    {
      return true;
    }
  }
  return false;

}

function filename_check($filename,$ext)
{
  if ($filename > '') {
     if (in_array(end(explode(".", strtolower($filename))), $ext)) {
      return true;
     }
   }
  return false;
}


function file_ext($file){
  //傳回副檔名
  $ext=explode('.',$file["name"]);
  $size=count($ext);
  return $ext[$size-1];
}


function file_open($file){
	//讀取檔案
	$handle = fopen($file, "r");
	$contents = fread($handle, filesize($file));
	fclose($handle);
	return $contents;
}




//JS輔助
function script($key,$url="")
{
 if($url!=""){
 echo "<script>alert('$key');window.location='$url'</script>";
 exit;
 }else{
 echo "<script>alert('$key');window.history.go(-1)</script>";
 exit;
 }
}
function redirect($url){
 echo "<script>window.location='$url'</script>";
 exit;
}



//資料驗證
$str_message="";
function isNull($str,$name,$min,$max){
	global $str_message;
	if (mb_strlen($str)>=$min && mb_strlen($str)<=$max){
		return true;
	}
	else{
		$str_message=$name.'必須大於'.$min.'個字元和小於'.$max.'字元';
		return false;
	}
}

function isNum($str,$name,$min,$max){
	global $str_message;
	if (!is_numeric($str)){
			$str_message=$name.'必須是整數型態';
			return false;		
	}
	else{
		if (intval($str)>=$min && intval($str)<=$max){
			return true;
		}
		else{
			$str_message=$name.'必須大於'.$min.'個字元和小於'.$max.'字元';
			return false;
		}
	}
}

function isEmail2($str,$name){
	global $str_message;
	$result=preg_match("/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/", $str); 
	if (!$result){
		$str_message=$name.'不是合法的Email格式';
	}
	return $result;
} 

function post_CURL($URL,$data){
	$result="";


	$ch = curl_init();
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);  
	curl_setopt($ch, CURLOPT_URL,$URL);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
	$result=curl_exec ($ch);
	curl_close ($ch);
	return $result;
	
}
?>