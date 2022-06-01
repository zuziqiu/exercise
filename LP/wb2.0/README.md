#画板SDK
- v2.0 新版本画板
	- 涂鸦
	- .

注意：fabric.js  原版本在全屏时iText无法编辑，处理方式是在initHiddenTextarea方法中替换以下逻辑
// fabric.document.body.appendChild(this.hiddenTextarea);
this.canvas.wrapperEl.appendChild(this.hiddenTextarea);

	
	
	
	