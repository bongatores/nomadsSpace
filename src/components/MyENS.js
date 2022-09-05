import React from 'react'
import {
    Button,
    Box,
    Heading,
    Image,
    Paragraph,
    Card,
    CardHeader,
    CardBody,
    CardFooter
} from 'grommet';


export default function MyENS(props) {
    return (
        <>
            {
                props.myOwnedENS?.length > 0 &&
                <>
                    <Paragraph size="small">Select ENS to play</Paragraph>
                    <Box alignContent="center" align="center" pad="medium" direction="row-responsive" wrap={true}>
                        {
                            props.myOwnedENS?.map(obj => {

                                console.log("####", obj);

                                let uri = obj.contentHash

                                uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");

                                console.log("####URI", uri);



                                return (

                                    <Card key={`${obj.domainName}`} height="medium" width="small" background="light-1" align="center">
                                        <CardHeader pad="medium"><b>{`${obj.domainName}`}</b></CardHeader>
                                        <CardBody pad="small"><Image alignSelf="center" src={uri} width="150px" /></CardBody>
                                        <CardFooter pad={{ horizontal: "small" }} background="light-2" align="center" alignContent="center">
                                            <Button secondary onClick={() => {
                                                props.setMetadata(obj.uri)
                                            }} size="small" label="Select" />
                                        </CardFooter>
                                    </Card>
                                )
                            })
                        }
                    </Box>
                </>
            }
        </>
    )
}
