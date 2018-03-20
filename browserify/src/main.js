var ejs = require("ejs");


window.onload = function(){
        var users = document.getElementById('users').innerHTML;
        var names = ['loki', 'tobi', 'jane'];
        var html = ejs.render(users, { names: names });
        document.body.innerHTML = html;
}
