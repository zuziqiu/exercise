/**
 * 课程管理
 */
var HTKJ = window.HTKJ || {};

var zeroSwf = 'http://kai.talk-fun.com/templates/pc/teach_cms/js/swf/ZeroClipboard.swf';

HTKJ.course = {

	defaults:{
		attr: 1,
		video_id: "",
		videoDuration: "",
		fileName: "",
		fileSize: "",
		status: "" ,
		post_flag: true,
		video_flag: false,
		a_click: false,
		block_arry: [],

	},

	//事件绑定
	bindEvents: function(){

		var isFirst = parseInt(window.isFirst);

		var that = this;

		var $rmc = $(".right_manage_course"),
			$popSetName	= $(".pop_set_name"),
			$courseDel = $(".course_del");

		var platform = that.isMac();

		//课程ID
		var courseId = '';

		//召唤播放器
		var tpl = '<iframe name="myFrame" class="iframe" src='+window.startProtocol+'></iframe>';
		
		//创建课程时出现时间段的冲突-start
		$courseDel.on("click", ".sure", function(){
			$courseDel.hide();
		});

		//取消，隐藏pop
		$(".remove_margin").on("click", function(){
			$courseDel.hide();
		});

		//第一次
		$(".suc_url").on("click", ".back_one", function(){
			$("body").append(tpl);		
		});

		//课程管理的分享
		$(".start_btn").on("click", ".share", function(){

			$(".mod_layer").show();
			$(".pop_share").removeClass('pop_sm');

			var htmlLink = $(this).data("url"),
				courseName = $(this).data("coursename"),
				nickName = $(this).data("nickname"),
				qrLink = $(this).data("qrcodeurl");

			var textVal = nickName + '的课程【' + courseName +'】'+ "直播地址：" + htmlLink;
				$(".mang_links").val(textVal);
				$(".wechat_qr img").attr("src", qrLink);
		});

		//关闭课程管理的分享
		$(".pop_close").on("click", function(){
			$(".pop_share").attr("style", "");
			$(".mod_layer").hide();
			$(".pop_share").addClass('pop_sm');
		});

		//创建课程属性选择
		$(".select_attr").on("click", "span", function(){
			var dataSet = $(this).data("set");
			if(!$(this).hasClass('selected')){
				$(this).addClass('selected').siblings("span").removeClass('selected');
				if( dataSet == "1"){
					// $(".audition").show();
					$(".audition> dd").attr("data-num","0");
					$(".audition").find("span").show().removeClass('selected').last().hide().siblings().first().addClass('selected');
					$(".select_attr").addClass('charge');
					$(".price").focus().val("");
					HTKJ.course.defaults.attr = 1;
				}else{
					// $(".audition").hide();
					$(".audition> dd").attr("data-num","180");
					$(".audition").find("span").hide().removeClass('selected').last().show().addClass('selected');
					$(".select_attr").removeClass('charge');
					HTKJ.course.defaults.attr = 0;
				}
			}
		});

		//课程试听
		$(".audition").on("click", ".ts", function(){
			$(".ts_time").show();
		});

		//试听时间
		$(".audition span").click(function(){
			$(".audition span").removeClass('selected');
			$(this).addClass('selected');
			var time = $(this).data("set");
			$(".audition").find("dd").attr("data-num",time);

		});


		//聚焦
		$(".setting").on("click", "input", function(){
			var dataName = $(this).data("name");
			$(this).removeClass('error');
				if( dataName == "title"){
					$(".title_error").hide();
				}
				if( dataName == "startTime" || dataName == "endTime"){
					$(".time_error").hide();
				}
		});

		// 价格失焦
		$(".price").blur(function(event) {
			if( $(".price").val() < "1"){
				$(".price").addClass('error');
				// that.position($(".price"));
			}
		});

		//创建课程
		$(".sure_btn").on("click", ".cancel", function(){
			if(that.defaults.video_flag){
				// 弹出取消确认窗口
		        $(".is_cancel_upload").removeClass('hidden');
		        // 确认取消
		        $(".sure_upload").click(function(){        	
					//返回上一层 并刷新 -->几种做法
					window.location.href = document.referrer;//返回上一页并刷新  
		        });
		        // 否定取消
		        $(".cancel_upload").click(function(){
		        	$(".is_cancel_upload").addClass('hidden');
		        })
		    }
		    else{
	    		//返回上一层 并刷新 -->几种做法
				window.location.href = document.referrer;//返回上一页并刷新  
		    }
		});

		//第二个分享
		$(".qr_text").on("click", ".btn", function(){
			$(".pop_teach_use").show();
		});

		//关闭第二个分享
		$(".pop_teach_use").on("click", ".close", function(){
			$(".pop_teach_use").hide();
		});

		//开讲提示-创建课程页面
		$(".suc_url").on("click", ".go_desk", function(){
			if( platform == "MacOS"){
				$('.is_mac').show();
			}else{
				if( isFirst == 0){
					$(".set_suc_layer").show();
					$(".pop_set_suc").show();
					$("body").append(tpl);
				}else if( isFirst == 1){
					$(".set_suc_layer").hide();
					$(".pop_set_suc").hide();
				}
			}
		});

		//课程管理页面
		$(".start_btn").on("click", ".start", function(){
			var parents = $(this).parent().parent().parent().parent();
			if(parents.find(".cost_time").hasClass("has_guest")){
				$(".guest_talk").addClass("show");
				$(".mod_layer").show();
				var name = $(this).data("name"),
					link = $(this).data("guesturl"),
					liveLink = $(this).data("liveurl");
				$("#course_link").val(name+'的嘉宾地址：'+ link);
				$(".go_live").attr("href", liveLink);
			}else{
				if( platform == "MacOS"){
					$(".is_mac").show();
				}else{
					$(".set_suc_layer").show();
					$(".pop_set_suc").show();
					$("body").append(tpl);
				}
			}
		});

		$(".guest_talk").on("click", ".close",function(){
			$(".guest_talk").removeClass("show");
			$(".mod_layer").hide();
		})

		//关闭开讲提示
		$(".pop_set_suc").on("click", ".close", function(){
			$(".set_suc_layer").hide();
			$(".pop_set_suc").hide();
			$(".iframe").remove();
		});

		$(".yes_start").on("click",function(){
			$(".set_suc_layer").hide();
			$(".pop_set_suc").hide();
			$(".iframe").remove();
		});

		//当在mac 的情况下
		$(".is_mac").on("click", "span", function(){
			$('.is_mac').hide();
		});

		//课程设置
		$(".modify_setting").on("click", function(e){
			courseId = $(this).parents(".detail").data("courseid");
			var top = $(this).position().top,
				left = $(this).position().left;
				$(".pop_set_name").css({
					"top": top - 16,
					"left": left + 28
				});
					e.stopPropagation();
				$(".pop_set_name").addClass('show').show();
		});
		
		//删除课程
		$popSetName.on("click", ".delected", function(){
			var firstChild = $(".the_same").children().first();
				firstChild.addClass("is_sure").removeClass("upload_course");
			$(".is_delect_course").show();  
			$(".is_delect_course em").html("确认删除该课程？");
			$popSetName.hide();
		});

		//修改课程
		$popSetName.on("click", ".modify", function(){
			that.modifyCourse(courseId);
			$popSetName.hide();
		});

		//确定删除
		$(".is_delect_course").on("click", ".is_sure", function(){
			that.delectCourse(courseId);
			$(".is_delect_course").hide();
		});

		$(".remove_margin").on("click", function(){
			$(".is_delect_course").hide();
		});

		//点击页面其他地方隐藏
		$(document).click(function(){
			if( $popSetName.hasClass('show')){
				$popSetName.removeClass('show').hide();
			}
		});

		$(document).on("click", ".timelist_item", function(){
			$(".datepicker").hide();
		});

		//主讲人
		$(".guest").on("click", ".name", function(e){
			$(".guest_name").show();
			e.stopPropagation(); //阻止冒泡
		});

		$(".guest_name").on("click", "li", function(){
			var name = $(this).html(),
				id = $(this).data("id");
			$(".guest .name").html(name);
			$(".guest .name").attr("data-id",id);
			$(".guest_name").hide();
		});

		$("body").on("click", function(e){
			$(".guest_name").hide();
		});

	},

	//课程管理时候选择删除
	delectCourse: function(xid){
		var $rCourse = $(".right_manage_course");
		$.ajax({
			url: window.delete_url,
			type: 'get',
			dataType: 'jsonp',
			data: {
				'courseID': xid
			},
			success: function(ret){
				if(	ret.code == 0){
					$rCourse.find(".detail").each(function(index, el) {
						var dataXid = $(el).data("courseid");
						if( dataXid == xid){
							$(el).remove();	
						}
					});
				}
			},	
		})
	},

	//课程修改
	modifyCourse: function(xid){	
		window.location.href = window.edit_url  +'/' +xid;
	},


	//显示当前时间
	showTime: function(){
			if( window.isModify === "edit"){
				var timeOne = parseInt(window.startTime);
			}else{
				var timeOne = parseInt(window.nowTime);
			}
		var timeTwo = new Date(timeOne * 1000); 
		var mon = timeTwo.getMonth()+1;
		var date = timeTwo.getDate();
		var hour = timeTwo.getHours();
		var min = timeTwo.getMinutes();
			
			if( mon < 10){
				mon = "0" + mon;
			}
			if( date < 10){
				date = "0" + date;
			}
			if( hour < 10){
				hour = "0" + hour;
			}
			if( min < 10 ){
				min = "0" + min;
			}

		var setTime = timeTwo.getFullYear()+"-"+(mon)+"-"+date+" "+hour+":"+min;
			
		//初始化开始的时间
		$(".start").val(setTime); 
	},

	showEndTime: function(){
		var timeEndOne = parseInt(window.nowTime) + 3600 * 3;
		var timeEndTwo = new Date(timeEndOne * 1000);

		var monEnd = timeEndTwo.getMonth()+1;
		var dateEnd = timeEndTwo.getDate();
		var hourEnd = timeEndTwo.getHours();
		var minEnd = timeEndTwo.getMinutes();
			
			if( monEnd < 10){
				monEnd = "0" + monEnd;
			}
			if( dateEnd < 10){
				dateEnd = "0" + dateEnd;
			}
			if( hourEnd < 10){
				hourEnd = "0" + hourEnd;
			}
			if( minEnd < 10 ){
				minEnd = "0" + minEnd;
			}

		var setEndTime = timeEndTwo.getFullYear()+"-"+(monEnd)+"-"+dateEnd+" "+hourEnd+":"+minEnd;
			
			$(".end").val(setEndTime);
	},

	//验证
	_validate: function(){
		var $title = $(".title").val(),
			$startTime = $(".start").val(),
			$tsVal = $(".ts").html(),
			$price = $(".price"),
			$endTime = $(".end").val(),
			that = this;

		var attrVal = HTKJ.course.defaults.attr;

			if( $title == ""){
				$(".title").addClass('error');
				$(".title_error").show();
				that.position($(".title"));
				return false;
			}

			if( $startTime == ""){
				$(".start").addClass('error');
				$(".time_error").show();
				that.defaults.post_flag = true;
				return false;
			}

			if( $endTime == ""){
				$(".end").addClass('error');
				$(".time_error").show();
				that.defaults.post_flag = true;
				return false;
			}

			if( attrVal == 1){
				if( $price.val() < "1"){
					$price.addClass('error');
					that.position($price);
					return false;
				}
				if( $tsVal == ""){
					$(".ts").addClass('error');
					$(".ts_error").show();
					that.defaults.post_flag = true;
					return false;
				}
			}

			return true;
	},

	//getVal
	getVal: function(){
		var that = this,
			info = '',
			title = '',
			type = '',	
			price = '',
			tryTime = '',
			description = '',
			onsale = '',
			dataArray = [],
			guest = '',
			uploadImg = '',
			courseType = '',
			detail = '',
			video_id = '',
			videoDuration='';

			attType = HTKJ.course.defaults.attr;

			//标题
			$(".title").each(function(index, el) {
				title = $(el).data("name") +'='+ $(el).val() + '&'; 
			});

			//描述
			$(".description").each(function(index, el) {
				description = $(el).data("name") +'='+ $(el).val() + '&';	
			});

			//属性
			$(".select_attr").each(function(index, el) {
				type = $(el).data('name') +'='+ $(el).find(".selected").data("set") + '&';
			});

			//price
			$(".price").each(function(index, el) {
				price = $(el).data("name") +'='+ $(el).val() + '&';
			});

			//试听时间
			// $(".audition").each(function(index, el) {
			// 	tryTime = $(el).data('name') +'='+ $(el).find(".ts").data("set") + '&';
			// });
			tryTime = $(".audition").data('name') +'='+ $(".audition").find("dd").data("num") + '&';
			
			//主讲人
			$(".guest").find("dd").each(function(i,e){
				guest = 'guestID'+ '=' + $(e).find(".name").data("id") + '&';

			});

			//上下架
			$(".status_select").each(function(index, el) {
				onsale = $(el).data("name") + '=' + $(el).find('.selected').data("set");
			});

			//时间
			$(".setting").each(function(i, el) {

				var infoName = $(el).data("name"),
					classObject = {};

				var	startTime = $(el).find(".start").val(),
					endTime = $(el).find(".end").val();

				classObject.orderNo = "1";
				classObject.startTime = startTime;
				classObject.endTime = endTime;
					
				//编辑情况
				if( window.isModify === "edit"){
					classObject.id = window.lessonid;
				}

				classObject = JSON.stringify(classObject);

				dataArray.push(classObject);

				info = infoName + '=' + '['+ dataArray.toString() + ']'+'&';
			});

			// 课程详情
			courseType = "courseType=" + window.courseType + "&";

			// 编辑内容
			detail = "detail=" + (encodeURIComponent(ue.getContent()) || "") + "&";

			// 视频ID
			video_id = "videoID=" + that.defaults.video_id + "&";

			// 总时长
			video_duration = "videoDuration=" + that.defaults.videoDuration + "&";

			fileName = "fileName=" + that.defaults.fileName + "&";

			fileSize = "fileSize=" + that.defaults.fileSize + "&";

			status = "status=" + that.defaults.status + "&";

			convertFileSize = "convertFileSize=" + that.defaults.convertFileSize + "&";

			//免费
			if( attType == 0){
			  	courseVal =  title + description + type + guest+ tryTime+ info+ courseType+ detail+ video_id+ video_duration+ fileName+ fileSize;
			}
			//收费
			else if( attType == 1){
				courseVal =  title + description + type + guest + price +tryTime + info+ courseType+ detail+ video_id+ video_duration+ fileName+ fileSize;
			}

			//不需要重复上传的情况下需要加上视频状态
			if (that.defaults.status !== '' && that.defaults.status !== undefined) {
				courseVal += status;
			}

			//不需要重复上传的情况下需要加上视频转换后的大小
			if (that.defaults.convertFileSize !== '' && that.defaults.convertFileSize !== undefined) {
				courseVal += convertFileSize;
			}

			//修改的时候数据瓶装
			if( window.isModify === "edit"){
					courseVal += onsale;
			}
			//创建的时候
			else{
				var courseVal = courseVal.substring(0, courseVal.length-1);
			}	
			
			return courseVal;
	},

	//post
	postVal: function(){
		var that =  this;

		$(".seted").on("click", function(){

			// 视频课点击创建后跳转，不允许重复点击
			if(!that.defaults.post_flag){
				return
			}
			that.defaults.post_flag = false;

			if( that._validate()){

				// loading
				$(".seted_loading").removeClass('hidden');

				var postData = that.getVal();
				if( $("#img_show").hasClass('has') ){
					postData += '&uploadImg=1';
				}else {
					postData += '&uploadImg=0';
				}
				$.ajax({
					type: "post",
					url: window.post_url,
					dataType: "jsonp",
					data: postData,
					success: function(ret){
						that.dealBack(ret);
					}
				});
			}
		});
	},

	// 处理课程
	deal_course: function(ret){
		// loading消失，显示提示
		$(".seted_loading").addClass('hidden');
		$(".seted_tips").removeClass('hidden');

		setTimeout(function(){
			// 隐藏成功提示
			$(".seted_tips").addClass('hidden');
			//修改的情况下
			if( window.isModify ==="edit"){
				window.location.href = document.referrer;
			}
			//创建的情况下
			else{
			// 视频课时
				if(window.courseType == 1){
						window.location.href = '/teacher/course?courseType=1';
				}
				// 非视频课时
				else{
					$(".setting").hide();
					$(".set_success").removeClass('suc_sm');
					var shareLink = ret.data.url,
						courseName = ret.data.courseName,
						nickName = ret.data.nickname,
						qrLink = ret.data.qrcode_url;
					
					//拼装复制的数据 
					var inpVal = nickName + '的课程【' + courseName +'】'+ "：" + shareLink;
					
					//把成功后的链接放到分享框里
					$("#not_guest_link").val(inpVal);
					$(".share_qr .qr").attr("src", qrLink);

					if( ret.data.guestUrl){
						$(".set_success").removeClass("not_guest").addClass("has_guest");
						$(".suc_guest .guest_text").html("复制嘉宾登录链接发送嘉宾"+'('+ret.data.guest +')');
						$("#has_guest_link").html(ret.data.guest+'嘉宾的直播地址'+ ret.data.guestUrl)
					}
				}
			}
		},2000);
	},
	//处理callback
	dealBack: function(ret){
		var that = this;
		// 保存成功
		if( ret.code == 0){
			//无论修改还是创建课程，有图片的情款下
			if($("#img_show").hasClass('upload')){
				that.uploader.options.server = ret.upload_url;
				// 确认保存后上传图片至服务器
				that.uploader.upload();
				that.uploader.on( 'uploadSuccess', function(file, response) {
					if(response.code == 0){
						that.deal_course(ret);
						return;
					}
					else{
						alert("上传图片失败，请重新上传")
					}
				});
			}else {
				that.deal_course(ret);
			}
		}
		// 保存失败
		else{
			$(".seted_loading").addClass('hidden');
			setTimeout(function() {
				that.defaults.post_flag = true;
			}, 1000);

			//课程冲突
			if( ret.code == -34){
				$(".course_del em").html(ret.msg);
				$(".course_del").show();
			}

			//当前有直播
			if( ret.code == -35){
				$(".course_del em").html(ret.msg);
				$(".course_del").show();
				$(".course_del .sure").show();
				$(".course_del .the_same").hide();
			}

			if( ret.code == -1){
				$(".course_del em").html(ret.msg);
				$(".course_del").show();
			}
		}
	},

	// 动态绑定时间插件
	reBind: function(_start, _end){
		//_start = $(_start);
		//_end = $(_end);
		
		$(".start").appendDtpicker({
		});

		$(".end").appendDtpicker({
		});

		/*var start = {
			    format: 'YYYY-MM-DD hh:mm',
			    min: laydate.now(), //设定最小日期为当前日期
			    max: '2099-06-16 23:59', //最大日期
			    istime: true,
			    istoday: false,
			    choose: function(datas){
			        end.min = datas; //开始日选好后，重置结束日的最小日期
			        end.start = datas //将结束日的初始值设定为开始日
			    }
			};
		var end = {
		    format: 'YYYY-MM-DD hh:mm',
		    min: laydate.now(),
		    max: '2099-06-16 23:59',
		    istime: true,
		    istoday: false,
		    choose: function(datas){
		        start.max = datas; //结束日选好后，重置开始日的最大日期
		    }
		};

		_start.on("click", function(){
			laydate(start);
		});

		_end.on("click", function(){
			laydate(end);
		});*/
	},

	//复制
    _copy: function(){
        $(".copy").zclip({
            path : zeroSwf,
            isSetStyle: false,
            copy: function(){
                return $(".mang_links").val();
            },
            afterCopy:function(){
            	$(".copy_success").show();
            	setTimeout(function(){
            		$(".copy_success").hide();
            	}, 2000);
            }
        });

        $("#guest_copy").zclip({
            path : zeroSwf,
            isSetStyle: false,
            copy: function(){
                return $("#has_guest_link").val();
            },
            afterCopy:function(){
            	$(".guest_copy_success").show();
            	setTimeout(function(){
            		$(".guest_copy_success").hide();
            	}, 2000);
            }
        });

        $("#course_copy").zclip({
            path : zeroSwf,
            isSetStyle: false,
            copy: function(){
                return $("#course_link").val();
            },
            afterCopy:function(){
            	$(".copySuc").show();
            	setTimeout(function(){
            		$(".copySuc").hide();
            	},2000);
            }
        });
    },

    //判断是否是苹果OS 平台
	isMac: function(){
		var ua = navigator.userAgent.toLowerCase();
       if( ua.indexOf('macintosh') > -1){
           return 'MacOS';
       }
	},

	//isFirst
	isFirst: function(){
		var isFirstCreate =  parseInt(window.isFirst);
			//是否第一次
			if( isFirstCreate == 1){
				$(".go_desk").attr("href","http://update.talk-fun.com/files_maituo/CloudLive_setup.exe").html("下载直播器");
				$(".back_man").html("已有直播器，马上开讲");
			}else{
				$(".back_man").removeClass('back_one');
				$(".back_man").attr("href", "http://kai.talk-fun.com/teacher/course");
			}
	},

	//默认事情 -- 与修改分发
	defaultsEvent: function(){
		var that = this;
			$('.title').focus();
			//$(".webuploader-container label").attr("style", "");
		//是否是点击修改进来的
		var isModify = window.isModify;
			if( isModify === "edit"){
					that.showView();
					that.modifyEvent();
					that.setModifyTime();
				//audition
			}	
	},

	//显示修改隐藏的View
	showView: function(){
		//是否收费
		var num = $(".select_attr").find(".selected").data("set");
			HTKJ.course.defaults.attr = num;
			if( num == 1){
				$(".audition").show();
			}

		$(".course_status").show();
		//提交按钮
		$(".seted").html("修改");
		$(".seted_tips").text("修改成功");

		//课程试听时间
		var courseTry = $(".ts").data("num");
			if( courseTry != "0"){
				var tSet = courseTry/60;
				$(".ts").html('试听'+tSet+'分钟');
			}else{
				$(".ts").html('无试听');
			}

		if( $("#img_show").hasClass('has')){
			$(".image_cont").show();
			$(".webuploader-pick").html("修改图片");
		}
	},


	//modifyEvent
	modifyEvent: function(){
		var $statuSelect = $(".status_select");
			
			$statuSelect.on("click", "span", function(){
				if( !$(this).hasClass('selected')){
					$(this).addClass('selected').siblings().removeClass('selected');
				}
			});
 	},	

 	//startTime and endTime 
 	setModifyTime: function(){
 		var endModify =  window.endTime;
		var timeEndTwo = new Date(endModify * 1000); 
		var setEndTime = timeEndTwo.getFullYear()+"-"+(timeEndTwo.getMonth()+1)+"-"+timeEndTwo.getDate()+" "+timeEndTwo.getHours()+":"+timeEndTwo.getMinutes();
			$(".end").val(setEndTime);
 	},

 	// 表单报警滚动到当前报警位置
 	position:function(elment){
 		var that = this;
 		var elment_top = elment.offset().top-100;
 		$(document).scrollTop(elment_top);
 		that.defaults.post_flag = true;
 	},

 	//imageUpload
 	imageUpload: function(){
 		var	$ = jQuery,
 			that = this,
 		 	$list = $('.image_cont'),
 		 	// 优化retina, 在retina下这个值是2
 		 	ratio = window.devicePixelRatio || 1,
 		 	thumbnailWidth = 240 * ratio,
        	thumbnailHeight = 160 * ratio,
 		 	
 		 	// Web Uploader实例
    		uploader;
		
			// 初始化Web Uploader
			uploader = WebUploader.create({

				//上传方式
				method: 'POST',

			    // 选完文件后，是否自动上传。
			    auto: false,

			    //name
			    fileVal: 'image',

			    // swf文件路径
			    swf: 'swf/Uploader.swf',

			    // 文件接收服务端。
			    server: '',

			    // 选择文件的按钮。可选。
			    // 内部根据当前运行是创建，可能是input元素，也可能是flash.
			    pick: {
			    	id:'#upload_select',
			    	label: '',
			    },

			    compress:{
				 // 图片质量，只有type为`image/jpeg`的时候才有效。
				    quality: 90,

				    // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
				    allowMagnify: false,

				    // 是否允许裁剪。
				    //crop: false,
			    },

			    // 只允许选择图片文件。
			    accept: {
			        title: 'Images',
			        extensions: 'gif,jpg,jpeg,bmp,png',
			        mimeTypes: 'image/*'
			    },

			    //配置生成缩略图
			    thumb:{
			    	//crop: false,
			    	allowMagnify: true,
			    }
			});

			// 当有文件添加进来的时候
	    	uploader.on( 'fileQueued', function( file ) {
		        var $li = $("#img_show"),
		            $img = $li.find('img');

		        $list.append( $li );

		        // 创建缩略图
		        uploader.makeThumb( file, function( error, src ) {
		        	if(src){
		        		$(".image_cont").show();
		        	}
		            $img.attr( 'src', src );
		            $("#img_show").addClass('has');
		            $("#img_show").addClass('upload');
		        }, thumbnailWidth, thumbnailHeight);
		    });

		    //成功后刷新
		    /*uploader.on( 'uploadSuccess', function( file ) {
        		window.history.go(-1);
    		});*/

		    that.uploader = uploader;
 	},

	// 检查video信息
	checkVideoDetail: function(md5, file, callback){
		var that = this;
		$.ajax({
			url: window.upload_video_url ,
			type: 'POST',
			dataType: 'jsonp',
			data: {
				'md5': md5
			},
			success: function(response){
				$.ajax({
					url: "http://fp3.talk-fun.com/live/api/fileUpload.php?codes=eyJwaWQiOiIyMCIsImJpZCI6IjEwMDAwIiwidGl0bGUiOiJ0ZXN0Iiwic2lkIjozLCJfdCI6MTQ5NTI2NjU4NCwiY2xpZW50X2lwIjoiIiwiZXQiOjE0OTc4NTg1ODQsInJhbmQiOjY2OTE4OTE4LCJzaWduIjoiM2Y2NzAxOTg0ZDk1YWU3M2RjZDlkMTE0ZGE0ZDg3MDAifQ&action=chunkList" ,
					type: 'POST',
					dataType: 'jsonp',
					data: {
						'md5': md5
					},
					success: function(results){
						if(results.code == 0){
							that.defaults.block_arry = results.data;
							console.log(that.defaults.block_arry);
							if(results.data.length>1){
								console.log("服务器有存在的分片")
							}
						}
					}
				});
				
				// 需要上传
				// 执行callback
				if(response.needUpload === true){
					if(typeof (callback) === "function"){
						callback(response);
					}
				}
				// 服务器已上传
				else{
					// 不能重复上传的操作/提示
					$(".Video_choose").addClass('hidden');	// 选择视频按钮消失
					$(".video_agreement").addClass('hidden');// 隐藏上传协议
					// $(".course_title").text(file.name); 	// 显示上传完成后提示的文件名
					$(".progress_value").width("100%");		// 进度条100%
					$(".progress_number").text("100%");		// 总长度100%

					// 小于1M的视频，显示1M
					if(parseInt(file.size/1024/1024)>0){
						$(".current_progress").text(parseInt(file.size/1024/1024)+"M/");	// 上传完成
						$(".total_length").text(parseInt(file.size/1024/1024)+"M");
					}
					else{
						$(".current_progress").text("1M/");					// 上传完成
						$(".total_length").text("1M");
					}

					$(".progress_box").removeClass('hidden');
					that.defaults.video_id = response.data.videoId;			// video_id不为空时才能保存
					that.defaults.videoDuration = response.data.duration;	// 传总时长
					that.defaults.status   = response.data.status;			// 视频状态
					that.defaults.convertFileSize = response.data.fileSize;	// 视频转换后大小

					setTimeout(function(){
						that.upload_reset();
						$(".progress_success_box").removeClass('hidden');
						that.defaults.video_flag = false;         // 视频上传中取消时提示窗口的弹出标志
					},1000);
				}
			}
		});
	},

	// uploader;
 	video_upload: function(){
 		var that = this,
	    	video_uploader,
			MD5 = "",
		    getMD5 = function(){
				return that.MD5;
			},
			maxSize = 2;


  		WebUploader.Uploader.register({  
            "before-send-file":"beforeSendFile",  
            "before-send":"beforeSend",  
            "after-send-file":"afterSendFile",  
        },{  
            //时间点1：所有分块进行上传之前调用此函数  
            // beforeSendFile:function(file){  
            //     var deferred = WebUploader.Deferred();  
            //     //1、计算文件的唯一标记，用于断点续传  
            //     (new WebUploader.Uploader()).md5File(file,0,10*1024*1024)  
            //         .progress(function(percentage){  
            //             $('#item1').find("p.state").text("正在读取文件信息...");  
            //         })  
            //         .then(function(val){  
            //             fileMd5=val;  
            //             $('#item1').find("p.state").text("成功获取文件信息...");  
            //             //获取文件信息后进入下一步  
            //             deferred.resolve();  
            //         });  
            //     return deferred.promise();  
            // },  
            //时间点2：如果有分块上传，则每个分块上传之前调用此函数  
            beforeSend:function(block){  


                var deferred = WebUploader.Deferred();  
             
                if(block.chunk < 5){
                console.log(that.defaults.block_arry);
					deferred.reject(); 
					console.log("当前分片跳过了")
	            }
	            else{
                    deferred.resolve();  
                    console.log("当前分片上传中")
	            	
	            }
            	console.log(block.chunk)
                // var deferred = WebUploader.Deferred();  
                  
                // $.ajax({  
                //     type:"POST",  
                //     url:"<%=basePath%>Video?action=checkChunk",  
                //     data:{  
                //         //文件唯一标记  
                //         fileMd5:fileMd5,  
                //         //当前分块下标  
                //         chunk:block.chunk,  
                //         //当前分块大小  
                //         chunkSize:block.end-block.start  
                //     },  
                //     dataType:"json",  
                //     success:function(response){  
                //         if(response.ifExist){  
                //             //分块存在，跳过  
                //             deferred.reject();  
                //         }else{  
                //             //分块不存在或不完整，重新发送该分块内容  
                //             deferred.resolve();  
                //         }  
                //     }  
                // });
                if(block.chunk>0){
	                for(var i=0; i<7;i++){
	                	if(block.chunk == i){
	                		//分块存在，跳过  
							deferred.reject(); 
							console.log("当前分片跳过了")
	                	}
	                	else{
	                		//分块不存在或不完整，重新发送该分块内容  
	                        deferred.resolve();  
	                        console.log("当前分片上传中")
	                	}
	                }
	            }
                  
                // this.owner.options.formData.fileMd5 = fileMd5;  
                deferred.resolve();  
                return deferred.promise();  
            },  
            //时间点3：所有分块上传成功后调用此函数  
            // afterSendFile:function(){  
            //     //如果分块上传成功，则通知后台合并分块  
            //     $.ajax({  
            //         type:"POST",  
            //         url:"<%=basePath%>Video?action=mergeChunks",  
            //         data:{  
            //             fileMd5:fileMd5,  
            //         },  
            //         success:function(response){  
            //             alert("上传成功");  
            //             var path = "uploads/"+fileMd5+".mp4";  
            //             $("#item1").attr("src",path);  
            //         }  
            //     });  
            // }  
        });
		// 初始化Web Uploader
		video_uploader = WebUploader.create({

			//上传方式
			method: 'POST',

		    // 选完文件后，是否自动上传。
		    auto: false,

			// 分片上传
			chunked: true,

			// 超时
			timeout: 0,

			// 5MB/分片
			chunkSize: 5 * 1024 * 1024,

			// 网络问题，重传5次
			chunkRetry: 5,

			// 预处理下一片
			prepareNextFile: true,

		    // upload-field-name
		    fileVal: "filedata",//window.upload_data.data.field,

			// html5优先
			runtimeOrder: "html5",

		    // swf文件路径
		    swf: '/templates/pc/teach_cms/js/swf/Uploader.swf',

		    // 文件接收服务端。
		    server: upload_data.data.resumeUploadUrl,

		    //{int} [可选] [默认值：undefined] 验证文件总数量, 超出则不允许加入队列。
		    fileNumLimit: 1,

			//{int} [可选] [默认值：undefined] 验证单个文件大小是否超出限制, 超出则不允许加入队
			fileSingleSizeLimit: maxSize * 1024 * 1024 *1024,
		   
		    // 选择文件的按钮。可选。
		    // 内部根据当前运行是创建，可能是input元素，也可能是flash.
		    pick: '#video_upload',

			// 每次上传并发
			threads: 1,

		    // 只允许选择图片文件。
		    accept: {
		        title: 'video',
		        extensions: 'mp4,avi,flv',
		        mimeTypes: 'video/*'
		    }
		});
		
		// 上传文件到服务器前，会执行该事件
		// ============================
		// 第一个参数得到 file 文件
		// 第二个参数为上传文件的扩展参数(即需要扩展的字段名称)
		// 第三个是header参数
		video_uploader.on("uploadBeforeSend", function(__file, params, header){
			
			// 必需在上传文件前得到md5参数并发送
			params["md5"] = that.MD5;

			// 服务器要求从第 `1` 片开始
			params["chunk"] = __file.chunk + 1;

		});
	
	

		// ⚠️上传前需要验证服务器信息
		video_uploader.on('beforeFileQueued', function(file) {

			var vUpload = this;
			 // 初始化时长&显示"解析文件中"
	 		$(".parse_file").removeClass('hidden');
	 		$(".progress_precent").addClass('hidden');

			// 得到整个文件MD5
			vUpload.md5File(file).then(function(md5){

				// copy => that.MD5
				that.MD5 = md5;
				
				// 如服务器验证通过会执行 callback
				that.checkVideoDetail(md5, file, function(res){
					vUpload.upload();
				});

				// 视频开始上传显示总时长
		 		$(".parse_file").addClass('hidden');
		 		$(".progress_precent").removeClass('hidden');
			})

			// 选择文件前
	    	that.defaults.fileName = file.name;
	    	that.defaults.fileSize = file.size;
			that.videoFile = file;
			$("#course_title, .course_title").text(file.name);	// 显示选取的文件名

			// 转化
			var size2mb = parseInt(file.size/1024/1024, 10);
			if(size2mb > 0){
				$(".total_length").text(size2mb + "M");
			}
			else{
				$(".total_length").text("1M");
			}
		});
		

		// fileQueued
		video_uploader.on('fileQueued', function( file ) {
			$(".Video_choose").addClass('hidden');
			$(".video_agreement").addClass('hidden');// 隐藏上传协议
			$(".progress_box").removeClass('hidden');

			// 上传视频中点击取消弹出窗口提示的标志
			that.defaults.video_flag = true;

			// 上传视频中禁止a跳转
			$("a").click(function(event){
				// video_flag判断视频是否上传中(cancel会重新赋值)
				if(that.defaults.video_flag){
					// 防止页面跳转中断视频上传=>a链接点击的状态
					that.defaults.a_click = true;
					if(!($(this).attr("target") == "_blank")){

						if($(this).text() == "微信客服") return false;
						if($(this).hasClass('ht_download')) return false;

						var href = $(this).attr("href");
						var elment = $(this)
						$(this).attr("href","javascript:void(0)");
						$(".is_cancel_upload").removeClass('hidden');
						// 确认取消
					    $(".sure_upload").click(function(){  
					    	// 由页面a链接跳转而发起的“是否取消上传视频”      	
							if(that.defaults.a_click){
					        	$(".is_cancel_upload").addClass('hidden');
					        	window.location.href = href;
						    }
					    });
				        // 否定取消
				        $(".cancel_upload").click(function(){
				        	$(".is_cancel_upload").addClass('hidden');
				        	elment.attr("href",href);
	    					// 防止页面跳转中断视频上传=>a链接点击的状态
				        	that.defaults.a_click = false;
				        })
					}
				}
			})
		});


		// 进度条(不能开fiddler，上传数据显示会出现异常)
		video_uploader.on( 'uploadProgress', function(file, percentage) {
			that.upload_progress(file, percentage);
		});

		// md5验证，无重复上传时，上传成功
		video_uploader.on( 'uploadSuccess', function(file, response) {
			if(response.code == 0){
				that.defaults.video_flag = false;         // 视频上传中取消时提示窗口的弹出标志

				$(".progress_box").addClass('hidden');
				// $(".course_title").text(file.name); 					// 显示上传完成后提示的文件名
				$(".progress_number").text(parseInt(1*100)+"%");		// 总长度100%

				// 小于1M的视频，显示1M
				if(parseInt(file.size/1024/1024)>0){
					$(".current_progress").text(parseInt(file.size/1024/1024)+"M/");	// 上传完成
					$(".total_length").text(parseInt(file.size/1024/1024)+"M");
				}
				else{
					$(".current_progress").text("1M/");					// 上传完成
					$(".total_length").text("1M");
				}

				$(".progress_success_box").removeClass('hidden');
	 		    that.defaults.video_id = response.data.videoId;			// video_id不为空时才能保存
	 		    that.defaults.videoDuration = response.data.duration;	// 传总时长
	 		}
	 		else{
	 			alert("上传失败，请重试")
	 			that.defaults.video_flag = false;         // 视频上传中取消时提示窗口的弹出标志
	 		}
		});

		// 上传出错清空队列
		video_uploader.on('uploadError', function(file, response  ) {
	    	// var _file = (video_uploader.getFiles());
	    	// // 清空队列
	        // for(var i = 0 ;i<_file.length;i++){
	        //     //从队列中移除掉
	        //     video_uploader.removeFile(_file[i],true);
	        // }
		});

		// 取消上传&清空队列
	   	$(".progress_box").on('click', '.upload_cancel', function() {
	    	// var _file = (video_uploader.getFiles());
	    	// 清空队列
	        // for(var i = 0 ;i<_file.length;i++){
			// 	//取消文件上传
	        //     video_uploader.cancelFile(_file[i]);
	        //     //从队列中移除掉
	        //     video_uploader.removeFile(_file[i],true);
	        // }

			// 防止页面跳转中断视频上传=>a链接点击的状态
	        that.defaults.a_click = false;  
	        // 弹出取消确认窗口
	        $(".is_cancel_upload").removeClass('hidden');
	        // 确认取消
	        $(".sure_upload").click(function(){        	
				// 移除 & 清空队列
				video_uploader.cancelFile(that.videoFile);
				video_uploader.removeFile(that.videoFile, true);
				that.videoFile = null;

				// UI
		    	$(".progress_box").addClass('hidden');
		    	$(".Video_choose").removeClass("hidden");
		    	$(".video_agreement").removeClass('hidden');// 显示上传协议

		    	// 初始化
		    	that.upload_reset();
				that.defaults.video_flag = false;         // 视频上传中取消时提示窗口的弹出标志
	        	$(".is_cancel_upload").addClass('hidden');
	        });
	        // 否定取消
	        $(".cancel_upload").click(function(){
	        	$(".is_cancel_upload").addClass('hidden');
	        })
		})

		// copy.
		that.videoUploader = video_uploader;

 	},

 	// 上传进度(进度条)
 	upload_progress: function(file, percentage){
		$(".progress_value").width(parseInt(percentage*100)+"%");					// 进度条
		$(".progress_number").text(parseInt(percentage*100)+"%");				    // 进度条数值
		$(".current_progress").text(parseInt(file.size/1024/1024*percentage)+"M/");	// 当前进度
 	},

 	// 初始化
	upload_reset: function(){
		// 初始化上传中进度条&显示上传已完成提示
		$(".progress_box").addClass('hidden');	
		$("#course_title").text("");
		$(".progress_value").width("0%");
		$(".progress_number").text("0%");	
		$(".current_progress").text("0M/");
		$(".progress_box .total_length").text("0M");
	},

	//入口
	init: function(){
		var that = this;
		that._copy();
		that.isMac();
		that.reBind();
		that.bindEvents();
		that.postVal();
		that.showTime();
		that.isFirst();
		that.showEndTime();
		that.imageUpload();
		that.defaultsEvent();
		that.video_upload();
	}
};

$(function(){
	HTKJ.course.init();
});
