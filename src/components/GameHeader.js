import {
  Button,
  Heading,
  Box,
  Paragraph,
 } from 'grommet';

import { useAppContext } from '../hooks/useAppState'


import authenticateWithEthereum from '../hooks/useSelfID.js';


export default function GameHeader(props){

  const { state } = useAppContext();

  return(
    <>
    <Heading className='inst_head'>Welcome to <br/><span style={
      {
        fontFamily: 'franchise',
        fontSize: '100px',
        marginTop:'5px',
        display:'block',
      }
    }>Nomads Space</span></Heading>
    <p style={
      {
        textAlign: 'center'
      }
    }>
      A space to tell everyone about your adventures around the world.
    </p>
    <Box direction="row" style={
      {
        marginBottom: '15px'
      }
    }>

      <Button primary label="Click to play" id="instructions" />
      {
        /*
        !state.coinbase ?
        <Button onClick={props.loadWeb3Modal} label="Connect wallet" /> :
        !state.self &&
        !state.user &&
        window.ethereum &&
        <Button onClick={async () => {
          const newSelf = await authenticateWithEthereum(state.coinbase);
          const newProfile = await newSelf.get('basicProfile');
          props.setSelf(newSelf);
          props.setProfile(newProfile);
          props.setUri(newSelf.id);
        }} label="Connect ceramic" />
        */
      }
    </Box>
    {/* <Paragraph style={{wordBreak: 'break-word'}}>
      Connected as {user ? user.user.sub : profile?.name ? profile.name : coinbase ? coinbase : "Guest"}
    </Paragraph> */}
    {/* <Paragraph style={{wordBreak: 'break-word'}}>
      ChainId: {netId}
    </Paragraph> */}

    {
      state.uri &&
      <Paragraph className='selected'>
        Chosen URI: <span>{state.uri}</span>
      </Paragraph>
    }
    </>
  )
}
