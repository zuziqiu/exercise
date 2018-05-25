/**
 * plugins 工具
 */
(function(win) {
	// body...
	// 在线用户
	var modOnlines = {
	    defaults: {
	        isRender: false,
	        gag_id: "" //被禁言的ID
	    },
	    robot: [],
	    rbtotal: 0,
	    memberList: {},
	    _count:'',

	    // emit onlines
	    getOnlines: function(callback){
	        if(this.defaults.isRender){
	            return false;
	        }
	        HTSDK.room._HT.emit("member:list", {"page": 1, "size": 100}, function(list){
	            if(typeof callback === "function"){
	                callback(list);
	            }
	        });
	    },

	    // 在线人数
	    total: function(count){

	    	// 
	    	if(window.partner_id == "11234"){
	    		return;
	    	}

	        var $member = $("#members"),
	            isAdmin = HTSDK.room.isAdmin();

	        HTSDK.modOnlines._count = count;
	        if(isAdmin){
	            //加特殊用户
	                var _count = count+this.rbtotal;
	                $member.show().html("("+_count+")");
	                if(MT.tools.in_array(window.partner_id, zhiPin)){
	                    $(".tab_n2 span").html("用户");
	                    $member.show().html("("+_count+")");
	                }   
	               
	        }else{
	            if(MT.tools.in_array(window.partner_id, zhiPin)){
	                $(".tab_n2 span").html("用户");
	            }
	            $member.remove();
	        }

	    },
	    // 渲染用户
	    renderList: function(list){
	        // 已渲染用户列表?
	        if(!list){
	            return false;
	        }
	        if(this.defaults.isRender){
	            return false;
	        }
	        var ulist = {};
	        if(list){
	            ulist = list;
	        }else{
	            ulist = this.memberList;
	        }
	        // 插入
	        var _tplData = {},
	            tpl_userlist = "";
	        for (var i = 0, j = ulist.length; i < j; i++) {
	            _tplData = {
	                me: MT.me.xid == ulist[i].xid ? "self" : "",
	                d: ulist[i],
	                me_role: MT.me.role,
	                isShowPrivate: HTSDK.privateChat.isShowPrivate(ulist[i].xid,ulist[i].role),
	                avatar: HTSDK.room.setAvatar(ulist[i])
	            };

	            //分组,助教只能看老师和自己一组的学员
	            if(HTSDK.room.isGroups(ulist[i].gid)){
	                tpl_userlist += template("tpl_append_oneuser", _tplData); 
	            } 
	         };

	        // render
	        $("#mod_member_list").append(tpl_userlist);

	        if(MT.me.role == "admin" && ulist.length >= 99){
	            $("#mod_member_list").append("<a class='detail_all'>查看全部</a>");
	        }
	          
	        this.defaults.isRender = true;  
	        //初始化将被禁言用户的标识显示出来
	        if( MT.me.role == "admin" || MT.me.role =="spadmin"){
	            $("#mod_member_list").find('li').each(function(i,e){
	                $(e).find('.grant').each(function(k,el){
	                    if($(el).data("chat") == 0){
	                        $(this).addClass("ban");
	                    }
	                });
	            });
	        }

	        //xin -初始化语音加载后的处理用户
	        if(this.defaults.isRender && $("#mod_col_right").hasClass('has_voice')){
	            //处理初始化列表
	            var val = HTSDK.voice.vmode;
	            HTSDK.voice.resetStuViews(val);
	            //初始化 - 多用户加入
	            if( MT.me.role == "admin" || MT.me.role =="spadmin"){
	                $("#mod_member_list").find('li').each(function(i,e){
	                    $(e).find('.grant').each(function(k,el){
	                        if($(el).data("chat") == 0){
	                            $(this).addClass("ban");
	                        }
	                        if( $(el).data("voice") == 1){
	                            $(el).parents().find("#voenable").addClass("voice_disable");
	                        }
	                    });
	                });
	            }
	        }

	        //加载
	        if(MT.tools.in_array(window.partner_id, zhiPin)){
	            $("#mod_member_list .role_admin").find('.role_tip').html('嘉宾');
	            $("#mod_member_list .role_spadmin").find('.role_tip').html('主讲人');
	        }
	    },
	    // 插入用户排序
	    sortUser: function(user, tpl){
	        var $memberlist = $("#mod_member_list"),
	            role = user.role;
	        // 超级管理员
	        if(role === "spadmin"){
	            $memberlist.prepend(tpl);
	            return false;
	        }
	        // 管理员
	        else if(role === "admin"){
	            if($memberlist.find(".role_spadmin").size() > 0){
	                $memberlist.find(".role_spadmin").after(tpl);
	            }else{
	                $memberlist.prepend(tpl);
	            }
	        }
	        //honorguest嘉宾
	        /*else if (role === "honorguest") {
	            if($memberlist.find(".role_admin").size() > 0){
	                $memberlist.find(".role_admin").after(tpl);
	            }else{
	                $memberlist.prepend(tpl);
	            }
	        }*/
	        else{
	            $memberlist.append(tpl);
	        }
	    },
	    // 用户离线
	    memberLeave: function(user) {
	        // 普通用户
	        if($('#user_'+user.xid).size() > 0){
	            $('#user_'+user.xid).remove();
	        }
	        // 语音用户
	        if($("#voice_user_"+user.xid).size() > 0){
	            $("#voice_user_"+user.xid).remove();
	        }
	    },

	    // 禁止/允许发言
	    chatAccess: function(flag, retval){
	        // 是否本人
	       /* if(MT.me.xid == retval.xid){
	            //系统消息
	            HTSDK.tools.chatNotify('通知：你已被管理员禁止文字聊天。');
	        }*/

	        if(MT.me.xid != retval.xid && flag){
	            $(".chat_"+retval.xid).remove();
	            $(".que_"+retval.xid).remove();
	        }
	        
	        // 管理员
	        if(MTSDK.admin.isAdmin()){
	            if(!flag){
	                HTSDK.tools.chatNotify('通知：['+retval.nickname+']已被管理员允许文字聊天。');
	            }else{
	                MTSDK.admin.adminDo.disableChat(retval.xid);
	                HTSDK.tools.chatNotify('通知：['+retval.nickname+']已被管理员禁止文字聊天。');
	                var  banUserXids =  JSON.parse(sessionStorage.getItem("banUserXids"));
	                if(banUserXids){
	                    MTSDK.admin.adminDo.banUserXids = banUserXids;
	                }
	                //存储被禁言的用户xid集合
	                if(!MTSDK.admin.adminDo.banUserXids[retval.xid]){
	                    MTSDK.admin.adminDo.banUserXids[retval.xid] = retval.xid;
	                    sessionStorage.setItem("banUserXids",JSON.stringify(MTSDK.admin.adminDo.banUserXids));
	                }
	            }
	            
	            //系统消息
	        }
	    },
	    // 踢出房间
	    memberkick: function(retval){
	        //系统消息
	        HTSDK.tools.chatNotify('通知：['+retval.nickname+'] 已经被管理员踢出房间。');
	    },

	    memberJoin: function(user) {
	        var that = this,
	            $mcr = $("#mod_col_right"),
	            vmodeVal = HTSDK.voice.vmode,
	            chatEnable = user.member.chat.grant,
	            voiceEnable = user.member.voice.grant;
	       
	        // 普通用户
	        if($("#user_"+user.member.xid).size() === 0){
	            var _tplData = {
	                d: user.member,
	                isShowPrivate: HTSDK.privateChat.isShowPrivate(user.member.xid,user.member.role),
	                avatar: HTSDK.room.setAvatar(user.member)
	            };
	             
	            //66666
	            var tplMember = template("tpl_append_oneuser", _tplData);

	             //除老师外,判断是否为一组
	            if(MT.me.gid && user.member.gid != 0){
	                if(MT.me.gid == user.member.gid){
	                    that.sortUser(user.member, tplMember);
	                }
	            }else{
	                that.sortUser(user.member, tplMember);
	            }

	            //除老师外,判断是否为一组
	        /*    if(MTSDK.room.isGroups(user.member.gid)){
	                that.sortUser(user.member, tplMember);
	            }
	            */

	            if(user.member.chat.enable ==0){
	                $("#user_"+user.member.xid).find(".grant").addClass("ban");
	            }
	            
	            // 插入语音用户
	            if(MTSDK.admin.isAdmin(user.member.role) && vmodeVal == 1){
	                var tplVoiceChairman = template("tpl_voice_chairman_addone", _tplData);
	                $("#voice_list").append(tplVoiceChairman);
	            }

	            /*chat{
	                enable: 0/1  {0: 默认状态, 1: 允许}
	                grant:  0/1  {0: 正常状态, 1: 被禁}
	            }*/
	            //xin -处理语音模式下，加入人员给加上P的样式
	            if( $mcr.hasClass('has_voice')){
	                //自由
	                if( vmodeVal == 0){
	                    $(".mod_members li").find('p').addClass('voice_enable');     
	                }
	                //xin -主席、麦序、举手初始化加入时
	                if( vmodeVal == 1 || vmodeVal == 2 || vmodeVal == 3){
	                    $(".mod_members .role_user").find("p").addClass("default");
	                }
	                //xin -被禁言且管理员才加进去
	                if( MT.me.role == "admin" || MT.me.role == "spadmin"){
	                    //单用户-加入
	                    if( chatEnable == 1){
	                        $('#user_'+user.member.xid).find(".grant").addClass("ban").html("禁言");
	                    }
	                    if( voiceEnable == 1){
	                        $('#user_'+user.member.xid).find("p").addClass('voice_disable');
	                    }
	                }
	            }   
	        }

	        //加载
	        if(MT.tools.in_array(window.partner_id, zhiPin)){
	            $("#mod_member_list .role_admin").find('.role_tip').html('嘉宾');
	            $("#mod_member_list .role_spadmin").find('.role_tip').html('主讲人');
	        }
	    },
	    // 设置rotbot
	    broadcastSetRobot: function(robot){
	        var _all = this._count,
	            _nownum = 0;
	        if( robot) {
	            _nownum = this.rbtotal;
	        }
	        var count = _all + _nownum;
	        $('.robot_user').remove();
	        $('#members').html("("+count+")");

	        if(robot.length>0){
	            this.robot = robot;
	        }else {
	            this.robot = robot.list;
	        }
	        
	        this.setRobotlist();
	    },

	    // 设置机器人
	    setRobotlist: function(){

	        var robotTemp = [],
	            shownum = 100 - this._count;

	        //优先显示真实用户
	        if( this._count >= 100 ){
	            return false;
	        }else if(shownum >= this.robot.length ){
	            robotTemp = this.robot;
	        }else {
	            //robotTemp = this.robot.splice(0, shownum);
	            for (var i = 0; i < shownum; i++) {
	                robotTemp.push(this.robot[i]);
	            };
	        }
	        // 特殊用户扩展
	        var isAdminFlag = MTSDK.admin.isAdmin() ? "--R" : "",
	            robList = template("tpl_robot_list", {
	                list: robotTemp,
	                role: MT.me.role,
	                isAdminFlag: isAdminFlag
	            });
	        
	        // append rotbot
	        $('#mod_member_list').append(robList);
	    },

	    init: function(list){
	        this.memberList = list;
	    }
	};
	// 暴露
	var HTSDK = win.HTSDK || {};
	HTSDK.modOnlines = modOnlines;
	
})(window);
