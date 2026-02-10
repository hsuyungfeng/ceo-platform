  <tr>
    <td rowspan="2" class="leftbg_top">&nbsp;</td>
    <td width="995" height="55"><table width="995" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td width="287" height="55"><a href="index.php"><img border="0" src="images/product_detail_logo.jpg" width="287" height="55" /></a></td>
        <td width="481" align="right">
        <? if(!empty($_SESSION["uid"])){?>
       <?=$_SESSION["utitle"]?>，您好！
        <? } ?>
        </td>
        <td width="87"><a href="member_join.php" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image2','','images/product_detail_join-1.jpg',1)"><img border="0" src="images/product_detail_join.jpg" name="Image2" width="87" height="55" id="Image2" /></a></td>
        <td width="84">
        <? if(empty($_SESSION["uid"])){?>
        <a href="member_login.php" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image3','','images/product_detail_login-1.jpg',1)">
        <img border="0" src="images/product_detail_login.jpg" width="84" height="55" id="Image3" /></a>
        <? }else{ ?>
        <a href="logout.php" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image3','','images/product_detail_login-2-1.jpg',1)">
        <img border="0" src="images/product_detail_login-2-1.jpg" width="84" height="55" id="Image3" /></a>
        <? } ?>
        </td>
        <td width="56">&nbsp;</td>
      </tr>
    </table></td>
    <td rowspan="2" class="rightbg_top">&nbsp;</td>
  </tr>
  <tr>
    <td height="121"><table width="995" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td height="121" align="left" valign="top"><table width="995" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td width="155"><a href="about.php" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image46','','images/product_detail_menu01-1.jpg',1)"><img border="0" src="images/product_detail_menu01.jpg" width="155" height="121" id="Image"></a></td>
            <td width="108"><a href="member.php" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image47','','images/product_detail_menu02-1.jpg',1)"><img src="images/product_detail_menu02.jpg" name="Image47" width="108" height="121" id="Image47" border="0"></a></td>
            <td width="116"><a href="product.php" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image48','','images/product_detail_menu03-1.jpg',1)"><img src="images/product_detail_menu03.jpg" name="Image48" width="116" height="121" id="Image48" border="0"></a></td>
            <td width="119"><a href="contact.php" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image49','','images/product_detail_menu04-1.jpg',1)"><img src="images/product_detail_menu04.jpg" name="Image49" width="119" height="121" id="Image49" border="0"></a></td>
            <td width="136"><img src="images/product_detail_searchleft.jpg" width="136" height="121"></td>
            <td align="left" valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td><img src="images/product_detail_searchtop.jpg" width="290" height="33"></td>
                </tr>
              <tr>
                              <FORM action="product.php" method="get" enctype="multipart/form-data" name="form3" id="form3">
                <td height="31" class="gary12">
                  <input name="keyword" type="text" id="keyword" style="color:#999" onFocus="if(this.value=='商品名稱&商品代碼搜尋'){this.value='';this.style.color='';}" onBlur="if(this.value==''){this.value='商品名稱&商品代碼搜尋';this.style.color='#999';}" value="商品名稱&商品代碼搜尋" size="30">
                  <input type="submit" name="button" id="button" value="搜尋">
                  </td>
                  </FORM>
                </tr>
              <tr>
                <td height="57"><img src="images/product_detail_searchdown.jpg" width="290" height="57"></td>
                </tr>
              </table></td>
            <td width="71"><img src="images/product_detail_searchright.jpg" width="71" height="121"></td>
            </tr>
          </table></td>
        </tr>
    </table></td>
  </tr>