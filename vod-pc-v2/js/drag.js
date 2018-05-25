var drag = function(){
    this.body = document.body;
    this.zIndex_array = [];
    this.drag_array = [];
    this.handle = null;
    this.limit_drag = null;
    this.select_lock = false;
    this.inspect_move_pop_lock = true;
    this.inspect_handle_lock = true;
};

drag.prototype = {
    // 注册拖动元素
    on: function(){
        var that = this,
        element_array = null;
        if(Object.prototype.toString.call(arguments[0]) === "[object Array]"){
            element_array = arguments[0];
        };
        that.fetch(element_array, function(){
            that.body.addEventListener("mousedown", function(e){that.mouse_down(that, e)}, false);
        })
    },
    fetch: function(e, callback){
        var that = this;
        if(e.length > 0){
            e.forEach(function(item, index){
                var drag_object = {};
                if(item.move_pop){
                    // 移动盒子属性
                    drag_object["move_pop"]={};
                    drag_object["move_pop"]["className"] = item.move_pop.className.split(/\s/);
                    drag_object["move_pop"]["idName"] = item.move_pop.id || "";
                    if(item.backgroundColor){
                        drag_object["move_pop"]["bkColor"] = item.backgroundColor;
                    }
                }
                else{
                    console.error( "move_pop illegal =>", item);
                    return false;
                }
                if(item.handle){
                    // 手柄属性
                    drag_object["handle"]={};
                    drag_object["handle"]["className"] = item.handle.className.split(/\s/);
                    drag_object["handle"]["idName"] = item.handle.id || "";
                    if(item.limit_drag){
                        drag_object["handle"]["limit_drag"] = item.limit_drag;
                    }
                    item.handle.addEventListener("mouseenter", function(e){that.mouse_enter(that, e)}, false);
                    
                }
                else{
                    console.error( "handle illegal =>", item);
                    return false;
                }
                that.drag_array.push(drag_object);
            })
            if(typeof callback == "function"){
                callback();
            }
        }
    },
    // 暂时挂起销毁事件
    destroy: function(_boxs){

    },
    // 鼠标hover
    mouse_enter: function(that, ev){
        var that = this,
            a_flag = null;
            
        that.get_handle(ev.target);
        that.handle.style.cursor = "move";
        
        if(that.handle){
            var hover_div = document.createElement("div");
            hover_div.className = "hover_div";
            hover_div.style.width = that.handle.offsetWidth +"px";
            hover_div.style.height = that.handle.offsetHeight +"px";
            hover_div.style.position = "absolute";
            hover_div.style.top = "0px";
            hover_div.style.left = "0px";
            hover_div.style.cursor = "move";
            if(document.querySelectorAll(".hover_div").length == 0){
                that.get_parents(ev.target).forEach(function(item, index){
                    if(item.tagName == "A"){
                        a_flag = true;
                    }
                })
                ev.target.childNodes.forEach(function(item, index){
                    if(item.tagName == "A"){
                        a_flag = true;
                    }
                })
                if(a_flag){
                    setTimeout(function(){
                        that.handle.appendChild(hover_div);
                    },1000);
                }
                else{
                    // that.handle.appendChild(hover_div);
                }
            }
            //  目标绑定鼠标滑开
            that.out_shell = function(e){that.mouse_leave(that, e)}
            that.handle.addEventListener("mouseleave", that.out_shell, false); 
        }
    },
    mouse_leave: function(that, ev){
        // 锁起move_pop_lock结果，所有mousedown都要重新进行校验
        that.inspect_move_pop_lock = true;
        // 锁起handle_lock结果，所有mousedown都要重新进行校验
        that.inspect_handle_lock = true;
        if(document.querySelector(".hover_div")){
            document.querySelector(".hover_div").parentNode.removeChild(document.querySelector(".hover_div"));
        }
    },
    // 鼠标按下
    mouse_down: function(that, ev){
        that.disX = null;
        that.disY = null;
        // 初始化移动的盒子
        that.el = null;
        // 调用校验
        that.inspect_handle(that, ev);
        that.inspect_move(that, ev);
        
        if(that.inspect_handle_lock){
            return false;
        }
        else{
            if(that.inspect_move_pop_lock){
                return false;
            }
        }
        
        // 清除class (移动中不允许应用过渡属性，否则延迟卡顿)
        // if(el==vote_start||el==vote_end){
        //     el.setAttribute("class","");
        // }

        // 处理层级
        that.zIndex_deal(that.zIndex_array, that.el);

        var oEvent = null;
        oEvent = ev || window.event;
        // clientX 事件属性返回当事件被触发时鼠标指针向对于浏览器页面（或客户区）的水平坐标。
        // 没有已经定位的父元素，offsetLeft指向的是文档（document）的左边缘
        // dis = mouse position relative => move_element
        that.disX = oEvent.clientX - that.el.offsetLeft;  
        that.disY = oEvent.clientY - that.el.offsetTop;
        
        //  目标绑定鼠标移动
        that.move_shell = function(e){that.mouse_move(that, e)},
        document.addEventListener("mousemove", that.move_shell, false);  
        
        //  目标绑定鼠标松开
        that.up_shell = function(e){that.mouse_up(that, e)}
        document.addEventListener("mouseup", that.up_shell, false); 
    },
    // 鼠标移动
    mouse_move: function(that, ev){
        // 拖拽中不允许选中页面内容
        that.select_lock = true;
        that.ban_select();

        var oEvent = null;
        oEvent = ev||window.event;  
        var l = oEvent.clientX - that.disX;  
        var t = oEvent.clientY - that.disY; 

        // 限制移动盒子不能移出视窗外  
        if(l < 0){
            l = 0;
        }else if(l > document.documentElement.clientWidth - that.el.offsetWidth){
            l = document.documentElement.clientWidth - that.el.offsetWidth;  
        }  
          
        if(t < 0){
            t = 0;
        }else if(t > document.documentElement.clientHeight - that.el.offsetHeight){
            t = document.documentElement.clientHeight - that.el.offsetHeight;
        }

        var marginTop = null,
            marginLeft = null;

        // marginTop = parseInt(that.get_style(that.el,'marginTop').match(/[\d]+/)[0],10);
        // marginLeft = parseInt(that.get_style(that.el,'marginLeft').match(/[\d]+/)[0],10);
        marginTop = 0;
        marginLeft = 0;

        // 设置移动盒子的left & top
        that.el.style.left=l+marginLeft+"px";
        that.el.style.top=t+marginTop+"px";
    },
    // 鼠标松开
    mouse_up: function(that, ev){
        // 锁起move_pop_lock结果，所有mousedown都要重新进行校验
        that.inspect_move_pop_lock = true;
        // 锁起handle_lock结果，所有mousedown都要重新进行校验
        that.inspect_handle_lock = true;
        // 释放鼠标后恢复允许选中页面内容
        that.select_lock = false;
        that.ban_select();
        document.removeEventListener("mousemove", that.move_shell);
        document.removeEventListener("mouseup", that.up_shell)
        document.removeEventListener("mouseout", that.out_shell)
    },
    bkColor_deal: function(el, move_pop){
        el.style.backgroundColor = move_pop.bkColor;
        delete move_pop.bkColor;
    },
    zIndex_deal: function(zIndex_array, e){
        // 从层级数组中删除当前移动盒子
        if(zIndex_array.indexOf(e)>= 0){
            zIndex_array.splice(zIndex_array.indexOf(e),1);
        }
        // 重新把当前移动盒子插入到层级数组
        zIndex_array.unshift(e);
        // 重新把层级数组盒子排列z-index
        zIndex_array.forEach(function(item, index){
            item.style.zIndex = 9999-index;
        });
    },
    get_handle: function(target){
        var that = this;
        that.limit_drag = true;
        // 枚举注册对象
        for(var i in that.drag_array){
            // 手柄idName校验
            if(that.drag_array[i]["handle"].idName){
                if(target == document.querySelector("#"+that.drag_array[i]["handle"].idName)){
                    that.handle = document.querySelector("#"+that.drag_array[i]["handle"].idName)
                }
            }else if(that.drag_array[i]["handle"].className){
                // 手柄className校验
                for(var j=0;j<that.drag_array[i]["handle"].className.length;j++){
                    if(target == document.querySelector("."+that.drag_array[i]["handle"].className[j])){
                        that.handle = document.querySelector("."+that.drag_array[i]["handle"].className[j])
                    }
                }
            }
            else{
                // 手柄不存在
                console.log("handle illegal")
                return false;
            }
        }
    },
    inspect_handle: function(that, ev){
        // 校验合法手柄
        // event.target等于注册的target
        if(that.handle){
            if(ev.target == that.handle){
                // 解开手柄锁
                that.inspect_handle_lock = false;
            }
            else{
                // 遍历 (event.target != 手柄时向event.target.parents索要手柄)
                for(var j=0; j<that.get_parents(ev.target).length; j++){
                    // event.target.parents 等于注册的target
                    if(that.get_parents(ev.target)[j] == that.handle){
                        // 解开手柄锁
                        that.inspect_handle_lock = false;
                    }
                }
            }
        }
    },
    inspect_move: function(that, ev){
        // 校验合法move_pop
        // 获取event.target.parents
        for(var i in that.drag_array){
            that.get_parents(ev.target).forEach(function(_item, _index){
                // handle == move_pop;
                if(that.drag_array[i]["move_pop"].idName && ev.target == document.querySelector("#"+that.drag_array[i]["move_pop"].idName)){
                    that.el = document.querySelector("#"+that.drag_array[i]["move_pop"].idName);
                    // 解开移动锁
                    that.inspect_move_pop_lock = false;
                }

                // handle in move_pop;
                // move_pop idName校验(校验target存在注册的move_pop)
                if(that.drag_array[i]["move_pop"].idName && _item == document.querySelector("#"+that.drag_array[i]["move_pop"].idName)){
                    that.el = document.querySelector("#"+that.drag_array[i]["move_pop"].idName);
                    // 解开移动锁
                    that.inspect_move_pop_lock = false;
                    if(that.drag_array[i]["move_pop"].bkColor){
                        that.bkColor_deal(that.el, that.drag_array[i]["move_pop"]);
                    }
                    // id校验成功则不再执行下面className校验(但仍会进行下一次获取到的父级的校验)
                    return false;
                }
                // 遍历获取到的父级与移动结构同时无类名时会通过has_class校验导致报错(此处先判断)
                if(that.drag_array[i]["move_pop"].className[0] != ""){
                    // move_pop className校验
                    for(var j=0;j<that.drag_array[i]["move_pop"].className.length;j++){
                        if(that.has_class(_item, that.drag_array[i]["move_pop"].className[j])){
                            that.el = document.querySelector("."+that.drag_array[i]["move_pop"].className[j])
                            // 解开移动锁
                            that.inspect_move_pop_lock = false;
                            if(that.drag_array[i]["move_pop"].bkColor){
                                that.bkColor_deal(that.el, that.drag_array[i]["move_pop"]);
                            }
                        }
                    }
                }
            });
        }
    },
    get_parents: function(el, array){
        var el_count = array || [];
        if(el.parentNode){
            // 如果父级是body就返回空数组
            if(el.parentNode == document.body){
                return [];
            }
            el_count.push(el.parentNode)
            this.get_parents(el.parentNode, el_count);
        }
        return el_count;
    },
    has_class: function(elem, className){
        var that = this;
        var classes = elem.className.split(/\s+/) ;
        for(var i= 0 ; i < classes.length ; i ++) {
            if( classes[i] === className ) {
                return true ;
            }
        }
        return false ;
    },
    // 禁止选取body
    ban_select: function(){
        var that = this,
        flag = null;
        if(that.select_lock){
            flag = "none";
        }
        else{
            flag = "text";
        }
        that.body.style.setProperty("-webkit-user-select", flag, "");
        that.body.style.setProperty("-moz-user-select", flag, "");
        that.body.style.setProperty("-ms-user-select", flag, "");
        that.body.style.setProperty("user-select", flag, "");
    },
    // 返回移动盒子的margin-left & margin-top
    get_style: function(obj,attr){
        if(obj.currentStyle){
            return obj.currentStyle[attr];
        }
        else{
            return document.defaultView.getComputedStyle(obj,null)[attr];
        }
    }
}