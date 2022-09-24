import { useEffect, useRef } from 'react'
import * as THREE from 'three';
import makeBlockie from 'ethereum-blockies-base64';
import { ethers } from "ethers";

import SpriteText from 'three-spritetext';


import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
//import { AmmoPhysics } from 'three/addons/physics/AmmoPhysics.js';
import Resolution from '@unstoppabledomains/resolution';


import { Core } from '@self.id/core'

import { useAppContext } from './hooks/useAppState'
import {
  createStreamRClient,
  subscribeStreamR,
  publishMessageStreamr
} from './hooks/Streamr.js';

const core = new Core({ ceramic: 'testnet-clay' })

const resolution = Resolution.fromEthersProvider(new ethers.providers.JsonRpcProvider("https://rpc-mainnet.maticvigil.com"));


export default function Game(props) {


  const { state,actions } = useAppContext();
  const ref = useRef({});

  useEffect(() => {
    init();
    animate();
  }, []);
  useEffect(() => {
    ref.current = state;
  }, [state]);
  useEffect(() => {
    ref.current.client = props.client;
    ref.current.getGameUris = props.getGameUris;
  },[props])
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
  const infos = [];
  const streamrTexts = [];
  let gameText;


  const occupySpace = async () => {
    camera.updateMatrixWorld();
    const vector = camera.position.clone();
    console.log(vector)
    const x = (vector.x/10).toFixed(0);
    const z = (vector.z/10).toFixed(0);
    console.log(`Inserting data at ${x},${z}`)
    const coinbaseGame = ref.current.coinbase;
    const contract = ref.current.gameContract;
    const gameProvider = ref.current.provider;
    const sendingTxGame = ref.current.sendingTx;
    console.log(ref.current)
    if (!sendingTxGame && coinbaseGame && contract) {
      ref.current = {
        ...ref.current,
        sendingTx: true
      }
      try {
        let text = new SpriteText("No URI selected", 5, "red");
        let string = ref.current.uri;
        if(string){
          text = new SpriteText("Inserting data, accept transaction ...", 5, "blue");
        }
        setGameMessage(text);
        console.log(string)
        if (!string) {
          ref.current = {
            ...ref.current,
            sendingTx: false
          }
          return
        };
        const signer = gameProvider.getSigner();
        const gameContractWithSigner = contract.connect(signer);
        const tx = await gameContractWithSigner.requestRandomWords(string,[x,z]);
        text = new SpriteText("Transaction sent, wait for confirmation ...", 5, "blue");
        setGameMessage(text);
        await tx.wait();
        text = new SpriteText("Transaction confirmed", 5, "blue");
        setGameMessage(text);

      } catch (err) {
        console.log(err)
      }
      ref.current = {
        ...ref.current,
        sendingTx: false
      }
    }
  }

  const handleStreamrMessages = async (msg) => {
    console.log(msg)
    const text = new SpriteText(`${msg.message} \n I am \n ${msg.from}`, 4, "blue");
    setGameMessage(text);
  }

  const onKeyDown = async function (event) {

    switch (event.code) {

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
        console.log(ref.current)
        if(ref.current?.netId !== 80001) return;
        if(ref.current?.lock) return;
        occupySpace();
        break;

      case 'KeyM':
        try{
          const streamId = "0xdd3b7754aee323a8b51cb8e063e8fc4a31e5c2cc/empty-space";
          console.log(streamId)
          console.log(ref.current);
          let text;
          if(ref.current?.lock) return;
          if(!ref.current?.coinbase) return;
          if(!ref.current?.streamr){
            text = new SpriteText(`Initiating StreamR ...`, 4, "blue");
            setGameMessage(text)
            await createStreamRClient();
            await subscribeStreamR(streamId,handleStreamrMessages)
            ref.current = {
              ...ref.current,
              streamr: true
            }
            text = new SpriteText(`StreamR initiated. \n Press M to send Hello message to all`, 4, "blue");
            setGameMessage(text)

          } else {
            text = new SpriteText(`Sign to publish hello message ...`, 4, "blue");
            setGameMessage(text)
            publishMessageStreamr(streamId,{
              from: ref.current.uri ? ref.current.uri : ref.current.coinbase,
              message: "Hello!"
            });
          }

        } catch(err){
          console.log(err)
        }
        break;

      case 'Space':
        if (canJump === true) velocity.y += 350;
        canJump = false;
        break;

    }

  };

  const setGameMessage = (text) => {
    const dist = 50;
    const cwd = new THREE.Vector3();
    camera.getWorldDirection(cwd);

    cwd.multiplyScalar(dist);
    cwd.add(camera.position);

    text.position.set(cwd.x, cwd.y+3, cwd.z);
    text.setRotationFromQuaternion(camera.quaternion);
    scene.add(text);
    gameText = text
    setTimeout(() => {
      scene.remove(text);
      gameText = null;
    },8000);
  }

  const onKeyUp = function (event) {

    switch (event.code) {

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

  const addInfo = async (info) => {
    const contractInitiated = ref.current?.contractInitiated;
    const contract = ref.current?.gameContract;
    const getGameUris = ref.current?.getGameUris;
    const uriGame = info.uri;
    let metadata;
    console.log(`${uriGame} at ${info.x},${info.z}`)
    try{
      if (uriGame.startsWith("did:3")) {
        // Get profile info from ceramic.network
        const userProfile = await core.get('basicProfile', uriGame);
        if (!userProfile) {
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
      }
      else if (uriGame.endsWith(".eth")) {

        const provider = ref.current.provider;

        let providerENS;
        if (provider.network.chainId != 4 && provider.network.chainId != 5) {
          // Use rinkeby default network for networks that do not have ENS support PROOF OF CONCEPT
          providerENS = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth_rinkeby")
        }
        else {
          providerENS = provider;
        }


        const resolver = await providerENS.getResolver(uriGame)
        let scenario, avatar, description, url;
        try{
          scenario = await resolver.getText("scenario");
        } catch(err){

        }
        try{
          avatar = await resolver.getText("avatar");
        } catch(err){
          const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="270" height="270" viewBox="0 0 270 270" fill="none">
                <rect width="270" height="270" fill="url(#paint0_linear)"/>
                <defs>
                  <filter id="dropShadow" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" height="270" width="270">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.225" width="200%" height="200%"/>
                  </filter>
                </defs>
                <path d="M38.0397 51.0875C38.5012 52.0841 39.6435 54.0541 39.6435 54.0541L52.8484 32L39.9608 41.0921C39.1928 41.6096 38.5628 42.3102 38.1263 43.1319C37.5393 44.3716 37.2274 45.7259 37.2125 47.1C37.1975 48.4742 37.4799 49.8351 38.0397 51.0875Z" fill="white" filter="url(#dropShadow)"/>
                <path d="M32.152 59.1672C32.3024 61.2771 32.9122 63.3312 33.9405 65.1919C34.9689 67.0527 36.3921 68.6772 38.1147 69.9567L52.8487 80C52.8487 80 43.6303 67.013 35.8549 54.0902C35.0677 52.7249 34.5385 51.2322 34.2926 49.6835C34.1838 48.9822 34.1838 48.2689 34.2926 47.5676C34.0899 47.9348 33.6964 48.6867 33.6964 48.6867C32.908 50.2586 32.371 51.9394 32.1043 53.6705C31.9508 55.5004 31.9668 57.3401 32.152 59.1672Z" fill="white" filter="url(#dropShadow)"/>
                <path d="M70.1927 60.9125C69.6928 59.9159 68.4555 57.946 68.4555 57.946L54.1514 80L68.1118 70.9138C68.9436 70.3962 69.6261 69.6956 70.099 68.8739C70.7358 67.6334 71.0741 66.2781 71.0903 64.9029C71.1065 63.5277 70.8001 62.1657 70.1927 60.9125Z" fill="white" filter="url(#dropShadow)"/>
                <path d="M74.8512 52.8328C74.7008 50.7229 74.0909 48.6688 73.0624 46.8081C72.0339 44.9473 70.6105 43.3228 68.8876 42.0433L54.1514 32C54.1514 32 63.3652 44.987 71.1478 57.9098C71.933 59.2755 72.4603 60.7682 72.7043 62.3165C72.8132 63.0178 72.8132 63.7311 72.7043 64.4324C72.9071 64.0652 73.3007 63.3133 73.3007 63.3133C74.0892 61.7414 74.6262 60.0606 74.893 58.3295C75.0485 56.4998 75.0345 54.66 74.8512 52.8328Z" fill="white" filter="url(#dropShadow)"/>
                <text x="32.5" y="231" font-size="27px" fill="white" filter="url(#dropShadow)">${uriGame}</text>
                <defs>
                  <linearGradient id="paint0_linear" x1="190.5" y1="302" x2="-64" y2="-172.5" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#44BCF0"/>
                      <stop offset="0.428185" stop-color="#628BF3"/>
                      <stop offset="1" stop-color="#A099FF"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear" x1="0" y1="0" x2="269.553" y2="285.527" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#EB9E9E"/>
                    <stop offset="1" stop-color="#992222"/>
                  </linearGradient>
                </defs>
            </svg>
          `
          avatar = "data:image/svg+xml;base64," + window.btoa(unescape(encodeURIComponent(svg)))
        }

        try{
          description = await resolver.getText("description");
        } catch(err){

        }

        try{
          url = await resolver.getText("url");
        } catch(err){

        }

        metadata = {
          name: uriGame,
          description: description,
          image: avatar,
          external_url: url,
          scenario: scenario
        }

      }
      else if (uriGame.endsWith('.crypto') ||
               uriGame.endsWith('.nft') ||
               uriGame.endsWith('.blockchain') ||
               uriGame.endsWith('.wallet') ||
               uriGame.endsWith('.x') ||
               uriGame.endsWith('.bitcoin') ||
               uriGame.endsWith('.dao') ||
               uriGame.endsWith('.888')) {
        // UNS domain
        const records = await resolution.records(
          uriGame,
          [
            "profile.name.value",
            "profile.description.value",
            "ipfs.html.value",
            "profile.image.value",
            "emptyspace.gltf.value"
          ]
        );
        console.log(records)
        console.log(`Domain ${uriGame} ipfs hash is: ${records["ipfs.html.value"]}`);
        metadata = {
          name: records["profile.name.value"] ?
                records["profile.name.value"] :
                uriGame,
          description: records["profile.description.value"],
          image: records["profile.image.value"] ?
                 records["profile.image.value"] :
                 `https://metadata.unstoppabledomains.com/image-src/${uriGame}.svg`,
          external_url: records["ipfs.html.value"],
          scenario: records["emptyspace.gltf.value"]
        }
      } else {
        // Assumes it is nft metadata
        metadata = JSON.parse(await (await fetch(`https://nftstorage.link/ipfs/${uriGame.replace("ipfs://", "")}`)).text());
      }

      const gameInfo = new THREE.Group()
      const imgTexture = new THREE.TextureLoader().load(metadata.image.replace("ipfs://", "https://nftstorage.link/ipfs/"));
      const material = new THREE.SpriteMaterial({ map: imgTexture });
      const sprite = new THREE.Sprite(material);
      console.log(metadata)
      const name = new SpriteText(metadata.name, 8, "red");
      const description = new SpriteText(metadata.description, 3, "blue")
      const external_url = new SpriteText(metadata.external_url, 1, "green")
      sprite.scale.set(20, 20, 20)
      name.position.y = 40;
      description.position.y = 25;
      external_url.position.y = 12
      gameInfo.add(sprite)
      gameInfo.add(name)
      gameInfo.add(description)
      gameInfo.add(external_url)
      if (metadata.scenario) {
        const loader = new GLTFLoader().setPath(`https://nftstorage.link/ipfs/${metadata.scenario}/gltf/`);
        loader.load('scene.gltf', function (gltf) {
          console.log(gltf)
          gltf.scene.scale.set(gltf.scene.scale.x * 1.2, gltf.scene.scale.y * 1.2, gltf.scene.scale.z * 1.2)
          gltf.scene.position.set(info.x*10, 1, info.z*10)
          scene.add(gltf.scene);


        });
      }

      scene.add(gameInfo);
      if(metadata.scenario){
        const loader = new GLTFLoader().setPath(`https://nftstorage.link/ipfs/${metadata.scenario}/gltf/` );
        loader.load( 'scene.gltf', function ( gltf ) {
          console.log(gltf)
          gltf.scene.position.set(info.x*10,1,info.z*10)
          gltf.scene.scale.set(gltf.scene.scale.x*1.2,gltf.scene.scale.y*1.2,gltf.scene.scale.z*1.2)
          scene.add( gltf.scene );


        } );
      }
      gameInfo.position.set(info.x*10, 10, info.z*10)
      infos[`${info.x}_${info.y}`] = gameInfo;
    } catch(err){
      console.log(err)
    }
  }

  const checkUris = async () => {
    const contractInitiated = ref.current?.contractInitiated;
    const contract = ref.current?.gameContract;
    const getGameUris = ref.current?.getGameUris;

    if (contract && !contractInitiated) {
        const results = await getGameUris();
        results.data.infos.map(async info => {
          const uriGame = info.uri;
            if(uriGame){
                await addInfo(info)
            }
        })
        const filter = contract.filters.Result();
        contract.on(filter, handleEvents)
    }
    ref.current = {
      ...ref.current,
      contractInitiated: true
    }
  }

  const handleEvents = async (uri, number,result,x,z) => {

    console.log(`Event: URI - ${uri} Result - ${result} - ${x},${z}`);
    let text;
    if (result) {
      if (uri === ref.current?.uri) {
        text = new SpriteText("The space is yours!", 8, "green");
      } else {
        text = new SpriteText("Someone won a space!", 8, "blue");
      }
      scene.remove(infos[`${x}_${z}`]);
      await addInfo({
        x: x,
        z: z,
        uri: uri
      });
    } else {
      let i = 0;
      if (uri === ref.current?.uri) {
        text = new SpriteText("You could not get the space, try again!", 8, "red");
      } else {
        text = new SpriteText("Someone tried to get a space!", 8, "blue");
      }
    }
    setGameMessage(text);
  }

  const generateFloor = () => {
    // floor

    let floorGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
    floorGeometry.rotateX(- Math.PI / 2);

    // vertex displacement

    let position = floorGeometry.attributes.position;

    for (let i = 0, l = position.count; i < l; i++) {

      vertex.fromBufferAttribute(position, i);

      vertex.x += Math.random() * 20 - 10;
      vertex.y += Math.random() * 2;
      vertex.z += Math.random() * 20 - 10;

      position.setXYZ(i, vertex.x, vertex.y, vertex.z);

    }

    floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

    position = floorGeometry.attributes.position;
    const colorsFloor = [];

    for (let i = 0, l = position.count; i < l; i++) {

      color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
      colorsFloor.push(color.r, color.g, color.b);

    }

    floorGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsFloor, 3));

    const floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.set(1000,0,1000)

    scene.add(floor);
  }

  async function init() {

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(1000,2,1000)
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.Fog(0xffffff, 0, 750);

    const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    light.position.set(0.5, 1, 0.75);
    scene.add(light);
    controls = new PointerLockControls(camera, document.body);

    const blocker = document.getElementById('blocker');
    const instructions = document.getElementById('instructions');

    instructions.addEventListener('click', function () {
      controls.lock();
    });

    controls.addEventListener('lock', function () {

      instructions.style.display = 'none';
      blocker.style.display = 'none';
      ref.current = {
        ...ref.current,
        lock: false
      }

    });

    controls.addEventListener('unlock', function () {

      blocker.style.display = 'block';
      instructions.style.display = '';
      ref.current = {
        ...ref.current,
        lock: true
      }
    });

    scene.add(controls.getObject());

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);

    generateFloor();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementById("canvas-container").appendChild(renderer.domElement);



    window.addEventListener('resize', onWindowResize);

  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

  }

  async function animate() {

    const contractInitiated = ref.current?.contractInitiated;
    const client = ref.current?.client;
    if (!contractInitiated && client) {
      await checkUris();
    }

    if(gameText){
      const dist = 50;
      const cwd = new THREE.Vector3();
      camera.getWorldDirection(cwd);

      cwd.multiplyScalar(dist);
      cwd.add(camera.position);

      gameText.position.set(cwd.x, cwd.y+2, cwd.z);
    }
    requestAnimationFrame(animate);
    const time = performance.now();
    if (controls.isLocked === true) {

      raycaster.ray.origin.copy(controls.getObject().position);
      raycaster.ray.origin.y -= 10;

      const intersections = raycaster.intersectObjects(objects, false);

      const onObject = intersections.length > 0;

      const delta = (time - prevTime) / 1000;

      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;

      velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

      direction.z = Number(moveForward) - Number(moveBackward);
      direction.x = Number(moveRight) - Number(moveLeft);
      direction.normalize(); // this ensures consistent movements in all directions

      if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
      if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

      if (onObject === true) {

        velocity.y = Math.max(0, velocity.y);
        canJump = true;

      }

      controls.moveRight(- velocity.x * delta);
      controls.moveForward(- velocity.z * delta);

      controls.getObject().position.y += (velocity.y * delta); // new behavior

      if (controls.getObject().position.y < 10) {

        velocity.y = 0;
        controls.getObject().position.y = 10;

        canJump = true;

      }

    }

    prevTime = time;

    renderer?.render(scene, camera);

  }

  return (
    <>
    </>
  )
}
