var scene, camera, renderer, clock, mixer, actions = [], mode;

init();

function init() {

	const assetPath = './';
	
	clock = new THREE.Clock();

	scene = new THREE.Scene();


	scene.background = new THREE.Color(0xaaaaaa);

	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(-5, 25, 20);


	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);


	document.body.appendChild(renderer.domElement);

	const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
	scene.add(ambient);

	const light = new THREE.DirectionalLight(0xFFFFFF);
	light.position.set(0, 10, 2);
	scene.add(light);

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
  

	//GLTF loader
	const loader = new THREE.GLTFLoader();
	loader.load(assetPath + 'assets/CokeCan.glb', function(gltf){
	constmodel = gltf.scene;
	scene.add(model);

	mixer = new THREE.AnimationMixer(model);
	const animations = gltf.animations;
	
	animations.forEach(clip =>{
		constactions = mixer.clipAction(clip)
		actions.push(action);
	});
});

	window.addEventListener('resize', onResize, false);

	animate();
	}

	function animate(){
		requestAnimationFrame(animate);

		if (mixer) {
			mixer.update(clock.getDelta());
		}
	}

	renderer.render(scene, camera);


	function onResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	}