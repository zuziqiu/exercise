
ww=$(window).width();
wh=$(window).height();

function bannerresize(){
	ww=$(window).width();
	wh=$(window).height();
	if(ww<=960){
		$('.bigBanner').height(ww*.75);
		$('.siteMap dl').removeClass('open');
	}else{
		$('.bigBanner,.mb_menu').removeClass('style');
		$('.mb_header .ic').removeClass('ic_close');
	}
}

function checkboxToggle(labelitem){
	if(labelitem.find('input[type=radio]').size()!=0 || labelitem.find('input[type=checkbox]').size()!=0){
		if(labelitem.find('input').is(':checked')){
			/*labelitem.addClass('checked');*/
			if(labelitem.hasClass('checkedShowSubLevel')){
				labelitem.siblings('.checked_show').focus();
			}
		}else{
			labelitem/*.removeClass('checked')*/.siblings('.checked_show').blur();
		}
	}
	checkboxStatus()
}
function checkboxStatus(){
	$('input[type=radio],input[type=checkbox]').each(function(){
		if($(this).is(':checked')){
			$(this).parent('label').addClass('checked');
		}else{
			$(this).parent('label').removeClass('checked');
		}
	})
	$('.form dd').each(function(){
		if($(this).children('label').size()>2 && $(this).children('label').hasClass('checkbox_rechagre')==false){
			$(this).addClass('verticalItem');
		}
	})
}

function pagecontentMinH(){
	$('.pageContain').css('min-height',wh-489);
	$('.pageContain .breadcrumb+div,.sidebar').css('min-height',wh-533);
}

function progressNow(){
	progressV=$('.progress_now').parent('.progress_block').siblings('.progress_value').html();
	$('.progress_now').width(progressV);
}

function item_workimg_maxWidth(){
	$('.info_worksimggroup').each(function(){
		this_=$(this);
		workingMaxW=this_.children('.item_workimg').size()
		this_.children('.item_workimg').css('max-width',Math.round(1/workingMaxW*100)-1+'%')
	})
}
function item_workimg_for(){
	$('.item_workimg').each(function(){
		this_=$(this).children('img');
		imgW=this_.width();
		imgH=this_.height();
		if(imgH>imgW){
			this_.width(Math.round(imgW/imgH*160))
		}
	})
}

function mb_fixedTop(){
	ww=$(window).width();
	if(ww<901){
		fixedOffsetH=0;
		$('.mb_fixedTop').each(function(){
			fixedOffsetH=fixedOffsetH+$(this).outerHeight();
		})
		parentPT=parseInt($('.mb_fixedTop').parent('.pageContent').css('padding-top'));
		$('.mb_fixedTop').parent('.pageContent').css('padding-top',fixedOffsetH-24);
	}else{
		$('.mb_fixedTop').parent('.pageContent').removeAttr('style');
	}
}

// 连接跳转到本地服务器
function replaceHref(){
	if(location.hostname==""){
		pathname=location.pathname;
		jumpToLink=pathname.replace('/D:/Apache24/htdocs/','http://localhost/');
		window.location.href=jumpToLink
	}
}

$(document).ready(function(){
	replaceHref();
	bannerresize();
	checkboxStatus();
	pagecontentMinH();
	progressNow();

	// item_workimg_maxWidth();
	// item_workimg_for();
	mb_fixedTop();

	/*——————————省市级联动插件——————————*/
	$('#distpicker').distpicker({
		province: '---- 所在省 ----',
		city: '---- 所在市 ----',
		district: '---- 所在区 ----'
	});

	$('body').on('click','.siteMap .largeClass,.menu_help .largeClass',function(){
		$(this).parent().toggleClass('open').siblings().removeClass('open')
	});
	$('body').on('click','.mb_header>.ic',function(){
		// if($(window).width()<=960){
			$(this).toggleClass('ic_close').siblings().removeClass('ic_close');
			if($(this).hasClass('ic_menu') && $(this).hasClass('ic_close')){
				$('.mb_header .mb_menu').fadeIn(200);
			}else{
				$('.mb_header .mb_menu').fadeOut(200);
			}
		// }
	})

	$('.form label').click(function(){
		checkboxToggle($(this));
	});

});

$(window).resize(function(){
	mb_fixedTop();
	bannerresize();
	$(".ic_menu").click(function(){
		$(".mb_menu").show();
	})
	$(".ic_close").click(function(){
		$(".mb_menu").hide();
	})
})