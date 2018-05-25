/**
 * pop_dialog.js
 * Donson
 * v1.03
 * Last edit 2012.05.14
 */

;(function($){
$.fn.extend({
    pop_dialog : function(options){
        var _this = this;
        _this.each(function(index,El){
            new popDialog(options,_this);
        });
        return false;
    },
    pop_close : function(id){
        $('#'+id).remove();            
        popCloseOverlay();
        $('body').data('cur_dialog',null);
        return false;
    },
    pop_reset : function(idName,target,width,height,left){
        popReset(idName,target,width,height,left);
        return false;
    },
    pop_close_all : function(){
        var _popw = $('#pop_dialogs');
        $('.pop_dialog',_popw).remove();
        $('body').data('cur_dialog',null);
        popCloseOverlay();
        return false;
    },
    pop_alert : function(options){
        popAlert(options,this);
        return false;
    },
    pop_confirm : function(options){
        popConfirm(options,this);
        return false;
    }
});
})(jQuery);
function popDialog(options,_this){
    this._ts = $(_this);
    this.opt = {};
    var fun = function(){};
    this.dialog_src = '';
    //默认参数
    this.defaults = {
        type    : 'common',
        position: 'down', //定位方向:center/down/left
        width   : 350,
        height  : 180,
        top     : 0,
        left    : 0,
        id      : '',
        cls     : '',
        title   : '标题',
        content : '',       //html代码
        url     : '',       //iframe地址，比content优先
        disclose    : false,//是否隐藏关闭按钮
        overlay     : false,
        afterShow   : fun
    };
    this.init(options);
}

popDialog.prototype.init = function(options){
    var _t = this;
    _t.cur_dialog = $('body').data('cur_dialog');
    _t.opt = $.extend({}, _t.defaults, options || {});
    if(_t.opt.id == ''){
        //自动设置id
        _t.opt.id = 'pop_dialog_' + (new Date()).valueOf();
    }
    _t.opt.target = this._ts;
    _t.html = '';

    if(_t.cur_dialog == _t.opt.id){
        return;
    }else if(_t.cur_dialog != null){
        $('#'+_t.cur_dialog).remove();
    }

    //if page
    if(_t.opt.url != ''){
        _t.opt.content = '<img src="'+_t.dialog_src+'loading.gif" class="pd_loading" width="32" height="32" />'
    }

    //定位
    _t.position(_t.opt.position);

    if(_t.opt.position == 'center' || _t.opt.position == 'center2' || _t.opt.position == 'center3' || _t.opt.overlay == true){
        _t.overlay();
    }

    //内容类型
    this[this.opt.type]();
}
//定位
popDialog.prototype.position = function(pos){
    var _t = this;
    //判断窗口大小，执行页面滑动
    var w_width = _t.opt.width;
    var w_height = _t.opt.height;
    var win_height = $(window).height();
    var win_scrtop = $(window).scrollTop();
    if(_t.opt.type == 'common'){
        w_width = w_width + 6;
        w_height = w_height + 42;
    }
    var w_top,w_left;
    _t.w_style = 'width:'+w_width+'px;height:'+w_height+'px;';

    if(pos == 'center'){
        var mat = -(w_height/2 + 25);
        if ('undefined' == typeof(document.body.style.maxHeight)) {
        /*if($.browser.msie && $.browser.version == '6.0' ){*/
            mat += (win_scrtop - 25);
            _t.w_style += '_position:absolute;top:50%;left:50%;margin:'+mat+'px 0 0 -'+w_width/2+'px;';
        }else{
            _t.w_style += 'position:fixed;top:50%;left:50%;margin:'+mat+'px 0 0 -'+w_width/2+'px;';
        }
    }else if(pos == 'center2'){
        var offset = _t._ts.offset();
        w_top = offset.top + _t.opt.top;
		if(w_top < 100){
			 w_top = offset.top + _t.opt.top + 200;
        	_t.w_style += 'top:'+w_top+'px;left:50%;margin: 0 0 0 -'+w_width/2+'px;';
		}else{
			_t.w_style += 'top:'+w_top+'px;left:50%;margin: 0 0 0 -'+w_width/2+'px;';
		}
    }else if(pos == 'center3'){
        var mat = -(w_height/2);
        if ('undefined' == typeof(document.body.style.maxHeight)) {
        /*if($.browser.msie && $.browser.version == '6.0' ){*/
            mat += (win_scrtop);
            _t.w_style += '_position:absolute;top:50%;left:50%;margin:'+mat+'px 0 0 -'+w_width/2+'px;';
        }else{
            _t.w_style += 'position:fixed;top:50%;left:50%;margin:'+mat+'px 0 0 -'+w_width/2+'px;';
        }
    }else{
        var offset = _t._ts.offset();
        if(pos == 'left'){
            w_top = offset.top + _t.opt.top;
            w_left = offset.left+ _t.opt.left + 10;
        }else{
            w_top = offset.top + _t.opt.top - 10;
            w_left = offset.left + _t.opt.left;
        }
        _t.w_style += 'top:'+w_top+'px;left:'+w_left+'px;';

        if(w_height - win_height > 0){
            //当窗口少于弹窗高度时，弹窗上留50px
            var scrtop = w_top-40 - win_scrtop;
            //popToTop(scrtop,win_scrtop);
        }else if(win_scrtop > w_top){
            var scrtop = w_top-40 - win_scrtop;
            //popToTop(scrtop,win_scrtop);
        }else if(w_height + w_top - win_height - win_scrtop > 0){
            //当弹窗显示不完时，窗口滑动让弹窗居中显示
            var scrtop = w_top + w_height/2 - win_height/2 - win_scrtop;
            //popToTop(scrtop,win_scrtop);
        }
    } 
    _t.c_style = 'width:'+_t.opt.width+'px;height:'+_t.opt.height+'px;'; 
    _t.cr_style = 'height:'+_t.opt.height+'px;'; 

}
//关闭
popDialog.prototype.close = function(){
    var _t = this;
    $('#'+_t.opt.id).remove();            
    popCloseOverlay();
    $('body').data('cur_dialog',null);
}
popDialog.prototype.common = function(){
    var _t = this;
    //close_button
    var close_html = _t.opt.disclose?'':'<span class="pd_close" href="#" title="关闭">关闭</span>'; 
    //pop_dialog html
    _t.html = '\
        <div class="pop_dialog '+_t.opt.cls+'" style="'+_t.w_style+'" id="'+_t.opt.id+'">\
            <div class="pd_header"><div class="pd_tl"></div>\
                <div class="pd_tc"><h5>'+_t.opt.title+'</h5>'+close_html+'</div><div class="pd_tr"></div>\
            </div>\
            <div class="pd_mainw">\
                <div class="pd_main" style="'+_t.c_style+'">\
                '+_t.opt.content+'\
                </div>\
                <div class="pd_mainr" style="'+_t.cr_style+'"></div>\
            </div>\
            <div class="pd_footer"><div class="pd_bl"></div><div class="pd_bc"></div><div class="pd_br"></div></div>\
        </div>';
    //渲染
    _t.render();
}
popDialog.prototype.content = function(){
    var _t = this;
    //pop_dialog html
    _t.html = '\
        <div class="pop_dialog '+_t.opt.cls+'" style="'+_t.w_style+'" id="'+_t.opt.id+'">\
            '+_t.opt.content+'\
        </div>';

    //渲染
    _t.render();
}
//渲染
popDialog.prototype.render = function(){
    var _t = this;
    $('body').data('cur_dialog',_t.opt.id);

    //append html to pop_dialogs
    var _popw = $('#pop_dialogs');
    if(!_popw.get(0)){
        $('body').append('<div id="pop_dialogs"></div>');
    }
    $('#pop_dialogs').append(_t.html);

    //滑动方向
    if(_t.opt.position == 'left'){
        $('#'+_t.opt.id).animate({
            left : '-=10px'
        },300,'',function(){
            _t.opt.afterShow(_t.opt, _t);
        });
    }else if(_t.opt.position == 'down'){
        $('#'+_t.opt.id).animate({
            top : '+=10px'
        },300,'',function(){
            _t.opt.afterShow(_t.opt, _t);  
        });
    }else{
        _t.opt.afterShow(_t.opt, _t);
    }
    //bind close
    $('#'+_t.opt.id+' .pd_close').click(function(){
        _t.close();
        return false;
    });
    //if page
    setTimeout(function(){
        if(_t.opt.url != ''){
            $('#'+_t.opt.id+' .pd_main').html('<iframe width="100%" height="100%" id="'+_t.opt.id+'_iframe" src="'+_t.opt.url+'" frameborder="0" scrolling="no"></iframe>'); 
        }
    },500);
}
popDialog.prototype.overlay = function(options){
    var _t = this;
    var overlay = $('#pop_overlay');
    var scrollHeight = window.document.body.scrollHeight;
    var over_style = 'height:'+scrollHeight+'px;';

    if(!overlay.get(0)){
        if ('undefined' == typeof(document.body.style.maxHeight)) {
        /*if($.browser.msie && $.browser.version == '6.0' ){*/
            over_style += 'background:#000000;filter:alpha(opacity=50);position:absolute;';
        }else{
            over_style += 'background:url('+_t.dialog_src+'dl_over.png);';
        }
        $('body').append('<div id="pop_overlay" style="'+over_style+'"></div>');
        $('select').css('visibility','hidden');
    }

    /*$('#pop_overlay').click(function(){
        $(this).pop_close_all();
        return false;
    });*/
    return false;
}
var popAlert = function(options,_this){
    var defaults = {
        width : 280,
        height : 100,
        top : 14,
        id : 'pop_alert',
        title : '提示',
        position :'center',
        btn : '确定',
        afterShow : function(){
            var _pa = $('#pop_alert');
            $('.pd_btn',_pa).click(function(){
                $(this).pop_close('pop_alert');
            });
        }
    }
    options = $.extend({}, defaults, options || {});
    var h = options.height - 58;
    options.content = '<div class="palert_con '+options.cls+'"><div class="palert_conw" style="padding:15px 11px 10px;height:'+h+'px;line-height:19px;color:#555555;">'+options.msg+'</div><div class="pop_btns"><span class="pd_btn">'+options.btn+'</span></div></div>';
    new popDialog(options,_this);
}

var popConfirm = function(options,_this){
    var defaults = {
        width : 280,
        height : 100,
        top : 14,
        id : 'pop_confirm',
        title : '提示',
        position :'center'
    }
    options = $.extend({}, defaults, options || {});
    var h = options.height - 58;
    options.content = '<div class="palert_con"><div class="palert_conw" style="padding:15px 11px 10px;height:'+h+'px;line-height:19px;color:#555555;">'+options.msg+'</div><div class="pop_btns"><span class="pd_btn2">取消</span><span class="pd_btn">确定</span></div></div>';
    options.afterShow = function(opt){
        //options.afterShow(opt);
        $('#'+opt.id).find('.pd_btn').click(function(){
            try{
                options.confirm(opt);
            }catch(e){}
        });
        $('#'+opt.id).find('.pd_btn2').click(function(){
            $(this).pop_close(opt.id);
            try{
                options.cancel(opt);
            }catch(e){}
        });
    }
    new popDialog(options,_this);
}


//windowResize
var wResize = function(){
    var resize_s = null;
    $(window).resize(function(){
        if(resize_s){clearTimeout(resize_s);}
        resize_s = setTimeout(function(){
            var _ts = $(this); 
        },500);
    });
}
var popCloseOverlay = function(){
    $('#pop_overlay').remove();
    $('#box_pop_cover').hide();
    $('select').css('visibility','visible');
}
//popReset
var popReset = function(id,target,width,height,_left){
    var _id = $('#'+id);
    var $tg = target;
    if(_id.size() === 0){
        $('body').append('<div id="'+id+'" class="mod_'+id+'" style="width:'+width+'px;height:'+height+'px"><span class="cner"></span></div>');
    }
    //if(!_ts.get(0)){return false;}
    var _ts = $('#'+id);
    //目标元素位置
    var _ts_top = target.offset().top;
    var _ts_left = target.offset().left;
    var _optLeft = 10;
    //目标元素大小
    var _ts_width = _ts.width();
    var _ts_height = _ts.height();
    // win postion
    var _win = $(window);
    var win_height = _win.height();
    var win_scrtop = _win.scrollTop();
    /*if(height+42 - win_height > 0){
        //当窗口少于弹窗高度时，弹窗上留50px
        var scrtop = _ts_top-50 - win_scrtop;
        popToTop(scrtop,win_scrtop);
    }else if(height+42 + _ts_top - win_height - win_scrtop > 0){
        var scrtop = _ts_top + height/2+21 - win_height/2 - win_scrtop;
        popToTop(scrtop,win_scrtop);
    }*/
    //left重置
    if(_left){
        if(_left > 0){
            _optLeft = _left;
        }
    }
    //元素重新定位
    $('#'+id).css({
        top: _ts_top-_ts_height-8,
        left: _ts_left-_optLeft
    });
}
//页面滑动
var popToTop = function(h,s){
    var nav_t = 0;
    var nav_d = 30;  //速度
    var nav_c = h;   //高度
    var nac = $(window);
    var popSc = function(t,b,c,d){
        return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
    }
    function down(){
        if(nav_t<nav_d){
            nav_t++;
            nac.scrollTop(Math.ceil(popSc(nav_t,0,nav_c,nav_d))+s);
            setTimeout(down, 10);
        }
    }
    down();
};

