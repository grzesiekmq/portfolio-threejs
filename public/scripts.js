'use strict';
(function main() {
    const scene = new THREE.Scene();
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, precision: 'highp' });
    const loader = new THREE.TextureLoader();
    const clock = new THREE.Clock();
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.setPath('assets/');
    // camera
    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    // ortoCam
    const left = 1;
    const right = 1;
    const top = 1;
    const bottom = 0;
    const ortoNear = 5;
    const ortoFar = 50;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    const ortoCam = new THREE.OrthographicCamera(left, right, top, bottom, ortoNear, ortoFar);
    ortoCam.zoom = .2;
    const controls = new THREE.FirstPersonControls(camera);
    const controlsOrto = new THREE.FirstPersonControls(ortoCam);
    const raycaster = new THREE.Raycaster();
    let pickedObject = null;
    let pickedObjectSavedColor = 0;
    const pickPosition = { x: 0, y: 0 };
    let intersectedObjects;
    scene.add(camera);
    scene.add(ortoCam);

    function createLights() {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(0, 10, 0);
        scene.add(light);
    }
    function getCanvasRelativePosition(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    }
    function setPickPosition(event) {
        const pos = getCanvasRelativePosition(event);
        pickPosition.x = (pos.x / canvas.clientWidth) * 2 - 1;
        pickPosition.y = (pos.y / canvas.clientHeight) * -2 + 1; // note we flip Y
    }
    function clearPickPosition() {
        pickPosition.x = -100000;
        pickPosition.y = -100000;
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 0);
    document.body.appendChild(renderer.domElement);
    camera.position.set(-2, 2, 2);
    // ortoCam.position.set(-2, 10, 2);

    // room
    {
        const onLoad = (event) => {
            const room = event.scene.children[0];
            console.log('room', room.children[0].children);
            const sofa = room.getObjectById(132);
            const smallTable = room.getObjectById(117);
            const table = room.getObjectById(127);
            const tableRing = room.getObjectById(118);
            const belizeHoleColor = '#2980b9';
            const peterRiverColor = '#3498db';
            // walls
            const wallFront = room.getObjectById(134);
            const wallLeft = room.getObjectById(135);
            const wallBehind = room.getObjectById(133);
            const wallRight = wallLeft.clone();
            const wall = {
                front: wallFront,
                left: wallLeft,
                behind: wallBehind,
                right: wallRight
            };
            const belizeHoleItems = {
                smallTable,
                table,
                tableRing,
                sofa
            };
            wall.right.position.set(0, .7, 7.6);
            wall.right.scale.y = .8;
            wall.behind.scale.z = 1.9;
            function setColor(object, colorName) {
                object.material.color.set(colorName);
            }
            Object.values(belizeHoleItems).map(item => setColor(item, belizeHoleColor));
            Object.values(wall).map(item => setColor(item, peterRiverColor));
            room.add(wall.right);
            scene.add(room);
        };
        gltfLoader.load('room.gltf', onLoad);
    }
    // floor
    {
        const planeSizeX = 7;
        const planeSizeY = 9.9;
        const texture = loader.load('assets/textures/Wood.jpg');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
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
            laptop.position.set(1.4, 1.3, .7);
            laptop.scale.set(0.02, 0.02, 0.02);
            laptop.rotation.z = Math.PI * .5;
            camera.lookAt(1.4, 1.9, .7);
            scene.add(laptop);
            console.log('laptop', laptop);
        };
        gltfLoader.load('laptop.gltf', onLoad);
    }
    // iphone
    {
        const onLoad = (event) => {
            const iphone = event.scene;
            iphone.position.set(4, 1.38, .1);
            iphone.scale.set(0.0015, 0.0015, 0.0015);
            iphone.rotation.x = Math.PI * -.5;
            scene.add(iphone);
            console.log('iphone', event);
        };
        gltfLoader.load('i-phone-x.gltf', onLoad);
    }
    // notebook
    {
        const onLoad = (event) => {
            const notebook = event.scene;
            notebook.position.set(1.1, 1.2, .7);
            notebook.rotation.y = Math.PI * .5;
            notebook.scale.set(.01, .01, .01);
            scene.add(notebook);
            console.log('notebook', event);
        };
        gltfLoader.load('notebook.gltf', onLoad);
    }
    console.log(scene);
    const div = document.createElement('div');
    function addClasses(classFirst, classSecond) {
        div.classList.add(classFirst, classSecond);
    }
    function addObjectDetails(selector, title) {
        document.body.appendChild(div);
        document.querySelector(`.${selector}`).innerHTML = title;
    }
    function pick(normalizedPosition, scene, camera) {
        // restore the color if there is a picked object
        if (pickedObject) {
            pickedObject.material.emissive.setHex(pickedObjectSavedColor);
            pickedObject = undefined;
        }
        // cast a ray through the frustum
        raycaster.setFromCamera(normalizedPosition, camera);
        // get the list of objects the ray intersected
        intersectedObjects = raycaster.intersectObjects(scene.children, true);
        if (intersectedObjects.length) {
            pickedObject = intersectedObjects[0].object;
            const aboutMe = 'about-me';
            const projects = 'projects';
            const contact = 'contact';
            if (pickedObject.getObjectById(68)) {
                pickedObject.material.emissive.setHex(0xFFFF00);
                addClasses('object-details', aboutMe);
                addObjectDetails(aboutMe, 'About me');

            } else if (pickedObject.getObjectById(112)) {
                pickedObject.material.emissive.setHex(0xFF0000);
                addClasses('object-details', projects);
                addObjectDetails(projects, 'Projects');

            } else if (pickedObject.getObjectById(102)) {
                pickedObject.material.emissive.setHex(0x0000FF);
                addClasses('object-details', contact);
                addObjectDetails(contact, 'Contact');
            }
        }
    }
    clearPickPosition();
    const animate = function() {
        requestAnimationFrame(animate);
        function debug() {
            document.querySelector('.x').innerHTML = `x ${(camera.position.x).toFixed(2)}`;
            document.querySelector('.y').innerHTML = `y ${(camera.position.y).toFixed(2)}`;
            document.querySelector('.z').innerHTML = `z ${(camera.position.z).toFixed(2)}`;
            document.querySelector('.mousex').innerHTML = `mouse x ${pickPosition.x}`;
            document.querySelector('.mousey').innerHTML = `mouse y ${pickPosition.y}`;

        }
        pick(pickPosition, scene, camera);
        renderer.render(scene, camera);
        controls.update(clock.getDelta());
        // controlsOrto.update(clock.getDelta());
        debug();
    };
    animate();
    createLights();
    window.addEventListener('mousemove', setPickPosition);
    window.addEventListener('mouseout', clearPickPosition);
    window.addEventListener('mouseleave', clearPickPosition);
})();