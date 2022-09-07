import React,{useEffect} from 'react'
import {
    Image,
    Card,
    CardHeader,
    CardBody,
    CardFooter
} from 'grommet';


import { useAppContext } from '../hooks/useAppState'


export default function MyUNS(props) {

    const { state } = useAppContext();

    useEffect(() => {
      if(!state.user) return
      props.setMetadata(state.user.sub);
    },[state.user])

    return (
      <>
      {
        state.user &&
        <Card  height="medium" width="medium" background="light-1" align="center">
          <CardHeader pad="medium"><b>{state.user.sub}</b></CardHeader>
          <CardBody pad="small"><Image alignSelf="center" src={`https://metadata.unstoppabledomains.com/image-src/${state.user.sub}.svg`} width="250px"/></CardBody>
          <CardFooter pad={{horizontal: "small"}} background="light-2" align="center" alignContent="center">

          </CardFooter>
        </Card>
      }
      </>
    )
}
