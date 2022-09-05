import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  Accordion,
  AccordionPanel,
  Button,
  Header,
  Heading,
  Box,
  Paragraph,
  TextInput,
  Text,
  Tab,
  Tabs
} from 'grommet';
import { ethers } from "ethers";
import makeBlockie from 'ethereum-blockies-base64';

import { ENS } from '@ensdomains/ensjs'


import SpriteText from 'three-spritetext';

import addresses from "./contracts/addresses";
import abis from "./contracts/abis";

import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
//import { AmmoPhysics } from 'three/addons/physics/AmmoPhysics.js';


import { Core } from '@self.id/core'


import useWeb3Modal from './hooks/useWeb3Modal'
import useClient from './hooks/useGraphClient';


import authenticateWithEthereum from './hooks/useSelfID.js';

import ConnectNFTSection from './components/ConnectNFTSection';

import ConnectENSSection from './components/ConnectENSSection';


const core = new Core({ ceramic: 'testnet-clay' })


export default function App() {


  const [initiated, setInit] = useState(true);
  const {
    provider,
    coinbase,
    netId,
    loadWeb3Modal,
    logoutOfWeb3Modal,
    user,
  } = useWeb3Modal();
  const {
    client,
    initiateClient,
    getNftsFrom,
    getENSFrom
  } = useClient();


  const [profile, setProfile] = useState();
  const [self, setSelf] = useState();
  const [myOwnedNfts, setMyOwnedNfts] = useState();

  const [myOwnedENS, setMyOwnedENS] = useState();
  const [myOwnedERC1155, setMyOwnedERC1155] = useState();

  const [gameContract, setGameContract] = useState();

  const [loadingMyNFTs, setLoadingMyNFTs] = useState(true);

  const [loadingMyENS, setLoadingMyENS] = useState(true);

  const [uri, setUri] = useState();



  const [name, setName] = useState();
  const [description, setDescription] = useState();
  const [img, setImg] = useState();
  const [scenario, setScenario] = useState();
  const [url, setUrl] = useState();


  const ref = useRef({})

  const ENSInstance = new ENS()


  const getMetadata = item => {
    return (
      new Promise(async (resolve, reject) => {
        try {
          let uri;
          let tokenURI;
          const contractAddress = item.id.split("/")[0];
          //ERC1155
          if (item.token) {
            tokenURI = item.token.uri;
          } else {
            tokenURI = item.uri;
          }

          let returnObj = {
            uri: tokenURI
          }

          if (!tokenURI) {
            resolve({});
          }
          if (!tokenURI.includes("://")) {
            uri = `https://ipfs.io/ipfs/${tokenURI}`;
          } else if (tokenURI.includes("ipfs://ipfs/")) {
            uri = tokenURI.replace("ipfs://ipfs/", "https://ipfs.io/ipfs/");
          } else if (tokenURI.includes("ipfs://") && !tokenURI.includes("https://ipfs.io/ipfs/")) {
            uri = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
          } else if (tokenURI.includes("data:application/json;base64")) {
            uri = tokenURI.replace("data:application/json;base64,", "");
          } else {
            uri = tokenURI;
          }
          let metadataToken;
          if (tokenURI.includes("data:application/json;base64")) {
            metadataToken = JSON.parse(atob(tokenURI.replace("data:application/json;base64,", "")));
          } else {
            metadataToken = JSON.parse(await (await fetch(uri)).text());
          }
          returnObj.address = contractAddress;
          returnObj.metadata = metadataToken;
          resolve(returnObj)
        } catch (err) {
          resolve({});
        }
      })
    )
  }

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



  useEffect(() => {
    ref.current = {
      provider: provider,
      coinbase: coinbase,
      netId: netId,
      profile: profile,
      user: user,
      self: self,
      uri: uri,
      gameContract: gameContract
    }
  }, [
    coinbase,
    provider,
    netId,
    user,
    profile,
    self,
    uri,
    gameContract
  ]);
  useEffect(() => {
    if (!initiated) return;
    setInit(false);
    init();
    animate();
  }, [init])
  useEffect(() => {
    initiateClient(netId);
  }, [netId]);

  useEffect(() => {
    let newGameContract;
    if (netId === 4) {
      newGameContract = new ethers.Contract(addresses.game.rinkeby, abis.game, provider);
    } else if (netId === 5) {
      newGameContract = new ethers.Contract(addresses.game.goerli, abis.game, provider);
    } else {
      newGameContract = new ethers.Contract(addresses.game.mumbai, abis.game, provider);
    }
    setGameContract(newGameContract);

  }, [netId, provider])
  useEffect(async () => {
    if (client && coinbase && netId) {
      try {
        const ownedNfts = await getNftsFrom(coinbase, netId);
        console.log(ownedNfts)
        let promises;
        if (ownedNfts.data.accounts[0]?.ERC721tokens) {
          const erc721Tokens = ownedNfts.data.accounts[0].ERC721tokens;
          promises = erc721Tokens.map(getMetadata);
          const newMyOwnedNfts = await Promise.all(promises)
          setMyOwnedNfts(newMyOwnedNfts);
        }

        if (ownedNfts.data.accounts[0]?.ERC1155balances) {
          const erc1155Tokens = ownedNfts.data.accounts[0].ERC1155balances;
          promises = erc1155Tokens.map(getMetadata);
          const newMyOwnedERC1155 = await Promise.all(promises)
          setMyOwnedERC1155(newMyOwnedERC1155);
        }
        setLoadingMyNFTs(false);
      } catch (err) {
        console.log(err)
        setLoadingMyNFTs(false);
      }

      try {
        const ownedENS = await getENSFrom(coinbase);
        const listOfOwnedDomains = ownedENS.data.account.domains

        console.log(listOfOwnedDomains)

        await ENSInstance.setProvider(provider)

        console.log("ENSInstance", ENSInstance);

        const resolver = await provider.getResolver('test1emptyspace.eth');
        const contentHash = await resolver.getContentHash();

        console.log("Content hash", contentHash);


        if (listOfOwnedDomains != 0) {



        }
        console.log("Fetching ENS...");



        console.log("ownedENS", ownedENS);
        setLoadingMyENS(false);
      }
      catch (err) {
        console.log(err)
        setLoadingMyENS(false);

      }


    }
  }, [client, coinbase, netId]);


  // const getENSFrom = async function (coinbase) {

  //   console.log("coinbase", coinbase);

  //   await ENSInstance.setProvider(provider)

  //   console.log("ENSInstance", ENSInstance);

  //   const address = coinbase;

  //   let ensName = null;


  //   console.log(await ENSInstance.getName(address));

  //   ({ name: ensName } = await ENSInstance.getName(address))

  //   console.log(ensName);

  //   let owner = null;

  //   ({ owner: owner } = await ENSInstance.getOwner(ensName));


  //   if (ensName == null || address != owner) {
  //     ensName = null;
  //   }

  //   return ensName;

  // }


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
            let string = ref.current.uri;
            console.log(string)
            if (!string) return;
            if (self) {
              string = self.id
            }

            const signer = gameProvider.getSigner();
            const gameContractWithSigner = contract.connect(signer);
            const tx = await gameContractWithSigner.requestRandomWords(string);
            await tx.wait();
          } catch (err) {
            console.log(err)
          }
          ref.current = {
            ...ref.current,
            sendingTx: false
          }
        }

        break;

      case 'Space':
        if (canJump === true) velocity.y += 350;
        canJump = false;
        break;

    }

  };

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


  const checkUris = async () => {
    const contractInitiated = ref.current?.contractInitiated;
    const contract = ref.current?.gameContract;

    if (contract && !contractInitiated) { //&& coinbase){
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
        if (uriGame.includes("did")) {
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
        } else {
          // Assumes it is nft metadata
          metadata = JSON.parse(await (await fetch(`https://nftstorage.link/ipfs/${uriGame.replace("ipfs://", "")}`)).text());
        }
        const imgTexture = new THREE.TextureLoader().load(metadata.image.replace("ipfs://", "https://nftstorage.link/ipfs/"));
        const material = new THREE.SpriteMaterial({ map: imgTexture });
        const sprite = new THREE.Sprite(material);
        console.log(metadata)
        const name = new SpriteText(metadata.name, 20, "red");
        const description = new SpriteText(metadata.description, 10, "blue")
        const external_url = new SpriteText(metadata.external_url, 8, "green")
        sprite.scale.set(20, 20, 20)
        name.position.y = 60;
        description.position.y = 30;
        external_url.position.y = 20
        gameInfo.add(sprite)
        gameInfo.add(name)
        gameInfo.add(description)
        gameInfo.add(external_url)
        if (metadata.scenario) {
          const loader = new GLTFLoader().setPath(`https://nftstorage.link/ipfs/${metadata.scenario}/gltf/`);
          loader.load('scene.gltf', function (gltf) {
            console.log(gltf)
            gltf.scene.position.set(0, 1, 0)
            gltf.scene.scale.set(gltf.scene.scale.x * 1.2, gltf.scene.scale.y * 1.2, gltf.scene.scale.z * 1.2)
            scene.add(gltf.scene);


          });
        }

        gameInfo.position.set(0, 10, 0)
        scene.add(gameInfo);

        const filter = contract.filters.Result();
        contract.on(filter, handleEvents)

      } catch (err) {
        console.log(err)
      }
    }
    ref.current = {
      ...ref.current,
      contractInitiated: true
    }
  }

  const handleEvents = (uri, requestId, result) => {

    console.log(`Event: URI - ${uri} Result - ${result}`);
    if (result) {
      if (uri === ref.current?.uri) {

      } else {

      }
      setUri(uri);
    } else {
      let i = 0;
      if (uri === ref.current?.uri) {

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
    scene.add(floor);
  }

  async function init() {

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.y = 2;

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

    });

    controls.addEventListener('unlock', function () {

      blocker.style.display = 'block';
      instructions.style.display = '';

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
    if (!contractInitiated) {
      await checkUris();
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
      <Box id="blocker">
        <Header background="brand" align="start" className='navbar'>
          <Heading className='heading' margin="small">EMPTY Space</Heading>
          <Box align="end" pad="small" alignContent="center" >
            {
              coinbase ?
                <Button onClick={() => {
                  logoutOfWeb3Modal();
                  setSelf();
                  setProfile();
                }} label="Disconnect" /> :
                <Button primary onClick={loadWeb3Modal} label="Connect Wallet" />
            }
            {
              netId && coinbase &&
              <Text size="xsmall" alignSelf="center" alignContent="center">
                ChainId: {netId}
                <br />
                Connected as: {user ? user.user.sub : profile?.name ? profile.name : coinbase ? coinbase : "Guest"}
              </Text>
            }
          </Box>
        </Header>
        <Box align="center" className='menu_box'>
          <Heading className='inst_head'>Welcome to <br /><span style={
            {
              fontFamily: 'franchise',
              fontSize: '100px',
              marginTop: '5px',
              display: 'block',
            }
          }>Empty Space</span></Heading>
          <p style={
            {
              textAlign: 'center'
            }
          }>
            A game where every space is your space until it's not. <br />
            Start playing now!
          </p>

          <Box direction="row" style={
            {
              marginBottom: '15px'
            }
          }>
            <Button primary label="Click to play" id="instructions" />
            {
              !coinbase ?
                <Button onClick={loadWeb3Modal} label="Connect wallet" /> :
                !self &&
                window.ethereum &&
                <Button onClick={async () => {
                  const newSelf = await authenticateWithEthereum(coinbase);
                  const newProfile = await newSelf.get('basicProfile');
                  setSelf(newSelf);
                  setProfile(newProfile);
                  setUri(newSelf.id);
                }} label="Connect ceramic" />
            }
          </Box>
          {/* <Paragraph style={{wordBreak: 'break-word'}}>
          Connected as {user ? user.user.sub : profile?.name ? profile.name : coinbase ? coinbase : "Guest"}
        </Paragraph> */}
          {/* <Paragraph style={{wordBreak: 'break-word'}}>
          ChainId: {netId}
        </Paragraph> */}

          {
            uri &&
            <Paragraph style={{ wordBreak: 'break-word' }}>
              URI: {uri}
            </Paragraph>
          }
          <Tabs>
            {
              /*
              <Tab title="Write message">
                <Text>Message</Text>
                <TextInput id="textInput"/>
              </Tab>
              */
            }
            {
              coinbase && !user && !profile &&
              <Tab title="Use Wallet">
                <br></br>
                <Text><center>Enter IPFS Hash</center></Text>
                <TextInput onChange={event => setUri(event.target.value)} />
              </Tab>
            }
            {
              coinbase && !user &&

              <Tab title="Use NFT">
                <br></br>
                <ConnectNFTSection
                  client={client}
                  loadingMyNFTs={loadingMyNFTs}
                  myOwnedERC1155={myOwnedERC1155}
                  myOwnedNfts={myOwnedNfts}
                  setMetadata={setUri}
                />
              </Tab>
            }

            <Tab title="Use ENS">
              <br></br>
              <ConnectENSSection
                client={client}
                loadingMyNFTs={loadingMyNFTs}
                myOwnedERC1155={myOwnedERC1155}
                myOwnedNfts={myOwnedNfts}
                setMetadata={setUri}
              />
            </Tab>

            {
              self && !user &&
              <Tab title="Use Profile">
                <br></br>
                {
                  uri !== self.id &&
                  <Button secondary label="Set Profile URI" onClick={() => setUri(self.id)} />
                }
                <Box direction="row">
                  <Box>
                    <Heading level="2">Edit Profile</Heading>
                    <Text>Name</Text>
                    <TextInput value={name} onChange={event => setName(event.target.value)} />
                    <Text>Description</Text>
                    <TextInput value={description} onChange={event => setDescription(event.target.value)} />
                    <Text>Image</Text>
                    <TextInput value={img} onChange={event => setImg(event.target.value)} />
                    <Text>URL</Text>
                    <TextInput value={url} onChange={event => setUrl(event.target.value)} />
                    <Text>Scenario</Text>
                    <TextInput value={scenario} onChange={event => setScenario(event.target.value)} />
                    <Button secondary label="Save Profile" onClick={async () => {
                      console.log(img)
                      await self.merge('basicProfile', {
                        name: name,
                        description: description,
                        //image: makeBlockie(self.id),
                        url: url,
                        scenario: scenario
                      });
                      const newProfile = await self.get('basicProfile');
                      setProfile(newProfile);
                      console.log("Profile Saved")
                    }} />
                  </Box>
                  <Box>
                    <Heading level="2">Actual Profile</Heading>
                    <Text>Name: {profile?.name}</Text>
                    <Text>Description: {profile?.description}</Text>
                    <Text>Image: {profile?.image}</Text>
                    <Text>URL: {profile?.url}</Text>
                    <Text>Scenario: {profile?.scenario}</Text>

                  </Box>
                </Box>
              </Tab>
            }
          </Tabs>

          <Paragraph className='inst_text'>
            <Accordion>
              <AccordionPanel label="How to play?">
                <Box direction="row">
                  <img className='inst_image' src="img/instructions.png"></img><br />
                  <div style={
                    {
                      marginLeft: "10px"
                    }
                  }>Use <span>W-A-S-D</span> to move<br /><br />
                    <span>SPACE</span> to jump<br /><br />
                    <span>MOUSE</span> to look around<br /><br />
                    {
                      coinbase &&
                      <>
                        and <span>P</span> to occupy
                      </>
                    }
                  </div>
                </Box>
              </AccordionPanel>
            </Accordion>

          </Paragraph>
        </Box>
      </Box>
      <Box id="canvas-container" align="center">

      </Box>
    </>
  )
}
