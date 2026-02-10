var err_msg="";
function message(txt,objid){
	$('html, body').scrollTop(0);
	var obj=document.getElementById(objid);
	obj.innerHTML=txt;
}

function isnull(id,txt,type,minlen,maxlen){
	type=arguments[2]||0;
	minlen=arguments[3]||0;
	maxlen=arguments[4]||0;
	var my_value=$.trim($('#'+id).val());
	my_value=my_value.replace(/(^[\s　]*)|([\s　]*$)/g,"");
	if(my_value=="" || my_value=="0000-00-00"){
		err_msg='請輸入'+txt+'!!';
		return false;
	}
	if(type==1){
		if (isNaN(my_value) ){
		    err_msg+=txt+'必須為數字型態!!'
		    return false
	    }
	}
	if(type==2)
	{
	 var pattern =/^([\u4E00-\u9FA5]|[\uFE30-\uFFA0])*$/gi;   
     if(!pattern.test(my_value)){ 
		err_msg=txt+'必須為中文!!';
		return false;
	 }
	}
    if(maxlen>0 && minlen>0){
		if(my_value.length>maxlen || my_value.length<minlen){
		  err_msg=txt+'必須為'+minlen+'~'+maxlen+'個字元!!';
		  return false;
		}
	}	
	if(maxlen>0){
		if(my_value.length>maxlen){
		  err_msg=txt+'只能小於'+maxlen+'個字元!!';
		  return false;
		}
	}	
	if(minlen>0){
		if(my_value.length<minlen){
		  err_msg=txt+'必須大於'+minlen+'個字元!!';
		  return false;
		}
	}

	return true;
}
function isselect(id,key){
	var my_value=$.trim($('#'+id).val());
	if(my_value==""){
		err_msg='請選擇'+key+'!!';
		return false;
	}
 return true;
}
function ischecked(name,txt,maxnum){
	maxnum=arguments[2]||0;
	var obj=$("input[name="+name+"]");
	var num=0;
	for(i=0;i<obj.length;i++)
	{
		if(obj.get(i).checked){
			num++;
		}
	}
	if(num==0)
	{
		  err_msg='請選擇'+txt+'!!';
		  return false;	
	}
	if(maxnum>0)
	{
	    if(num>maxnum)
	    {
		  err_msg=txt+'最多只能選中'+maxnum+'個選項!!';
		  return false;	
	    }
	}
	return true;
}
function isemail(id){
	var my_value=$.trim($('#'+id).val());
	my_value=my_value.replace(/(^[\s　]*)|([\s　]*$)/g,"");
	if(my_value==""){
		err_msg='請輸入Email!!';
		return false;
	}
	var re = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z]{2,4})+$/;
	if (!re.test(my_value)){
		err_msg="請輸入正確Email格式";
		return false;
	}
	return true;		
}
function istel(id){
	var my_value=$.trim($('#'+id).val());
	my_value=my_value.replace(/(^[\s　]*)|([\s　]*$)/g,"");
	if(my_value==""){
		err_msg='請輸入聯絡電話!!';
		return false;
	}
		var re = /^([0-9]{2,3}-)?[0-9]{8,10}(#[0-9]{1,4})?$/;
	if (!re.test(my_value)){
		err_msg+="聯絡電話格式不正確";
		return false;
	}	
	return true;	
}
function ismobile(id){
	var my_value=$.trim($('#'+id).val());
	my_value=my_value.replace(/(^[\s　]*)|([\s　]*$)/g,"");
	if(my_value==""){
		err_msg='請輸入手機號碼!!';
		return false;
	}
	var re = /^09[0-9]{8}$/;
	if (!re.test(my_value)){
		err_msg="手機號碼格式不正確";
		return false;
	}
   return true;	
}
function isennum(id,txt) {
	var my_value=$.trim($('#'+id).val());
	my_value=my_value.replace(/(^[\s　]*)|([\s　]*$)/g,"");
    var re = /^\w+$/;
    if (!re.test(my_value)) {
        err_msg = txt+"只能輸入英數字大小寫和_";
        return false;
    }
    return true;
}

function ispassword(password1,password2) {
	var my_value=$.trim($('#'+id).val());
	my_value=my_value.replace(/(^[\s　]*)|([\s　]*$)/g,"");
    var re = /^\w+$/;
    if (!re.password1 != password2) {
        err_msg = "密碼前後不符";
        return false;
    }
    return true;
}


function isdate(yy, mm, dd,txt) {
    var arg_intYear=$.trim($('#'+yy).val());
    var arg_intMonth=$.trim($('#'+mm).val());
    var arg_intDay = $.trim($('#' + dd).val());
    if (arg_intDay != "" && arg_intMonth != "" && arg_intDay != "") {
        //月數從0開始，所以要將參數減一
        var objDate = new Date(arg_intYear, arg_intMonth - 1, arg_intDay);
        //檢查月份是否小於12大於1
        if ((parseInt(arg_intMonth) > 12) || (parseInt(arg_intMonth) < 1)) {
            err_msg = arg_intYear + '/' + arg_intMonth + '/' + arg_intDay + txt + '月份不正確';
            return false;
        }
        else {
            //如果objDate日數進位不等於傳入的arg_intDay，代表天數格式錯誤，另外月份進位也代表日期格式錯誤
            if ((parseInt(arg_intDay) != parseInt(objDate.getDate())) || (parseInt(arg_intMonth) != parseInt((objDate.getMonth() + 1)))) {
                err_msg = arg_intYear + '/' + arg_intMonth + '/' + arg_intDay + txt + '天數不正確';
                return false;
            }
            else {
                err_msg = arg_intYear + '/' + arg_intMonth + '/' + arg_intDay + txt + '日期格式正確';
                return true;
            }
        }
    }
    return true;
}

function isFCK(instance,txt){
	var editorBody=FCKeditorAPI.GetInstance(instance).GetXHTML(true);
	var my_value=$.trim(editorBody);
	my_value=my_value.replace(/(^[\s　]*)|([\s　]*$)/g,"");
	if(my_value==""){ 		
	    err_msg="請輸入"+txt+"!!";
	    return false; 
	} 
	return true;
}
function iscc(id,txt,type,minlen,maxlen){
	type=arguments[2]||0;
	minlen=arguments[3]||0;
	maxlen=arguments[4]||0;
	var my_value=$.trim($('.'+id).val());
	my_value=my_value.replace(/(^[\s　]*)|([\s　]*$)/g,"");
	if(my_value==""){
		err_msg='請輸入'+txt+'!!';
		return false;
	}
	if(type==1){
		if (isNaN(my_value) ){
		    err_msg+=txt+'必須為數字型態!!'
		    return false
	    }
	}
	if(type==2)
	{
	 var pattern =/^([\u4E00-\u9FA5]|[\uFE30-\uFFA0])*$/gi;   
     if(!pattern.test(my_value)){ 
		err_msg=txt+'必須為中文!!';
		return false;
	 }
	}
    if(maxlen>0 && minlen>0){
		if(my_value.length>maxlen || my_value.length<minlen){
		  err_msg=txt+'必須為'+minlen+'~'+maxlen+'個字元!!';
		  return false;
		}
	}	
	if(maxlen>0){
		if(my_value.length>maxlen){
		  err_msg=txt+'只能小於'+maxlen+'個字元!!';
		  return false;
		}
	}	
	if(minlen>0){
		if(my_value.length<minlen){
		  err_msg=txt+'必須大於'+minlen+'個字元!!';
		  return false;
		}
	}

	return true;
}