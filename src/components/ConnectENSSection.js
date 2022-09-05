
import React from 'react'
import {
    Spinner,
    Paragraph,
} from 'grommet';

import MyNfts from './MyNfts';

export default function ConnectENSSection(props) {
    return (
        <>
            {

                props.loadingMyNFTs && props.client ?
                    <>
                        <Spinner />
                        <Paragraph>Loading your NFTs ...</Paragraph>
                    </> :
                    (!props.graphErr && props.client) ?
                        <>
                            <MyNfts myOwnedERC1155={props.myOwnedERC1155} myOwnedNfts={props.myOwnedNfts} setMetadata={props.setMetadata} />
                        </> :
                        !props.client &&
                        <>
                            <Paragraph>Sorry! Could not load your NFTs (subgraph can be syncing), try changing network or enter as guest.</Paragraph>
                        </>

            }


        </>
    )
}
