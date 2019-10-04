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
    // const orbitControls = new THREE.OrbitControls(camera);
    const controlsOrto = new THREE.OrbitControls(ortoCam);
    const raycaster = new THREE.Raycaster();
    let pickedObject = null;
    let pickedObjectSavedColor = 0;
    let intersectedObjects;
    const pickPosition = { x: 0, y: 0 };
    scene.add(camera);
    scene.add(ortoCam);

    function createLights() {
        // point light
        {
            const color = 0xFFFFFF;
            const intensity = 1;
            const light = new THREE.PointLight(color, intensity);
            light.position.set(0, 10, 0);
            scene.add(light);
        }
        // hemisphere light
        {
            const peterRiverColor = '#3498db';
            const groundColor = '#B97A20'; // brownish orange
            const intensity = .6;
            const light = new THREE.HemisphereLight(peterRiverColor, groundColor, intensity);
            scene.add(light);
        }
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
    let cameraTarget = new THREE.Vector3(-2, 2, 2);

    // ortoCam.position.set(-2, 10, 2);
    // room
    {
        const onLoad = (event) => {
            const room = event.scene.children[0];
            console.log('room', room.children[0].children);
            const table = room.getObjectByName('Table');
            const tableRing = room.getObjectByName('TableRing');
            const belizeHoleColor = '#2980b9';
            const peterRiverColor = '#3498db';
            // walls
            const wallFront = room.getObjectByName('WallFront');
            const wallLeft = room.getObjectByName('WallLeft');
            const wallBehind = room.getObjectByName('WallBehind');
            const wallRight = wallLeft.clone();
            const wall = {
                front: wallFront,
                left: wallLeft,
                behind: wallBehind,
                right: wallRight
            };
            const belizeHoleItems = {
                table,
                tableRing
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
    // sofa
    {
        const onLoad = (event) => {
            const sofa = event.scene.children[0];
            sofa.position.set(1.4, 1, 1.8);
            sofa.scale.set(0.007, 0.007, 0.007);
            sofa.rotation.z = Math.PI;
            scene.add(sofa);
            console.log('sofa', sofa);
        };
        gltfLoader.load('sofa.gltf', onLoad);
    }
    // coffee table
    {
        const onLoad = (event) => {
            const coffeeTable = event.scene.children[0];
            coffeeTable.position.set(1.4, 1, -.4);
            coffeeTable.scale.set(0.007, 0.007, 0.007);
            scene.add(coffeeTable);
            console.log('sofa', coffeeTable);
        };
        gltfLoader.load('coffee-table.gltf', onLoad);
    }
    // floor
    {
        const planeSizeX = 7;
        const planeSizeY = 9.9;
        const texture = loader.load('assets/textures/checker.png');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        const repeats = planeSizeX / 2;
        texture.repeat.set(repeats, repeats);
        const planeGeo = new THREE.PlaneBufferGeometry(planeSizeX, planeSizeY);
        const planeMat = new THREE.MeshPhongMaterial({
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
            iphone.position.set(1.3, 1.27, -.3);
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
        const notebook = 'notebook';
        const laptop = 'laptop';
        const selected = document.querySelector(`.${selector}`);
        document.body.appendChild(div);
        selected.textContent = title;

        function getModelName() {
            if (title === 'About me') {
                return notebook;
            } else if (title === 'Projects') {
                return laptop;
            }
        }
        if (selector !== 'contact') {
            selected.append(`Click on ${getModelName()} to see more`);
        } else {
            return;
        }
    }

    function showLabels() {
        // not empty array
        if (intersectedObjects.length) {
            const aboutMe = 'about-me';
            const projects = 'projects';
            const contact = 'contact';
            pickedObject = intersectedObjects[0].object;
            const notebook = pickedObject.getObjectByName('notebook');
            const laptop = pickedObject.getObjectByName('laptop');
            const iphone = pickedObject.getObjectByName('Extrude2-Cutouts001_Mat2_0');

            function setColor(color) {
                pickedObject.material.emissive.setHex(color);

            }
            if (notebook) {
                setColor(0xFFFF00);

                addClasses('object-details', aboutMe);
                addObjectDetails(aboutMe, 'About me');
            } else if (laptop) {
                setColor(0xFFFF00);

                addClasses('object-details', projects);
                addObjectDetails(projects, 'Projects');
            } else if (iphone) {
                setColor(0x0000FF);

                addClasses('object-details', contact);
                addObjectDetails(contact, 'Contact');

                const aboutMeSelector = document.querySelector(`.${aboutMe}`);

                const contactHtml = `
                <div class="content">
				<ul>
		<li>
			<i class="fab fa-linkedin"></i>
			<a href="https://www.linkedin.com/in/grzegorz-futa-71016a60/"> LinkedIn</a>
		</li>
		<li>
			<i class="far fa-envelope"></i>
			<a href="mailto:grzegorzfuta@wp.pl"> email</a>
		</li>
		<li>
			<i class="fab fa-stack-overflow"></i>
			<a href="https://stackoverflow.com/users/5828372/grzesiekmq?tab=profile"> StackOverflow</a>
		</li>
	</ul>
</div>`;

                aboutMeSelector.innerHTML = contactHtml;

            }
        }
    }

    function raycasting(normalizedPosition, scene, camera) {
        // cast a ray through the frustum
        raycaster.setFromCamera(normalizedPosition, camera);
        // get the list of objects the ray intersected
        intersectedObjects = raycaster.intersectObjects(scene.children, true);
    }

    function pick(normalizedPosition, scene, camera) {
        // restore the color if there is a picked object
        if (pickedObject) {
            pickedObject.material.emissive.setHex(pickedObjectSavedColor);
            pickedObject = undefined;
        }
        raycasting(pickPosition, scene, camera);
        showLabels();
    }

    function onObjectsClick(event) {
        event.preventDefault();
        setPickPosition(event);
        raycasting(pickPosition, scene, camera);
        pickedObject = intersectedObjects[0].object;
        const notebook = pickedObject.getObjectByName('notebook');
        const laptop = pickedObject.getObjectByName('laptop');
        const aboutMe = document.querySelector('.about-me');
        const div = document.createElement('div');
        if (notebook) {
            cameraTarget.set(-1, 2, 1);
            addClasses('hero', 'is-fullheight');
            aboutMe.append(div);

        } else if (laptop) {
            cameraTarget.set(-.5, 2, 1);
        }
    }
    clearPickPosition();
    // update
    const update = function() {

        requestAnimationFrame(update);
        let alpha = .1;
        camera.position.lerp(cameraTarget, alpha);

        function debug() {
            document.querySelector('.x').innerHTML = `x ${(cameraTarget.x).toFixed(2)}`;
            document.querySelector('.y').innerHTML = `y ${(cameraTarget.y).toFixed(2)}`;
            document.querySelector('.z').innerHTML = `z ${(cameraTarget.z).toFixed(2)}`;
        }
        pick(pickPosition, scene, camera);
        renderer.render(scene, camera);
        
        // orbitControls.target.set(1, 1, 1);
        // orbitControls.update();

        // controlsOrto.update(clock.getDelta());

        // debug();
    };

    update();
    createLights();

    canvas.addEventListener('click', onObjectsClick, false);
    window.addEventListener('mousemove', setPickPosition);
    window.addEventListener('mouseout', clearPickPosition);
    window.addEventListener('mouseleave', clearPickPosition);
})();