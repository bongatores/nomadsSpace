import React,{useState,useEffect} from 'react'
import {
  Accordion,
  AccordionPanel,
  Text,
  TextInput,
  Box,
  FileInput,
  Button,
  Spinner
 } from 'grommet';
 import { NFTStorage } from 'nft.storage'


const fr = new FileReader();
const client = new NFTStorage({ token: process.env.REACT_APP_NFT_STORAGE_API })

export default function UseWalletSection(props){

  //const { state } = useAppContext();
  const [name,setName] = useState();
  const [description,setDescription] = useState();
  const [file,setFile] = useState();
  const [uploading,setUploading] = useState();
  const [metadata,setMetadata] = useState();
  useEffect(() => {
    fr.addEventListener('progress', event => {setUploading(true)});
    fr.addEventListener('load', async event => {
      const img = event.target.result;
      const newMetadata = {
        description: description,
        image: img,
        name: name
      }
      setMetadata(newMetadata)

      setUploading(false);
    });
  },[name,description])

  useEffect(() => {
    if(file){
      fr.readAsDataURL(file)
    }
  },[file])

  return(
    <Accordion>
    <Box>
      <TextInput onChange={event => setName(event.target.value)} placeholder='Name' className='input_box'/>
      <TextInput onChange={event => setDescription(event.target.value)} placeholder='Description' className='input_box'/>
      <FileInput
        name="Select image"
        accept="image/*"
        onChange={event => {
          const fileList = event.target.files;
          setFile(fileList[0]);
        }}
      />
      {
        name && description && metadata && !uploading &&
        <Button onClick={async () => {
          setUploading(true)
          console.log(metadata)
          const storageRes = await NFTStorage.encodeBlob(new Blob([JSON.stringify(metadata)]));
          const cidNftStorageMetadata = await client.storeCar(storageRes.car);
          console.log(`NFT Storage CID Metadata: ${cidNftStorageMetadata}`);
          props.setUri(cidNftStorageMetadata);
          setUploading(false);
        }} label="Upload to IPFS" />
      }
      {
        uploading &&
        <Box align="center">
          <Spinner />
        </Box>
      }
    </Box>
      <AccordionPanel label="Advanced">
        <Box direction="row">
          <Text><center>Enter IPFS Hash</center></Text>
          <TextInput onChange={event => props.setUri(event.target.value)}/>
        </Box>
      </AccordionPanel>
    </Accordion>
  )
}
