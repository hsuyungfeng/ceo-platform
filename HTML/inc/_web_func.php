<?php
function drawProductStrip($id,$total,$capacity=0){
	global $db,$scontent2;

	
	echo '<div class="product_range"><div class="strip_content">';
	
	$width=280; 
	$sql="select amount, price from ceo_range where pid='$id' order by amount asc";
	$rows = $db->fetch_all_array($sql);
	$step=count($rows);
	$stepwidth=($step > 0) ? $width/$step : 0;
	$stripwidth=0;
	
	for($i=0;$i<$step;$i++){
		$left=$i*$stepwidth;
		$border="";
		$price=$rows[$i]["price"];
		if(is_numeric($capacity) && $capacity>0){
			$price=number_format($price/$capacity,0);
		}
		echo '<div class="strip_step" style="left:'.$left.'px;width:'.$stepwidth.'px"><span class="price">'.$price.'元</span><span class="amount">'.$rows[$i]["amount"].$scontent2.'</span></div>';
		if($stripwidth==0){
			if($total>0 && $total<=$rows[$i]["amount"]){
				$laststep=($i>0) ? $rows[$i-1]["amount"] : 0;
				$stripwidth=$left+(($stepwidth/($rows[$i]["amount"]-$laststep))*($total-$laststep));
			}
		}
	}
	$maxamount=($step > 0) ? $rows[$step-1]["amount"] : 0;//取得最高階段的數量
	if($stripwidth==0 && $total>0){//爆了
		$stripwidth=$width;
	}


	echo '<div class="strip" style="width:'.$stripwidth.'px;left:0px"></div>';
	echo '</div></div>';
}

?>