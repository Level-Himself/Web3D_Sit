var scene, camera, renderer, clock, mixer, actions = [], mode, isWireframe = false, params, lights;
let loadedModel;
let sound, secondSound;

init();

function init() {

	const assetPath = './assets/glb_models/';
	
	clock = new THREE.Clock();

	scene = new THREE.Scene();


	scene.background = new THREE.Color(0xaaaaaa);

	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(-5, 25, 20);


	const canvas = document.getElementById('threeContainer');
	renderer = new THREE.WebGLRenderer({ canvas: canvas });
	renderer.setPixelRatio(window.devicePixelRatio);
	resize();



	document.body.appendChild(renderer.domElement);

	const listener = new THREE.AudioListener();
	camera.add(listener);

	sound = new THREE.Audio(listener);
	secondSound = new THREE.Audio(listener);

	const audioLoader = new THREE.AudioLoader();
	audioLoader.load('assets/sfx/can_opening_trim.mp3', function (buffer) {
		sound.setBuffer(buffer);
		sound.setLoop(false);
		sound.setVolume(1.0);
	});


	//light attached to camera object. Code created with help from ChatGPT
	const light = new THREE.PointLight(0xffffff, 40, 0);
	light.position.set(0, 0, 0);
	light.decay = 2;
	light.distance = 100;
	camera.add(light);
	scene.add(camera);

	// Lighting UI
	const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820, 4);
	scene.add(ambient);

	lights = {};

	lights.spot = new THREE.SpotLight();
	lights.spot.visible = true;
	lights.spot.position.set(0, 25, 0);
	lights.spotHelper = new THREE.SpotLightHelper(lights.spot);
	lights.spotHelper.visible = false;
	scene.add(lights.spotHelper);
	scene.add(lights.spot);

	params = {
		spot: {
			enable: false,
			color: 0xffffff,
			distance: 20,
			angle: Math.PI/2,
			penumbra: 0,
			helper: false,
			moving: false
		}
	}

	const gui = new dat.GUI({ autoPlace: false });
	const guiContainer = document.getElementById('gui-container');
	guiContainer.appendChild(gui.domElement);

	guiContainer.style.position = 'fixed';

	const spot = gui.addFolder('Light');
	spot.open();
	spot.add(params.spot, 'enable').onChange(value => {lights.spot.visible = value});
	spot.addColor(params.spot, 'color').onChange(value => lights.spot.color = new THREE.Color(value));
	spot.add(params.spot, 'distance').min(0).max(20).onChange(value => lights.spot.distance = value);
	spot.add(params.spot, 'angle').min(0.1).max(6.28).onChange(value => lights.spot.angle = value);
	spot.add(params.spot, 'penumbra').min(0).max(1).onChange(value => lights.spot.penumbra = value);
	spot.add(params.spot, 'helper').onChange(value => lights.spotHelper.visible = value);
	spot.add(params.spot, 'moving');



	// Add OrbitControls
	const controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.target.set(1, 2, 0);
	controls.update();
	
	// Button to control animations
	mode = 'open';
	const btn = document.getElementById("btn");
	btn.addEventListener('click', function() {
	  if (actions.length === 2) {
		if (mode === "open") {
		  actions.forEach(action => {
			action.timeScale = 1;
			action.reset();
			action.play();

			if (sound.isPlaying) sound.stop();
			sound.play();
		  });
		}
	  }
	});

	// Button to control wireframe
	const wireframeBtn = document.getElementById("toggleWireframe");
	wireframeBtn.addEventListener('click', function() {
		isWireframe = !isWireframe;
		toggleWireframe(isWireframe);
	});

	// Button to control rotation
	const rotateBtn = document.getElementById('rotate');
	rotateBtn.addEventListener('click', function () {
		if (loadedModel) {
			const axis = new THREE.Vector3(0, 1, 0);
			const angle = Math.PI / 8;
			loadedModel.rotateOnAxis(axis , angle);
		} else {
			console.warn('Model not loaded yet.');
		}
	});
  

	//GLTF loader
	const loader = new THREE.GLTFLoader();
	loader.load(assetPath + 'can.glb', function(gltf) {
	const model = gltf.scene;
	scene.add(model);

	loadedModel = model;

	mixer = new THREE.AnimationMixer(model);
	const animations = gltf.animations;
	
	animations.forEach(clip => {
		const action = mixer.clipAction(clip)
		actions.push(action);
	});
	});

	window.addEventListener('resize', resize, false);

	animate();
	}


	function toggleWireframe(enable) {
		scene.traverse(function (object) {
			if (object.isMesh) {
				object.material.wireframe = enable;
			}
		});
	}


	function animate(){
		requestAnimationFrame(animate);

		if (mixer) {
			mixer.update(clock.getDelta());
		}
		
		renderer.render(scene, camera);

		
		const time = clock.getElapsedTime();
		const delta = Math.sin(time)*5;
		if (params.spot.moving){
			lights.spot.position.x = delta;
			lights.spotHelper.update();
		}
	}

	
	function resize() {
		const canvas = document.getElementById('threeContainer');
		const width = window.innerWidth;
		const height = window.innerHeight;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
	}
