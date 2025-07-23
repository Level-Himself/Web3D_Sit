var scene, camera, renderer, clock, mixer, actions = [], mode, isWireframe = false;
let loadedModel;

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


	//light attached to camera object. Code created with help from ChatGPT
	const light = new THREE.PointLight(0xffffff, 40, 0);
	light.position.set(0, 0, 0);
	light.decay = 2;
	light.distance = 100;
	camera.add(light);
	scene.add(camera);



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
	}

	
	function resize() {
		const canvas = document.getElementById('threeContainer');
		const width = window.innerWidth;
		const height = window.innerHeight;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
	}
