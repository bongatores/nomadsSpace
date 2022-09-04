import {useEffect,useRef} from 'react'
import * as THREE from 'three';
import makeBlockie from 'ethereum-blockies-base64';

import SpriteText from 'three-spritetext';


import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
//import { AmmoPhysics } from 'three/addons/physics/AmmoPhysics.js';


import { Core } from '@self.id/core'

import { useAppContext } from './hooks/useAppState'


const core = new Core({ ceramic: 'testnet-clay' })


export default function Game() {


  const { state } = useAppContext();

  const ref = useRef({});

  useEffect(() => {
      init();
      animate();
  },[]);
  useEffect(() => {
    ref.current = state
  },[state]);
  let camera, scene, renderer, controls;
  const objects = [];
  let raycaster;

  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  let canJump = false;

  let prevTime = performance.now();
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const vertex = new THREE.Vector3();
  const color = new THREE.Color();

  const onKeyDown = async function ( event ) {

    switch ( event.code ) {

      case 'ArrowUp':
      case 'KeyW':
        moveForward = true;
        break;

      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = true;
        break;

      case 'ArrowDown':
      case 'KeyS':
        moveBackward = true;
        break;

      case 'ArrowRight':
      case 'KeyD':
        moveRight = true;
        break;

      case 'KeyP':
        const coinbaseGame = ref.current.coinbase;
        const contract = ref.current.gameContract;
        const gameProvider = ref.current.provider;
        const sendingTxGame = ref.current.sendingTx;
        console.log(ref.current)
        if(!sendingTxGame && coinbaseGame && contract){
          ref.current = {
            ...ref.current,
            sendingTx: true
          }
          try{
            let string =ref.current.uri;
            console.log(string)
            if(!string) return;
            const signer = gameProvider.getSigner();
            const gameContractWithSigner = contract.connect(signer);
            const tx = await gameContractWithSigner.requestRandomWords(string);
            await tx.wait();
          } catch(err){
            console.log(err)
          }
          ref.current = {
            ...ref.current,
            sendingTx: false
          }
        }

        break;

      case 'Space':
        if ( canJump === true ) velocity.y += 350;
        canJump = false;
        break;

    }

  };

  const onKeyUp = function ( event ) {

    switch ( event.code ) {

      case 'ArrowUp':
      case 'KeyW':
        moveForward = false;
        break;

      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = false;
        break;

      case 'ArrowDown':
      case 'KeyS':
        moveBackward = false;
        break;

      case 'ArrowRight':
      case 'KeyD':
        moveRight = false;
        break;

    }

  };


  const checkUris = async () => {
    const contractInitiated = ref.current?.contractInitiated;
    const contract = ref.current?.gameContract;

    if(contract && !contractInitiated){ //&& coinbase){
      try {
        /*
        for(let i = 0; i < 1999;i++){
          for(let j = 0;j<1999;j++){
            const urigame = await gameContract.uri(i,j);
            if(urigame){
              ...
              if(metadata.scenario){
                const loader = new GLTFLoader().setPath(`https://nftstorage.link/ipfs/${metadata.scenario}/gltf/` );
                loader.load( 'scene.gltf', function ( gltf ) {
                  console.log(gltf)
                  gltf.scene.position.set(i,1,j)
                  gltf.scene.scale.set(gltf.scene.scale.x*1.2,gltf.scene.scale.y*1.2,gltf.scene.scale.z*1.2)
                  scene.add( gltf.scene );


                } );
                gameInfo.position.set(i,10,j)

              }
            }
          }
        }
        */
        const gameInfo = new THREE.Group()
        const uriGame = await contract.uri();
        let metadata;
        if(uriGame.includes("did")){
          // Get profile info from ceramic.network
          const userProfile = await core.get('basicProfile',uriGame);
          if(!userProfile){
            return
          }
          metadata = {
            name: userProfile.name ? userProfile.name : uriGame,
            description: userProfile.description,
            image: userProfile.image ?
                   userProfile.image :
                   makeBlockie(uriGame),
            external_url: userProfile.url,
            scenario: userProfile.scenario
          }
        } else {
          // Assumes it is nft metadata
          metadata = JSON.parse(await (await fetch(`https://nftstorage.link/ipfs/${uriGame.replace("ipfs://","")}`)).text());
        }
        const imgTexture = new THREE.TextureLoader().load(metadata.image.replace("ipfs://","https://nftstorage.link/ipfs/"));
        const material = new THREE.SpriteMaterial({ map: imgTexture});
        const sprite = new THREE.Sprite(material);
        console.log(metadata)
        const name = new SpriteText(metadata.name,20,"red");
        const description =  new SpriteText(metadata.description,10,"blue")
        const external_url = new SpriteText(metadata.external_url,8,"green")
        sprite.scale.set(20,20,20)
        name.position.y = 60;
        description.position.y = 30;
        external_url.position.y = 20
        gameInfo.add(sprite)
        gameInfo.add(name)
        gameInfo.add(description)
        gameInfo.add(external_url)
        if(metadata.scenario){
          const loader = new GLTFLoader().setPath(`https://nftstorage.link/ipfs/${metadata.scenario}/gltf/` );
          loader.load( 'scene.gltf', function ( gltf ) {
            console.log(gltf)
            gltf.scene.position.set(0,1,0)
            gltf.scene.scale.set(gltf.scene.scale.x*1.2,gltf.scene.scale.y*1.2,gltf.scene.scale.z*1.2)
            scene.add( gltf.scene );


          });
        }

        gameInfo.position.set(0,10,0)
        scene.add(gameInfo);

        const filter = contract.filters.Result();
        contract.on(filter,handleEvents)

      } catch(err){
        console.log(err)
      }
    }
    ref.current = {
      ...ref.current,
      contractInitiated: true
    }
  }

  const handleEvents = (uri,requestId,result) => {

      console.log(`Event: URI - ${uri} Result - ${result}`);
      if(result){
        if(uri === ref.current?.uri){

        } else {

        }
      } else {
        let i = 0;
        if(uri === ref.current?.uri){

        } else {

        }
        /*
        const metorsInterval = setInterval(() => {
          if(i < 100){

          } else {
            clearInterval(metorsInterval);
          }
          i = i + 1;
        },500);
        */

      }
  }

  const generateFloor = () => {
    // floor

    let floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
    floorGeometry.rotateX( - Math.PI / 2 );

    // vertex displacement

    let position = floorGeometry.attributes.position;

    for ( let i = 0, l = position.count; i < l; i ++ ) {

      vertex.fromBufferAttribute( position, i );

      vertex.x += Math.random() * 20 - 10;
      vertex.y += Math.random() * 2;
      vertex.z += Math.random() * 20 - 10;

      position.setXYZ( i, vertex.x, vertex.y, vertex.z );

    }

    floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

    position = floorGeometry.attributes.position;
    const colorsFloor = [];

    for ( let i = 0, l = position.count; i < l; i ++ ) {

      color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
      colorsFloor.push( color.r, color.g, color.b );

    }

    floorGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colorsFloor, 3 ) );

    const floorMaterial = new THREE.MeshBasicMaterial( { vertexColors: true } );

    const floor = new THREE.Mesh( floorGeometry, floorMaterial );
    scene.add( floor );
  }

  async function init() {

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.y = 2;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

    const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    scene.add( light );
    controls = new PointerLockControls( camera, document.body );

    const blocker = document.getElementById( 'blocker' );
    const instructions = document.getElementById( 'instructions' );

    instructions.addEventListener( 'click', function () {
      controls.lock();
    });

    controls.addEventListener( 'lock', function () {

      instructions.style.display = 'none';
      blocker.style.display = 'none';

    } );

    controls.addEventListener( 'unlock', function () {

      blocker.style.display = 'block';
      instructions.style.display = '';

    } );

    scene.add( controls.getObject() );

    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener( 'keyup', onKeyUp );

    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

    generateFloor();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.getElementById("canvas-container").appendChild( renderer.domElement );



    window.addEventListener( 'resize', onWindowResize );

  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

  }

  async function animate() {

    const contractInitiated = ref.current?.contractInitiated;
    if(!contractInitiated){
      await checkUris();
    }
    requestAnimationFrame( animate );
    const time = performance.now();
    if ( controls.isLocked === true ) {

      raycaster.ray.origin.copy( controls.getObject().position );
      raycaster.ray.origin.y -= 10;

      const intersections = raycaster.intersectObjects( objects, false );

      const onObject = intersections.length > 0;

      const delta = ( time - prevTime ) / 1000;

      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;

      velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

      direction.z = Number( moveForward ) - Number( moveBackward );
      direction.x = Number( moveRight ) - Number( moveLeft );
      direction.normalize(); // this ensures consistent movements in all directions

      if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
      if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

      if ( onObject === true ) {

        velocity.y = Math.max( 0, velocity.y );
        canJump = true;

      }

      controls.moveRight( - velocity.x * delta );
      controls.moveForward( - velocity.z * delta );

      controls.getObject().position.y += ( velocity.y * delta ); // new behavior

      if ( controls.getObject().position.y < 10 ) {

        velocity.y = 0;
        controls.getObject().position.y = 10;

        canJump = true;

      }

    }

    prevTime = time;

    renderer?.render( scene, camera );

  }

  return (
    <>
    </>
  )
}
