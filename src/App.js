import {useState,useEffect} from 'react';
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


import  addresses from "./contracts/addresses";
import  abis  from "./contracts/abis";



import { Core } from '@self.id/core'

import { AppContext, useAppState } from './hooks/useAppState'

import useWeb3Modal from './hooks/useWeb3Modal'
import useClient from './hooks/useGraphClient';
import authenticateWithEthereum from './hooks/useSelfID.js';

import Game from './Game';

import ConnectNFTSection from './components/ConnectNFTSection';


export default function App() {

  const { state, actions } = useAppState();

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
      getNftsFrom
  } = useClient();
  const [profile,setProfile] = useState();
  const [self,setSelf] = useState();
  const [myOwnedNfts,setMyOwnedNfts] = useState();
  const [myOwnedERC1155,setMyOwnedERC1155] = useState();

  const [gameContract,setGameContract] = useState();

  const [loadingMyNFTs,setLoadingMyNFTs] = useState(true);


  const [uri,setUri] = useState();



  const [name,setName] = useState();
  const [description,setDescription] = useState();
  const [img,setImg] = useState();
  const [scenario,setScenario] = useState();
  const [url,setUrl] = useState();



  const getMetadata = item => {
    return(
      new Promise(async (resolve,reject) => {
        try {
          let uri;
          let tokenURI;
          const contractAddress = item.id.split("/")[0];
          //ERC1155
          if(item.token){
            tokenURI = item.token.uri;
          } else {
            tokenURI = item.uri;
          }

          let returnObj = {
            uri: tokenURI
          }

          if(!tokenURI){
            resolve({});
          }
          if(!tokenURI.includes("://")){
            uri = `https://ipfs.io/ipfs/${tokenURI}`;
          } else if(tokenURI.includes("ipfs://ipfs/")){
            uri = tokenURI.replace("ipfs://ipfs/","https://ipfs.io/ipfs/");
          } else if(tokenURI.includes("ipfs://") && !tokenURI.includes("https://ipfs.io/ipfs/")){
            uri = tokenURI.replace("ipfs://","https://ipfs.io/ipfs/");
          } else if(tokenURI.includes("data:application/json;base64")) {
            uri = tokenURI.replace("data:application/json;base64,","");
          } else {
            uri = tokenURI;
          }
          let metadataToken;
          if(tokenURI.includes("data:application/json;base64")){
            metadataToken = JSON.parse(atob(tokenURI.replace("data:application/json;base64,","")));
          } else {
            metadataToken = JSON.parse(await (await fetch(uri)).text());
          }
          returnObj.address = contractAddress;
          returnObj.metadata = metadataToken;
          resolve(returnObj)
        } catch(err){
          resolve({});
        }
      })
    )
  }

  useEffect(() => {
    actions.setProvider(provider);
    actions.setCoinbase(coinbase);
    actions.setNetId(netId);
    actions.setProfile(profile);
    actions.setUser(user);
    actions.setUri(uri);
    actions.setGameContract(gameContract);
  },[
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
    initiateClient(netId);
    actions.setNetId(netId);
  },[netId]);

  useEffect(() => {
    let newGameContract;
    if(netId === 4){
      newGameContract = new ethers.Contract(addresses.game.rinkeby,abis.game,provider);
    } else if(netId === 5){
      newGameContract = new ethers.Contract(addresses.game.goerli,abis.game,provider);
    } else {
      newGameContract = new ethers.Contract(addresses.game.mumbai,abis.game,provider);
    }
    setGameContract(newGameContract);

  },[netId,provider])

  useEffect(async () => {
    if(client && coinbase && netId){
      try{
        const ownedNfts = await getNftsFrom(coinbase,netId);
        console.log(ownedNfts)
        let promises;
        if(ownedNfts.data.accounts[0]?.ERC721tokens){
          const erc721Tokens = ownedNfts.data.accounts[0].ERC721tokens;
          promises = erc721Tokens.map(getMetadata);
          const newMyOwnedNfts = await Promise.all(promises)
          setMyOwnedNfts(newMyOwnedNfts);
        }

        if(ownedNfts.data.accounts[0]?.ERC1155balances){
          const erc1155Tokens = ownedNfts.data.accounts[0].ERC1155balances;
          promises = erc1155Tokens.map(getMetadata);
          const newMyOwnedERC1155 = await Promise.all(promises)
          setMyOwnedERC1155(newMyOwnedERC1155);
        }
        setLoadingMyNFTs(false);
      } catch(err){
        console.log(err)
        setLoadingMyNFTs(false);
      }
    }
  },[client,coinbase,netId]);


  return (
    <AppContext.Provider value={{ state, actions }}>
      <Game />
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
                <br/>
                Connected as: {user ? user.user.sub : profile?.name ? profile.name : coinbase ? coinbase : "Guest"}
              </Text>
            }
          </Box>
        </Header>
        <Box align="center" className='menu_box'>
          <Heading className='inst_head'>Welcome to <br/><span style={
            {
              fontFamily: 'franchise',
              fontSize: '100px',
              marginTop:'5px',
              display:'block',
            }
          }>Empty Space</span></Heading>
          <p style={
            {
              textAlign: 'center'
            }
          }>
            A game where every space is your space until it's not. <br/>
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
            <Paragraph style={{wordBreak: 'break-word'}}>
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
                <TextInput onChange={event => setUri(event.target.value)}/>
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

            {
              self && !user &&
              <Tab title="Use Profile">
                <br></br>
                {
                  uri !== self.id &&
                  <Button secondary label="Set Profile URI" onClick={() => setUri(self.id)} />
                }
                <Box  direction="row">
                  <Box>
                    <Heading level="2">Edit Profile</Heading>
                    <Text>Name</Text>
                    <TextInput value={name} onChange={event => setName(event.target.value)}/>
                    <Text>Description</Text>
                    <TextInput  value={description} onChange={event => setDescription(event.target.value)}/>
                    <Text>Image</Text>
                    <TextInput  value={img} onChange={event => setImg(event.target.value)}/>
                    <Text>URL</Text>
                    <TextInput  value={url} onChange={event => setUrl(event.target.value)}/>
                    <Text>Scenario</Text>
                    <TextInput  value={scenario} onChange={event => setScenario(event.target.value)}/>
                    <Button secondary label="Save Profile" onClick={async () => {
                      console.log(img)
                      await self.merge('basicProfile',{
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
                  <img className='inst_image' src="img/instructions.png"></img><br/>
                  <div style={
                    {
                      marginLeft:"10px"
                    }
                  }>Use <span>W-A-S-D</span> to move<br/><br/>
                  <span>SPACE</span> to jump<br/><br/>
                  <span>MOUSE</span> to look around<br/><br/>
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
    </AppContext.Provider>
  )
}
