define(function(require, exports, module){
    
    var tmod = require('TMOD');
    var moduleSetting = require('./module_setting.js');

    var class_preview = {
        m : 1800 ,     //距离直播开始前最大时间 30分钟
        s : 60 ,          //不足一分钟的剩余秒数
        lastMinNumber : 0,
        timer : null,     //定时器
        isDown : false,   //为true，预告的课程开始时间到了。
        isLastMin : false,//为true,是倒计时的最后一分钟
        isRender : false, //为true,模版渲染数据
        isStart : '',
        courseData : null,  //预告的课程的信息
        tpl : false,      //为true,模版已经存在页面上  --> 配合cmd，防止异步渲染模版出错
        cmd : false,      //为true,数据已经获取        --> 配合tpl，防止异步渲染模版出错
        classTime : null ,
        targets : null ,
        pptId : 'pptImage',  //ppt图片的ID
        pptEnable : '0',
        liveStatus : 'await',  //直播状态初始值
        heartBeatType : '',
        isInit : false,
        
        //外部方法，异步调用
        classIntroAsync : function(type,data,callback){
            if(type === 'tplReady'){
                this.tpl = true;
            }else if (type === 'dataReady'){
                if(data){
                    this.courseData = data ;
                    // console.log(this.courseData)
                }
                this.cmd = true;
            }
            this.doReady();
        },
        //异步调用完成执行
        doReady : function(){
            if(this.tpl && this.cmd){
                if(!this.isRender) {
                    this.isRender = true;
                    // this.downTime();
                    // console.log('doReady');
                    this.init();
                }
            }
        },
        //模版渲染数据
        renderAll : function(){
            var html = tmod("tpl_class_preview", {data:this.courseData}),
                that = this;
                //模版插入点
            $("#mod_ppt").append(html);
        },
        //计算节点时间(预告开始时间，直播开始时间，直播结束时间)
        calcClassTimePoint : function(){

            var previewTimePoint = (parseInt(this.courseData.start_time) - this.courseData.prefix_time) * 1000;
            //直播开始时间点毫秒数
            var startTimePoint = parseInt(this.courseData.start_time) * 1000;
            //直播结束时间点毫秒数
            var endTimePoint = parseInt(this.courseData.end_time) * 1000;

            this.classTime = {
                previewTimePoint : previewTimePoint,
                startTimePoint : startTimePoint,
                endTimePoint : endTimePoint
            }
        },
        //获取当前时间
        getNowTimePoint : function(){
            return new Date().getTime();
        },
        //倒计时
        downTime : function(callback){
            // console.log('downTime')
            var that = this,
                min = this.covertSecToMin(this.courseData.info.timeToStart),
                s = this.s,
                isDown = this.isDown,
                $previewTimeStart = this.targets.$previewTimeStart;
            $previewTimeStart.html(min);
            clearInterval(this.timer);
            this.timer = setInterval(function(){

                if(!that.isLastMin && min === 1) {
                    that.isLastMin = true;
                    s = that.lastMinNumber ;
                    min = 0;
                }
                // console.log(s);
                if(s <= 0){
                    // console.log('s=0')
                    // console.log(min,'min')
                    
                    if(min > 1) {
                        min -- ;
                        s = 60 ;
                    }else if(min === 0){
                        clearInterval(that.timer);
                        isDown = true;
                        // console.log('倒计时结束，直播开始时间到');
                        that.hideDownTime();
                        return false;
                    }
                    $previewTimeStart.html(min)
                }
                s -- ;

                
            },1000)
        },
        //秒数转分钟数（向上去整）
        /**
         * @return {Number} 分钟数  缓存剩余秒数到this.lastMinNumber
         */
        covertSecToMin : function(second){
            if(second === 0) {
                this.s = 0;
                return 0;
            }
            if(second > 60){
                this.lastMinNumber = second % 60 ;
                // console.log(this.lastMinNumber)
                return (Math.ceil(second / 60)) ;
            }else if (second < 60) {
                
                this.lastMinNumber = second ;
                // console.log(this.lastMinNumber)
                return 1 ;
            }
        },
        //时间节点逻辑
        timePoint : function(){
            var timeToStart = this.courseData.info.timeToStart,
                m = this.m ,
                nowTimePoint = this.getNowTimePoint();
                endTimePoint = this.courseData.end_time * 1000;
                // console.log(timeToStart)
            if(timeToStart <= m && nowTimePoint < endTimePoint){
                this.showClassPreview();
                this.showDownTime();
                this.downTime();
            }
        },
        //获取相关目标对象
        getTargets : function(){
            this.targets = {
                //预告窗根元素
                $previewMaskOuter : $('.preview_mask_outer'),
                //课程预告
                $previewMask : $('.preview_mask'),
                //课程结束的时候弹出的预告
                $previewMaskOver : $('.preview_mask_over'),
                //时间倒计时文字和数字
                $previewDowncount : $('.preview_downcount'),
                //时间倒计时数字
                $previewTimeStart : $('.preview_time_start')
            }
        },
        isShowPreview : function(param){
            // console.log(param)
        },
        showClassPreview : function(){
            this.targets.$previewMaskOver.addClass('hidden');
            this.targets.$previewMaskOuter.removeClass('hidden');
            this.targets.$previewMask.removeClass('hidden');
            if(this.pptEnable === '1') {
                $('#' + this.pptId).show();
            }
        },
        hideClassPreview : function(){
            this.targets.$previewMaskOuter.addClass('hidden');
            this.targets.$previewMask.addClass('hidden');
            this.targets.$previewMaskOver.addClass('hidden');
            if(this.pptEnable === '1') {
                $('#' + this.pptId).hide();
            }
        },
        showClassPreviewEnd : function(){
            // console.log(this.targets)
            this.targets.$previewMask.addClass('hidden');
            this.targets.$previewMaskOuter.removeClass('hidden');
            this.targets.$previewMaskOver.removeClass('hidden');
            if(this.pptEnable === '1') {
                $('#' + this.pptId).hide()
            }
        },
        hideClassPreviewEnd : function(){
            this.targets.$previewMask.addClass('hidden');
            this.targets.$previewMaskOuter.addClass('hidden'); 
            this.targets.$previewMaskOver.addClass('hidden');
            if(this.pptEnable === '1') {
                $('#' + this.pptId).hide()
            }
        },
        showDownTime : function(){
            this.targets.$previewDowncount.removeClass('hidden');
        },
        hideDownTime : function(){
            this.targets.$previewDowncount.addClass('hidden');
        },
        //监听心跳数据
        isHeartBeat : function(type){

            if(this.isInit) {
                this.heartBeat(type);
            }else {
                this.heartBeatType = type;
            }

        },
        heartBeat : function(type){
            // if(this.isStart == '') {
            //     this.isStart = type
            // }else {
                // if(type) {
                //     this.isStart = type;
                // }
                //此处重新方法可以去掉
                if(type === 'start'){
                    this.hideClassPreview();
                    this.hideClassPreviewEnd();
                    this.liveStatus = 'start';
                    this.heartBeat = function(type){
                        if(type == 'start'){
                            this.hideClassPreview();
                            this.hideClassPreviewEnd();
                            this.liveStatus = 'start';
                        }else if(type === 'stop'){
                            if(this.liveStatus === 'await') {
                                return false;
                            }
                            this.showClassPreviewEnd();
                        }
                    }
                }
                if(type === 'stop'){
                    // if(this.liveStatus === 'await') {
                    //     return false;
                    // }
                    // this.showClassPreviewEnd();
                    this.heartBeat = function(type){
                        // console.log(type)
                        if(type == 'start'){
                            this.hideClassPreview();
                            this.hideClassPreviewEnd();
                            this.liveStatus = 'start';
                        }else if(type === 'stop'){
                            if(this.liveStatus === 'await') {
                                return false;
                            }
                            this.showClassPreviewEnd();
                        }
                    }
                }
            // }
        },
        setPpt : function(){
            /**
             * moduleSetting = {
             *      pptEnable :  '1',    或者 '0',
             *      pptImage  : 'imageUrl'   或者 ''
             *  }
             */
            var modulePptImage = moduleSetting.hasPpt(HTSDK.getModules());
            if(modulePptImage && modulePptImage.pptEnable === '1' && modulePptImage.pptImage) {
                //ppt区域
                this.pptEnable = modulePptImage.pptEnable ;
                var image = new Image();
                image.src = modulePptImage.pptImage;
                image.id = this.pptId;
                image.style.position = 'absolute';
                image.style.left = '0';
                image.style.top = '0';
                image.style.width = $(".mod_ppt").width() + 'px';
                image.style.height = $(".mod_ppt").height() + 'px';
                image.style.display = 'none';
                image.style.zIndex = '99999';
                $('.mod_ppt').append(image);
            }
        },
        init : function(){
            this.setPpt();
            this.renderAll();
            this.getTargets();
            this.calcClassTimePoint();
            this.timePoint();
            if(this.heartBeatType){
                this.heartBeat(this.heartBeatType);
            }else {
                this.isInit = true;
            }
        }
    }


    module.exports = class_preview;
})