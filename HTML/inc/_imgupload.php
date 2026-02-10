<?php
//圖片檔案上傳相關處理模組v2.0
//版本2006/6/19
//editor by cully
//update 2010/04/09 增加縮圖$key 7 8 9 根據長寬 bycully
//增加縮圖名稱參數 file_sname;
class imgUploder
{
	var $file_max;
	var $file_dir;
	var $user_msg;
	var $log_msg;
	var $overwrite;	
	var $fstyle;
	var $oldimg;
	var $fileex;
	var $smallimg;
	function imgUploder($Ufile)
	{
		$this->file=$Ufile['tmp_name'];
		$this->file_name=$Ufile['name'];
		$this->file_sname="";
		$this->file_size=$Ufile['size'];
		$this->file_type=$Ufile['type'];	
		if($this->file_name!=""){
			$r=explode('.',$this->file_name);
			$this->fileex=$r[1];	
		}
		
	}

	function set($name,$value)
	{
		$this->$name=$value;
	}
	function get($name)
	{
		return $this->$name;
	}
	
	function chk_FileSize()
	{
		if ($this->file_max < $this->file_size){
			$this->user_msg=$this->user_msg."上傳的檔案大小超過限制,圖片未成功儲存\\r\\n";
		}
		
	}

	function chk_FileDir()
	{
		if (!is_dir($this->file_dir)){
			if (!mkdir($this->file_dir,0777)){
				$this->user_msg=$this->user_msg."建立使用者目錄錯誤\\r\\n";
			}
		}
	}
	function chk_Style()
	{
		$r=substr($this->file_type,0,5);
		if ($this->fstyle=="image"){
			if ($r!=$this->fstyle ){
				$this->user_msg=$this->user_msg."此檔案不是圖片格式\\r\\n";	
			}
		}
	if ($this->fstyle=="flash"){
			if ($this->file_type!="application/x-shockwave-flash"){
				$this->user_msg=$this->user_msg."此檔案不是flash格式\\r\\n";	
			}
		}	
		
		$r=explode("\.","$this->file_name");
		if ($this->fstyle=="rar"){
			if ($r[1]!="rar" && $r[1]!="zip"){
				print_r ($r);
				$this->user_msg=$this->user_msg."此檔案不是壓縮檔\\r\\n";	
			}
		}	
		if ($this->fstyle=="customer"){
			if ($r[1]!="rar" && $r[1]!="zip" && $r[1]!="jpg" && $r[1]!="jpeg" && $r[1]!="doc" && $r[1]!="docx" && $r[1]!="xls" && $r[1]!="xlsx" && $r[1]!="pdf"){
				print_r ($r);
				$this->user_msg=$this->user_msg."檔案只支援rar,zip,jpg,pdf,doc,docx,xls,xlsx等格式\\r\\n";	
			}
		}			
		if ($this->fstyle=="css"){
			if ($r[1]!="css" && $r[1]!="CSS"){
				$this->user_msg=$this->user_msg."此檔案不是css檔案\\r\\n";	
			}
		}			
		
	}	
	function chk_File()
	{
		if (file_exists($this->file_dir.$this->file_name) ) {
			if ($this->overwrite=="1"){
				$this->user_msg=$this->user_msg."檔案名稱重覆\\r\\n";
			}
			if ($this->overwrite=="0")
			{
				$this->file_name="2".$this->file_name;
			}
			if ($this->overwrite=="3")
			{
				$this->file_name=$this->file_name;
			}			
		}	
	}
	function chk_Copy()
	{

		if (!move_uploaded_file($this->file,$this->file_dir.$this->file_name)) {
			echo $this->file.'='.$this->file_dir.$this->file_name;
			$this->user_msg=$this->user_msg."檔案移動失敗!\\r\\n";
		}
	}			

	function fromSource(){
		if ($this->file_type=="image/gif"){
			$source=imagecreatefromgif($this->file_dir.$this->file_name);
		}
		else if ($this->file_type=="image/png"){
			$source=imagecreatefrompng($this->file_dir.$this->file_name);
			
		}
		else{
			$source=imagecreatefromjpeg($this->file_dir.$this->file_name);
		}	
		return $source;
	}

	function createImg($target){
		if ($this->file_type=="image/gif"){
				if (!imagegif($target,$this->file_dir.$this->file_sname.$this->file_name,9)){
				$this->user_msg=$this->user_msg."縮圖建立失敗!\\r\\n";
			}		
		}	
		else if ($this->file_type=="image/x-png"){
				if (!imagepng($target,$this->file_dir.$this->file_sname.$this->file_name,9)){
				$this->user_msg=$this->user_msg."縮圖建立失敗!\\r\\n";
			}		
		}
		else{
				if (!imagejpeg($target,$this->file_dir.$this->file_sname.$this->file_name,100)){
				$this->user_msg=$this->user_msg."縮圖建立失敗!\\r\\n";
			}		
		}	
	}

	function createSmailImg($w,$h,$key){ //建立小圖function
		$size=getimagesize($this->file_dir.$this->file_name);
		
//		if ($size[2]==1) //判斷是否為gif
//		{
//			$this->user_msg=$this->user_msg."縮圖不支援gif!\\r\\n";
//		}
//		else 
//		{	
			
			if ($key==7){ // 依寬度等比縮小
				$x=0;
				$y=0;
				if ($size[0]<$w){
					$w2=$size[0];
					$h2=$size[1];
				}
				else{
					$w2=$w;
					$h2=($w/$size[0])*$size[1];
				}
				$source=$this->fromSource();
				$target=imagecreatetruecolor($w2,$h2);
				$background_color=ImageColorAllocate($target,255,255,255);
				imagefill($target,0, 0,$background_color);	
				imagecopyresized($target,$source,0,0,$x,$y,$w2,$h2,$size[0],$size[1]);
			}
			else if ($key==8){  // 依高度等比縮小
				$x=0;
				$y=0;
				if ($size[1]<$h){
					$w2=$size[0];
					$h2=$size[1];
				}
				else{
					$h2=$h;
					$w2=($h/$size[1])*$size[0];
				}
				$source=$this->fromSource();
				$target=imagecreatetruecolor($w2,$h2);
				$background_color=ImageColorAllocate($target,255,255,255);
				imagefill($target,0, 0,$background_color);	
				imagecopyresized($target,$source,0,0,$x,$y,$w2,$h2,$size[0],$size[1]);			
		
			}
			else if ($key==9){ //如果高>寬則依高等比例縮小,反之
				$x=0;
				$y=0;
				if ($size[0]<$w && $size[1]<$h){ //如果寬高都比指定大小小..則不縮圖
					$w2=$size[0];
					$h2=$size[1];
					$w=$size[0];
					$h=$size[1];
				}
				else if ($size[0]/$w>$size[1]/$h){ //如果寬比例>高比例,依寬度等比縮小

					if ($size[0]<$w){
						$w2=$size[0];
						$h2=$size[1];
					}
					else{
						$w2=$w;
						$h2=($w/$size[0])*$size[1];
					}
				}
				else{
					
					if ($size[1]<$h){
						$w2=$size[0];
						$h2=$size[1];
					}
					else{
						$h2=$h;
						$w2=($h/$size[1])*$size[0];
						
					}	
				}
				$source=$this->fromSource();
				$target=imagecreatetruecolor($w2,$h2);
				$background_color=ImageColorAllocate($target,255,255,255);
				imagefill($target,0, 0,$background_color);	
				imagecopyresized($target,$source,0,0,$x,$y,$w2,$h2,$size[0],$size[1]);	

			}
			else{ //其它有指定大小
			
				$source=$this->fromSource();
				$target=imagecreatetruecolor($w,$h);
				$background_color=ImageColorAllocate($target,255,255,255);
				imagefill($target,0, 0,$background_color);			
				if ($size[0]<$w && $size[1]<$h){ // 如圖原始圖檔比縮圖size小,就不截圖
					$key=0;
				}
				if ($key==1){ //取中間1/3
					$w2=floor($size[0]/3);
					$h2=floor($size[1]/3);				
					imagecopyresized($target,$source,0,0,$w2,$h2,$w,$h,$w2,$h2);
				}
				if ($key==0){ //原圖縮小
					imagecopyresized($target,$source,0,0,0,0,$w,$h,$size[0],$size[1]);
				}
				if ($key==2){ // 從4分之1 x,y 讀取1/2 
					$w2=floor($size[0]/4);
					$h2=floor($size[1]/4);				
					imagecopyresized($target,$source,0,0,$w2,$h2,$w,$h,$w2*2,$h2*2);
				}
				if ($key==3){ // 從1/9處讀取指定大小
					$w2=floor($size[0]/9);
					$h2=floor($size[1]/9);				
					imagecopyresized($target,$source,0,0,$w2,$h2,$w,$h,$w*1.5,$h*1.5);
				}
				if ($key==5){ // 同比例縮小至寬高限制內,不足補空白
					$tempw=floor($size[0]/$w);
					$temph=floor($size[1]/$h);
					$x=0;
					$y=0;
					if ($tempw > $temph){
						$w2=$w;
						$h2=floor($size[1]/$tempw);
						$y=(($size[1]/$temph)-$h2)/2;
					}
					if ($tempw < $temph){
						$w2=floor($size[0]/$temph);
						$h2=$h;
						$x=(($size[0]/$tempw)-$w2)/2;
					}
					if ($tempw == $temph){
						$w2=$w;
						$h2=$h;
					}								
					imagecopyresized($target,$source,$x,$y,0,0,$w2,$h2,$size[0],$size[1]);
				}
				if ($key==6){ // 同比例縮小至寬高限制內,不足裁掉
					$tempw=$size[0]/$w;
					$temph=$size[1]/$h;
					$x=0;
					$y=0;
					if ($tempw > $temph){
						$w2=$w*$temph;
						$h2=$size[1];
						$x=($size[0]-$w2)/2;

					}
					if ($tempw < $temph){
						$w2=$size[0];
						$h2=$h*$tempw;
						$y=($size[1]-$h2)/2;
					}
					if ($tempw == $temph){
						$w2=$size[0];
						$h2=$size[1];
					}
					imagecopyresized($target,$source,0,0,$x,$y,$w,$h,$w2,$h2);
				}	
			}
			$this->createImg($target);
			imagedestroy($source);
			imagedestroy($target);	
		//}	
	}		
	function upload()
	{
		
		$this->chk_FileSize();
		$this->chk_Style();		
		$this->chk_FileDir();		
		$this->chk_File();	
		
		if ($this->user_msg==""){
			
			$this->chk_Copy();	
		}	
		if ($this->user_msg!=""){
			echo $this->user_msg;
			$this->file_name="";
			return false;
		}
		else
		{
			if ($this->oldimg !="")
			{
				@unlink($this->file_dir.$this->oldimg);
			}
			if ($this->smallimg =="1")
			{
				@unlink($this->file_dir."sm".$this->oldimg);
			}			
			return true;
		}
	}
}

function removeDir($path)
{
	if (is_dir($path))
	{
		$dir=opendir($path);
		while ($file=readdir($dir))
		{
			if ($file != "." && $file !=".."){
			unlink($path."/".$file);
			}
		}
		closedir($dir);
		if (rmdir($path)){
			return true;
		}
		else
		{
			return false;
		}
	}
}
function copyDir($rpath,$tpath)
{
$temp="";
	if (is_dir($rpath)){
		$dir=opendir($rpath);
		while ($file=readdir($dir))
		{
			if ($file != "." && $file !=".." && !is_dir($rpath.'/'.$file)){ //如果不是目錄的話就copy
				if (!copy($rpath.'/'.$file,$tpath.'/'.$file))
				{
					echo '移動檔案'.$rpath.'/'.$file.'失敗\\r\\n';
					$temp="error";
				}
			}
		}
		return $temp;
	}
	else
	{
		echo "目錄".$rpath."不存在\\r\\n";
	}

}
?>