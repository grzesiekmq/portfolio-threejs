'use strict';
(function main() {
    const scene = new THREE.Scene();
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ canvas });
    const loader = new THREE.TextureLoader();
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.setPath('assets/');
    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    const controls = new THREE.OrbitControls(camera, canvas);
    scene.add(camera);
    function createLights() {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(0, 10, 0);
        scene.add(light);
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 0);
    document.body.appendChild(renderer.domElement);
    camera.position.set(-2, 2, 1.1);
    controls.target.set(0, 1, 0);
    controls.update();
    // room
    {
        const onLoad = (event) => {
            const room = event.scene.children[0];
            const oldFloor = room.getObjectById(88);
            scene.add(room);
            room.remove(oldFloor);
        };
        gltfLoader.load('room.glb', onLoad);
    }
    // floor
    {
        const planeSizeX = 7;
        const planeSizeY = 6;
        const texture = loader.load('assets/textures/Wood.jpg');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        const repeats = planeSizeX / 2;
        texture.repeat.set(repeats, repeats);
        const planeGeo = new THREE.PlaneBufferGeometry(planeSizeX, planeSizeY);
        const planeMat = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });
        const floor = new THREE.Mesh(planeGeo, planeMat);
        floor.rotation.x = Math.PI * -.5;
        floor.position.set(1, 1, 1);
        scene.add(floor);
    }
    //laptop
    {
        const onLoad = (event) => {
            const laptop = event.scene.children[0];
            scene.add(laptop);
            laptop.position.set(1.4, 1.22, .7);
            laptop.scale.set(.1, .1, .1);
            laptop.rotation.y = 1.5;
            console.log(laptop);
        };
        gltfLoader.load('laptop.glb', onLoad);
    }
    // iphone
    {
        const onLoad = (event) => {
            const iphone = event.scene;
            scene.add(iphone);
            iphone.position.set(4.1, 1.38, .1);
            iphone.scale.set(.0005, .0005, .0005);
            camera.lookAt(iphone.position);
            iphone.rotation.y = 1.5;
            console.log('iphone', event);
        };
        gltfLoader.load('i-phone-x.glb', onLoad);
    }
    // notebook
    {
        const onLoad = (event) => {
            const notebook = event.scene;
            let notebookMat = notebook.getObjectById(27).material;
            notebookMat.color = new THREE.Color("green");
            scene.add(notebook);
            notebook.position.set(1.1, 1.2, .7);
            notebook.scale.set(.005, .005, .005);
            console.log('notebook', event);
        };
        gltfLoader.load('notebook.gltf', onLoad);
    }
    function rotateLeft() {
        // TODO: rotate with azimuth
    }
    function rotateRight() {
        // TODO: rotate with azimuth
    }
    function move(event) {
        let keys = controls.keys;
        const whichKey = event.which;
        const upKey = keys.UP;
        const downKey = keys.BOTTOM;
        const leftKey = keys.LEFT;
        const rightKey = keys.RIGHT;
        switch (whichKey) {
            case upKey:
                event.preventDefault();
                controls.enablePan = false;
                camera.position.z -= .05;
                console.log(event, 'up');
                break;
            case downKey:
                event.preventDefault();
                controls.enablePan = false;
                camera.position.z += .05;
                console.log(event, 'down');
                break;
            case leftKey:
                event.preventDefault();
                rotateLeft();
                break;
            case rightKey:
                event.preventDefault();
                rotateRight();
                break;
        }
    }
    document.body.addEventListener('keydown', move);
    const animate = function() {
        requestAnimationFrame(animate);
        function debug() {
            document.querySelector('.x').innerHTML = `x ${(camera.position.x).toFixed(2)}`;
            document.querySelector('.y').innerHTML = `y ${(camera.position.y).toFixed(2)}`;
            document.querySelector('.z').innerHTML = `z ${(camera.position.z).toFixed(2)}`;
            document.querySelector('.xrot').innerHTML = `rot x ${(camera.rotation.x).toFixed(2)}`;
            document.querySelector('.yrot').innerHTML = `rot y ${(camera.rotation.y).toFixed(2)}`;
            document.querySelector('.zrot').innerHTML = `rot z ${(camera.rotation.z).toFixed(2)}`;
        }
        renderer.render(scene, camera);
        debug();
    };
    animate();
    createLights();
})();