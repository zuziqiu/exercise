window.onload=function(){
	var follow=document.getElementsByClassName("follows");
	for(var i=0;i<follow.length;i++){
		follow[i].index = i;
		follow[i].onclick = function(){
			follow[this.index].children[1].style.display=(follow[this.index].children[1].style.display=="block")?"none":"block";
		}
	}
};

