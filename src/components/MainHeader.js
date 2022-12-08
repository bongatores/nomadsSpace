import {
  Button,
  Header,
  Heading,
  Box,
  Text
 } from 'grommet';

 import { useAppContext } from '../hooks/useAppState'


export default function MainHeader(props){

  const { state } = useAppContext();


  return(
    <Header background="brand" align="start" className='navbar'>
      <Heading className='heading' margin="small">Nomads Space</Heading>
      <Box align="end" pad="small" alignContent="center" >
        {
          state.coinbase ?
          <Button onClick={() => {
            props.logoutOfWeb3Modal();
            props.setSelf();
            props.setProfile();
          }} label="Disconnect" /> :
          <Button primary onClick={props.loadWeb3Modal} label="Connect Wallet" />
        }
        {
          state.netId && state.coinbase &&
          <Text size="xsmall" alignSelf="center" alignContent="center">
            ChainId: {state.netId}
            <br/>
            Connected as: {
              state.user ? state.user.sub :
              state.profile?.name ? state.profile.name :
              state.coinbase ? state.coinbase :
              "Guest"
            }
          </Text>
        }
      </Box>
    </Header>
  )
}
