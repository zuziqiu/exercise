function drawPath(id){
  var canvas = document.getElementById(id);
  window.context = canvas.getContext("2d");
  context.beginPath()
  context.strokeStyle="red";
  // 曲线组合
  context.moveTo(327.07, 361.87);
  let a = [304.97, 279.44, 304.97, 279.44, 304.97, 279.45]
  let b = [317.68, 294.36, 330.39, 309.28, 345.86, 324.75]
  let c = [361.33, 340.22, 369.61, 345.19, 377.9, 350.17]
  let d = [381.22, 352.38, 384.53, 354.59, 385.08, 355.69]
  context.bezierCurveTo(...a);
  context.bezierCurveTo(...b);
  // context.bezierCurveTo(329.28,372.93, 329.28,373.48, 329.28,374.03);
  // context.bezierCurveTo(329.83,374.59, 330.39,375.14, 332.04,375.14);
  // context.bezierCurveTo(333.7,375.14, 334.81,375.14, 335.91,375.14);
  // context.bezierCurveTo(337.57,373.48, 339.23,371.82, 340.33,370.72);
  // context.bezierCurveTo(341.44,369.61, 341.99,369.06, 342.54,368.51);
  context.bezierCurveTo(...c);
  context.bezierCurveTo(...d);
  context.stroke();
  context.closePath();

  // 曲线组合
  window.context2 = canvas.getContext("2d");
  context2.beginPath()
  context.strokeStyle="blue";
  context2.moveTo('27.07, 61.87');
  // context2.bezierCurveTo(27.07,61.88, 27.07,62.98, 27.07,64.09);
  // context2.bezierCurveTo(27.07,66.85, 27.07,69.61, 28.18,71.27);
  // context2.bezierCurveTo(29.28,72.9, 29.28,7.48, 29.28,74.0);
  context2.bezierCurveTo('27.07,61.88', '27.07,62.98', '27.07,64.09');
  context2.bezierCurveTo('27.07,66.85', '27.07,69.61', '28.18,71.27');
  context2.bezierCurveTo('29.28,72.9', '29.28,7.48', '29.28,74.0');
  // context2.bezierCurveTo(29.8,74.59, 0.9,75.14, 2.04,75.14);
  // context2.bezierCurveTo(333.7,375.14, 334.81,375.14, 335.91,375.14);
  // context2.bezierCurveTo(337.57,373.48, 339.23,371.82, 340.33,370.72);
  // context2.bezierCurveTo(341.44,369.61, 341.99,369.06, 342.54,368.51);
  // context2.bezierCurveTo(343.65,368.51, 344.75,368.51, 345.86,366.85);
  // context2.bezierCurveTo(346.96,365.19, 347.51,364.64, 348.07,364.08 );
  context2.stroke();
  context2.closePath();


  setTimeout(function() {
    context.clearRect(0,0, 500,500)
  },1000)
}
