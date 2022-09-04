import {
  Button,
  Heading,
  Box,
  Paragraph,
  Text
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
        !state.coinbase ?
        <Button onClick={props.loadWeb3Modal} label="Connect wallet" /> :
        !state.self &&
        window.ethereum &&
        <Button onClick={async () => {
          const newSelf = await authenticateWithEthereum(state.coinbase);
          const newProfile = await newSelf.get('basicProfile');
          props.setSelf(newSelf);
          props.setProfile(newProfile);
          props.setUri(newSelf.id);
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
      state.uri &&
      <Paragraph style={{wordBreak: 'break-word'}}>
        URI: {state.uri}
      </Paragraph>
    }
    </>
  )
}
