(function main() 
{
    const scene = new THREE.Scene();
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ canvas });
    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    const color = 0xFFFFFF;
    const intensity = 1;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    const controls = new THREE.OrbitControls(camera, canvas);
    const light = new THREE.DirectionalLight(color, intensity);

    scene.add(camera);
    light.position.set(0, 10, 0);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 0);
    document.body.appendChild(renderer.domElement);
    // room
    {
        const gltfLoader = new THREE.GLTFLoader();
        const onLoad = (event) => 
        {
            const root = event.scene;
            scene.add(root);
            const box = new THREE.Box3().setFromObject(root);
            const boxSize = box.getSize(new THREE.Vector3()).length();
            const boxCenter = box.getCenter(new THREE.Vector3());

            frameArea(boxSize * 1.2, boxSize, boxCenter, camera);
            camera.position.set(boxCenter.x, 5, 10);
            // update the Trackball controls to handle the new size
            controls.maxDistance = boxSize * 10;
            controls.target.set(0, 5, 0);
            controls.update();
        };

        gltfLoader.load('assets/house.glb', onLoad);

    }
    const frameArea = function(sizeToFitOnScreen, boxSize, boxCenter, camera) 
    {
        const halfSizeToFitOnScreen = sizeToFitOnScreen * .5;
        const halfFov = THREE.Math.degToRad(camera.fov * .5);
        const distance = halfSizeToFitOnScreen / Math.tan(halfFov);
        // compute a unit vector that points in the direction the camera is now
        // from the center of the box
        const direction = (new THREE.Vector3()).subVectors(camera.position, boxCenter)
            .normalize();
        // move the camera to a position distance units way from the center
        // in whatever direction the camera was from the center already
        camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
        // pick some near and far values for the frustum that
        // will contain the box.
        camera.near = boxSize / 100;
        camera.far = boxSize * 100;
        camera.updateProjectionMatrix();
        // point the camera to look at the center of the box
        camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
    };
    const animate = function() 
    {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };
    animate();
})();