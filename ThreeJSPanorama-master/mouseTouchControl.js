/**
 * Created by song on 2017/9/24.
 */
function onDocumentMouseDown( event ) {

    event.preventDefault();

    // mouse — 鼠标的二维坐标，在归一化的设备坐标(NDC)中，也就是X 和 Y 分量应该介于 -1 和 1 之间。
    // camera — 射线起点处的相机，即把射线起点设置在该相机位置处。
    raycaster.setFromCamera( mouse, camera );   //射线捕捉
    
    // 检查射线和物体之间的所有交叉点（包含或不包含后代）。交叉点返回按距离排序，最接近的为第一个。 返回一个交叉点对象数组。
    var intersects = raycaster.intersectObjects([go_yangtai]);
    if ( intersects.length > 0 && time == 2) {
        changeScene();
    }

    isUserInteracting = true;
    is_click = true;
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;


    onPointerDownLon = lon;
    onPointerDownLat = lat;

}

function onDocumentTouchDown(event) {
    event.preventDefault();

    isUserInteracting = true;
    onPointerDownPointerX = event.touches[ 0 ].pageX ;
    onPointerDownPointerY = event.touches[ 0 ].pageY;


    onPointerDownLon = lon;
    onPointerDownLat = lat;
}


function onDocumentMouseMove( event ) {
  //  console.log("tex", sushe);
    //屏幕位置转换到3D世界坐标系
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    if ( isUserInteracting === true ) {
        lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
        lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
    }
}

//手机控制适配
function onDocumentTouchMove( event ) {

    if ( isUserInteracting === true ) {
        lon = ( onPointerDownPointerX - event.touches[ 0 ].pageX  ) * 0.1 + onPointerDownLon;
        lat = ( event.touches[ 0 ].pageY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
    }
}

function onDocumentMouseUp( event ) {
    isUserInteracting = false;
}

function onDocumentMouseWheel( event ) {
    camera.fov += event.deltaY * 0.05;
    camera.updateProjectionMatrix();
}