import React from 'react'
import {
  Text,
  TextInput,
 } from 'grommet';

//import { useAppContext } from '../hooks/useAppState'


export default function UseWalletSection(props){

  //const { state } = useAppContext();

  return(
    <>
    <br></br>
    <Text><center>Enter IPFS Hash</center></Text>
    <TextInput onChange={event => props.setUri(event.target.value)}/>
    </>
  )
}
