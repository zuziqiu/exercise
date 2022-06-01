

/**
 * note 此方法属于嵌套iframe通过**postMessage**方法进行通信,
 *      即，此方法在被嵌套的iframe里调用并传入父级页面的地址,
 *      exp:调用该方法的页面被嵌套在 http://localhost:8083/room.html 页面里，则应该传入该地址
 *          var sender = iframePostMessage('http://localhost:8083/room.html');
 *          sender.sendMessage('cmd指令','字符串或者一个json对象');
 */
define(function(require){
    function iframePostMessage(targetUrl){

        if(!('postMessage' in window)) {
            alert('您的浏览器版本太低，请更换高级浏览器以获得更好的体验');
            return false;
        }

        if(!targetUrl) return console.error('请传入通信地址');

        var queue = [],
            timer = null,
            targetUrl = targetUrl;
            hasListened = false;
        function sendMessage(cmd,msg){

            _pushItemToQueue(cmd,msg);

            if(!timer) {
                timer = setInterval(function(){
                    if(queue.length === 0) {
                        clearInterval(timer);
                        timer = null;
                        return false;
                    }
                    parent.window.postMessage(queue.shift(),targetUrl);
                },100)
            }
        }
        function _pushItemToQueue(cmd,msg){
            queue.push(_handleParams(cmd,msg));
        }
        function _handleParams (cmd,msg){

            //参数小于2个
            if(arguments.length <= 1) return console.error('请输入指令和消息');

            if(typeof cmd !== 'string') return false;

            // str = '#' + cmd + '=' + JSON.stringify(msg) + '&tstamp=' + new Date().getTime();

        
            return JSON.stringify({cmd:cmd,msg:JSON.stringify(msg)});
        }

        function listenReceiveMessage(){
            if(!hasListened) {
                window.addEventListener('message',function(e){
                    receiver && receiver(e)
                });
            }
        }

        function receiver(e){}


        return {
            sendMessage :  sendMessage,
            listenReceiveMessage : listenReceiveMessage,
            receiver : receiver
        }
    };
    return iframePostMessage;
})