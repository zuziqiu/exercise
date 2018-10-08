window.onload = function() {
  var _HT = new MT.SDK.main(access_token, function(data) {
    _HT.on('member:join:me',function(){
      var i = 1,
      memberList = []
      // fetch_member = setInterval(function(){
        _HT.emit("member:list", {"page": i, "size": 100, "role":"user"}, function(list){
              if (Object.prototype.toString.call(list) === '[object Array]' && list.length > 0) {
                  memberList = memberList.concat(list)
              //     i++;
              // } else {
              //   // post data
                console.log('在线列表：', memberList)
                private(memberList)
                // clearInterval(fetch_member)
              }
          });
      // },500)

      function private(memberList){
        // memberList.forEach(function(item,index){
        //   var _xid = null;
        //   if(typeof item.xid === 'string') {
        //     _xid = parseInt(item.xid)
        //   } else {
        //     _xid = item.xid
        //   }
        //   setInterval(function(){
        //     _HT.emit("chat:private",{xid:_xid, msg: _xid}, function(res){
        //       if(res.code === 0){
        //       console.log('发送给'+_xid+'成功')   
        //       }else{
        //       console.log('发送给'+_xid+'失败')   
        //       }
        //     });
        //   }, 2000);
        // })
        var userlist = setInterval(function(){
          if(memberList.length == 0){
            clearInterval(userlist)
            return false;
          }
          var user = memberList.shift()
          _HT.emit("chat:private",{xid:user.xid, msg: memberList.length}, function(res){
            if(res.code === 0){
            console.log('发送给'+user.xid+'成功')   
            }else{
            console.log('发送给'+user.xid+'失败')   
            }
          });
        },2000)
      }
      window.send = function(){
        _HT.emit("chat:private",{xid:42888947, msg:'42888947marko'}, function(res){
          if(res.code === 0){
          console.log('发送给marko成功')   
          }else{
          console.log('发送给marko失败')   
          }
        });
      }
    })
    _HT.on("chat:private",function(retval){
      console.log('receive:',retval)
    });
  });
}