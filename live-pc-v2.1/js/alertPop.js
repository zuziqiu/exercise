/**
 * @author: lianghua
 * @description: '通用弹框'
 */ 
 function AlertPop (options) {
    this.init(options); 
 }

AlertPop.prototype= {
  init: function (options) {
    this.title = options.title;
    this.confirmBtn = options.confirmBtn;
    this.cancleBtn = options.cancleBtn;
    this.msg = options.msg; 
    this.maskLayer = options.maskLayer;
    this.creatElement();
    
  },

  //创建dom元素
  creatElement: function () {
    if (this.maskLayer) {
        var layer_div = document.createElement("div");
        layer_div.setAttribute("class","maskLayer");
        layer_div.id= "maskLayer"
        document.body.appendChild(layer_div);
    }
    var div_1 =  document.createElement("div");
    div_1.id= "comm_pop";
    div_1.setAttribute("class","comm_pop");
    var div_2 =  document.createElement("div");
    div_2.setAttribute("class","con_hd");
    var titleNode = document.createElement("span");
    titleNode.innerHTML = this.title;
    div_2.appendChild(titleNode);

    var closeNode = document.createElement("span");
    closeNode.setAttribute("class","close");
    closeNode.id = "close";
    div_2.appendChild(closeNode);

    var div_3 =  document.createElement("div");
    div_3.setAttribute("class","con_msg");
    var con_text = document.createElement("span");
    con_text.setAttribute("class","con_text");

    // 提示内容信息显示
    con_text.innerHTML = this.msg;
    div_3.appendChild(con_text);
    var con_btn_div = document.createElement("div");
    con_btn_div.setAttribute("class","con_btn");
    //是否显示确定按钮
    if(this.confirmBtn){
      var confirm_btn = document.createElement("span");
      confirm_btn.setAttribute("class","confirm_btn");
      confirm_btn.id= "confirm_btn";
      confirm_btn.innerHTML = "确定";
      con_btn_div.appendChild(confirm_btn);
      if(!this.cancleBtn){
        confirm_btn.style = 'margin:0 auto 20px auto';
      }
    }
    //是否显示取消按钮
    if(this.cancleBtn){
      var cancel_btn = document.createElement("span");
      cancel_btn.setAttribute("class","cancel_btn");
      cancel_btn.id="cancle_btn";
      cancel_btn.innerHTML = "取消";
      con_btn_div.appendChild(cancel_btn);
      if(!this.confirmBtn){
        cancel_btn.style = 'margin:0 auto 20px auto';
      }
    }
    div_3.appendChild(con_btn_div);
    div_1.appendChild(div_2);
    div_1.appendChild(div_3);
    document.body.appendChild(div_1);
    if(this.cancleBtn && this.confirmBtn) {
      cancel_btn.style = 'float:left';
      confirm_btn.style = 'float:left';
    }
    this.close();
    this.cancle();
  },

  //确认
  confirm: function (callback) {
    var confirmBtnNode = document.getElementById("confirm_btn"); 
    var conNode = document.getElementById("comm_pop");   
    var maskLayerNode = document.getElementById("maskLayer");
    confirmBtnNode.onclick =  function() { 
      if(typeof callback === "function"){
        callback();
        document.body.removeChild(conNode);
        if (maskLayerNode) {
          document.body.removeChild(maskLayerNode); 
        }   
      }else{
        return;
      }
    }
  },

  //取消
  cancle: function () {
    var that = this;
    var cancleBtnNode = document.getElementById("cancle_btn"); 
    var conNode = document.getElementById("comm_pop");   
    var maskLayerNode = document.getElementById("maskLayer");
    cancleBtnNode.onclick =  function() { 
      document.body.removeChild(conNode);
      if (maskLayerNode) {
        document.body.removeChild(maskLayerNode); 
      } 
    }
  },

  //关闭弹框
  close: function () {
    var closeNode = document.getElementById("close"); 
    var conNode = document.getElementById("comm_pop");   
    var maskLayerNode = document.getElementById("maskLayer");
    closeNode.onclick =  function() { 
      document.body.removeChild(conNode);
      if (maskLayerNode) {
        document.body.removeChild(maskLayerNode); 
      } 
    }
  }
}
 var alertPop = function(data) {
   return new AlertPop(data)
 };