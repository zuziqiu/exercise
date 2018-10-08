window.onload = function(){
    // 第一种：让相机动
    var renderer;
    function initThree() {
        width = document.getElementById('canvas-frame').clientWidth;
        height = document.getElementById('canvas-frame').clientHeight;
        renderer = new THREE.WebGLRenderer({
            antialias : true
        });
        renderer.setSize(width, height);
        document.getElementById('canvas-frame').appendChild(renderer.domElement);
        renderer.setClearColor(0xFFFFFF, 1.0);
    }

    var camera;
    function initCamera() {
        camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 600;
        camera.up.x = 0;
        camera.up.y = 1;
        camera.up.z = 0;
        // lookAt是camera的一个方法，目的是让camera的镜头看向三维空间中指定的位置。其调用形式如：lookAt（target）——其中target参数是一个具体Vector3对象，代表了三维空间的某点。
        camera.lookAt(0,0,0);
    }

    var scene;
    function initScene() {
        scene = new THREE.Scene();
    }

    var light;
    function initLight() {
        // 环境光源
        // 通常，不能将 THREE.AmbientLight 作为场景中唯一的光源，因为它会将场景中的所有物体渲染为相同的颜色，而不管是什么形状。
        // 在使用其他光源（如 THREE.SpotLight 或者 THREE.DirectionLight）的同时使用它，目的是弱化阴影或给场景添加一些额外的颜色。
        light = new THREE.AmbientLight(0xFFFFFF);
        light.position.set(100, 100, 200);
        scene.add(light);


        // 点光源
        // 1，基本介绍
        // THREE.PointLight 是一种单点发光、照射所有方向的光源（比如夜空中的照明弹就是一个点光源例子）
        // THREE.PointLight 不会产生阴影。因为它会朝所有的方向发射光线，在这种情况下计算阴影对 GPU 是个沉重的负担。
        // 2，属性介绍
        // color：光源的颜色
        // distance：光源照射的距离。默认值为 0，意味着光的强度不会随着距离的增加而减少。
        // intensity：光源照射的强度。默认值为 1。
        // position：光源在场景中的位置。
        // visible：设为 ture（默认值），光源就会打开。设为 false，光源就会关闭。
        light = new THREE.PointLight(0x00FF00);
        light.position.set(0, 0,300);
        scene.add(light);
    }

    var cube;
    var mesh;
    function initObject() {
        // CylinderGeometry => 圆柱几何的类
        var geometry = new THREE.CylinderGeometry( 100,150,400);
        // MeshLambertMaterial：
        // 这种材质可以用来创建暗淡的并不光亮的表面。
        // 无光泽表面的材质，无镜面高光。
        // 这可以很好地模拟一些表面（如未经处理的木材或石头），但不能用镜面高光（如上漆木材）模拟光泽表面。
        // 该材质非常易用，而且会对场景中的光源产生反应。
        // 可以配置的前面的提高的属性：color、opacity、shading、blending、depthTest、depthWrite、wireframe、wireframeLinewidth、wireframeLinecap、wireframeLineJoin、vertexColors和fog。
        
        var material = new THREE.MeshLambertMaterial( { color:0xFFFF00} );
            mesh = new THREE.Mesh( geometry,material);
            
            // Vector3：建立几何体的vertice(顶点)
        mesh.position = new THREE.Vector3(0,0,0);
        scene.add(mesh);
    }

    function threeStart() {
        initThree();
        initCamera();
        initScene();
        initLight();
        initObject();
        animation();

    }
    function animation()
    {
        camera.position.x =camera.position.x +1;
        renderer.render(scene, camera);
        requestAnimationFrame(animation);
    }
    threeStart();
};