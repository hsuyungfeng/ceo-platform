<?
function getsql($sql,$page_size,$page_querystring){
  global $page,$sql,$count,$page_count,$pre,$next,$querystring,$HS,$ID,$PW,$DB,$db; 
  $querystring=clearPageStr($page_querystring);
  
  
  
  $page = isset($_GET['page'])?intval($_GET['page']):1;

  $result = $db->query($sql); 
  $count = $db->affected_rows;

  $page_count = ceil($count/$page_size); 
    if ($page>$page_count){
      $page=$page_count; 
     }
     if ($page<=0){
         $page=1;                  
     } 
  $start = ($page-1)*$page_size;  


	 
     $pre = $page-1; 
     $next = $page+1; 
     $first = 1;  
     $last = $page_count; 
     $sql .= " limit $start,$page_size"; 
	 return $count;
 }

function  pagesql()
{
 global $sql;
 return $sql;
}
function showpage(){
  global $page,$page_count,$count,$pre,$next,$querystring;
  if($querystring!="")
  {
    $querystring=$querystring."&";
  }
  echo $page.' / '.$page_count.'&nbsp;&nbsp;共'.$count.'筆資料&nbsp;&nbsp;
  '; 
    if($page !=1){
       echo  '<a href=?'.$querystring.'page=1>首頁</a>&nbsp;&nbsp;
           <a href=?'.$querystring.'page='.$pre.'>上一頁</a>&nbsp;&nbsp;';    
      }
	  $viewpage=5;
	  
      if($page_count > $viewpage){
	   if($page-$viewpage<0)
	   {
	   $s=1;$j = $viewpage;
	   }
       else{
	   $s=$page-$viewpage+1;
	   $j=$s+5;
	   if($j>=$page_count)
	   {
	   $j = $page_count;
	   }
	   
       //$j = $page_count;
      }

  }else
  {
      $s=1;
      $j=$page_count;
  }
      for($i=$s;$i<=$j;$i++){
        $num = $i;
        if($page == $num){
         echo  $num."&nbsp;";
        }else{
         echo  '<a href=?'.$querystring.'page='.$num.'>'.$num.'</a>&nbsp;&nbsp;';
        }
      }

	
      if($page<$page_count)
    {
      echo '<a href=?'.$querystring.'page='.($page+1).'>下一頁</a>&nbsp;&nbsp;';
      echo  '<a href=?'.$querystring.'page='.$page_count.'>末頁</a>&nbsp;';
    }
 }
 
 
 function showpage2(){
  global $page,$page_count,$count,$pre,$next,$querystring;
  
  
  if($querystring!="")
  {
    $querystring=$querystring."&";
  }

    if($page !=1){
	   echo '<div id="preButton" class="pageButton"><a href=?'.$querystring.'page=1>←</a>&nbsp;&nbsp;<a href=?'.$querystring.'page='.$pre.'>Pre</a></div>'; 
    }
	else{
		echo '<div id="preButton" class="pageButton">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>';
	}
	  $viewpage=5;
	  
      if($page_count > $viewpage){
	   if($page-$viewpage<0)
	   {
	   $s=1;$j = $viewpage;
	   }
       else{
	   $s=$page-$viewpage+1;
	   $j=$s+5;
	   if($j>=$page_count)
	   {
	   $j = $page_count;
	   }
	   
       //$j = $page_count;
      }

  }else
  {
      $s=1;
      $j=$page_count;
  }
      for($i=$s;$i<=$j;$i++){
        $num = $i;
        if($page == $num){
		 echo '<div id="numberButton" class="pageButton">'.$num.'</div>';
        }else{
		  echo '<div id="numberButton" class="pageButton"><a href=?'.$querystring.'page='.$num.'>'.$num.'</a></div>';
        }
      }

	
      if($page<$page_count)
    {
	  echo '<div id="nextButton" class="pageButton"><a href=?'.$querystring.'page='.($page+1).'>Next</a>&nbsp;&nbsp;<a href=?'.$querystring.'page='.$page_count.'>→</a></div>  ';
    }
 }

function showpage3(){
  global $page,$page_count,$count,$pre,$next,$querystring;
  if($querystring!="")
  {
    $querystring=$querystring."&";
  }
  //echo $page.' / '.$page_count.'&nbsp;&nbsp;共'.$count.'筆資料&nbsp;&nbsp;'; 
    if($page !=1){
       echo  '<a href=?'.$querystring.'page=1>首頁</a>&nbsp;&nbsp;
           <a href=?'.$querystring.'page='.$pre.'>上一頁</a>&nbsp;&nbsp;';    
      }
	  $viewpage=5;
	  
      if($page_count > $viewpage){
	   if($page-$viewpage<0)
	   {
	   $s=1;$j = $viewpage;
	   }
       else{
	   $s=$page-$viewpage+1;
	   $j=$s+5;
	   if($j>=$page_count)
	   {
	   $j = $page_count;
	   }
	   
       //$j = $page_count;
      }

  }else
  {
      $s=1;
      $j=$page_count;
  }
      for($i=$s;$i<=$j;$i++){
        $num = $i;
        if($page == $num){
         echo  $num."&nbsp;";
        }else{
         echo  '<a href=?'.$querystring.'page='.$num.'>'.$num.'</a>&nbsp;&nbsp;';
        }
      }

	
      if($page<$page_count)
    {
      echo '<a href=?'.$querystring.'page='.($page+1).'>下一頁</a>&nbsp;&nbsp;';
      echo  '<a href=?'.$querystring.'page='.$page_count.'>末頁</a>&nbsp;';
    }
 } 
 
 function clearPageStr($querystring){
	
	$pageind=strpos($querystring,'&page=');
	if ($pageind!==false){
		
		$pageind2=strpos(substr($querystring,$pageind+6),'&');
		$querystring_=substr($querystring,0,$pageind);
		
		if ($pageind2!==false){
			$querystring_.=substr($querystring,$pageind+6+$pageind2);
		}
	}
	else{
		$querystring_=$querystring;
	}
	return $querystring_;
}
 
?>
