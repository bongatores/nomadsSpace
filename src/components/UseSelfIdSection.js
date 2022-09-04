import React from 'react'
import {
  Button,
  Heading,
  Box,
  TextInput,
  Text
 } from 'grommet';

import { useAppContext } from '../hooks/useAppState'


export default function UseSelfIdSection(props){

  const { state } = useAppContext();

  return(
    <>
    <br></br>
    {
      state.uri !== state.self.id &&
      <Button secondary label="Set Profile URI" onClick={() => props.setUri(state.self.id)} />
    }
    <Box  direction="row" style={{wordBreak: 'break-word'}}>
      <Box>
        <Heading level="2">Edit Profile</Heading>
        <Text>Name</Text>
        <TextInput value={props.name} onChange={event => props.setName(event.target.value)}/>
        <Text>Description</Text>
        <TextInput  value={props.description} onChange={event => props.setDescription(event.target.value)}/>
        <Text>Image</Text>
        <TextInput  value={props.img} onChange={event => props.setImg(event.target.value)}/>
        <Text>URL</Text>
        <TextInput  value={props.url} onChange={event => props.setUrl(event.target.value)}/>
        <Text>Scenario</Text>
        <TextInput  value={props.scenario} onChange={event => props.setScenario(event.target.value)}/>
        <Button secondary label="Save Profile" onClick={async () => {
          console.log(props.img)
          await state.self.merge('basicProfile',{
            name: props.name,
            description: props.description,
            //image: makeBlockie(self.id),
            url: props.url,
            scenario: props.scenario
          });
          const newProfile = await state.self.get('basicProfile');
          props.setProfile(newProfile);
          props.setUri(state.self.id)
          console.log("Profile Saved")
        }} />
      </Box>
      <Box>
        <Heading level="2">Actual Profile</Heading>
        <Text>Name: {state.profile?.name}</Text>
        <Text>Description: {state.profile?.description}</Text>
        <Text>Image: {state.profile?.image}</Text>
        <Text>URL: {state.profile?.url}</Text>
        <Text>Scenario: {state.profile?.scenario}</Text>
      </Box>
    </Box>
    </>
  )
}
