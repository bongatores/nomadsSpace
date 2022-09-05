
import React from 'react'
import {
    Spinner,
    Paragraph,
} from 'grommet';

import MyENS from './MyENS';

export default function ConnectENSSection(props) {
    return (
        <>
            {

                props.loadingMyENS && props.client ?
                    <>
                        <Spinner />
                        <Paragraph>Loading your ENS domains ...</Paragraph>
                    </> :
                    (!props.graphErr && props.client) ?
                        <>
                            <MyENS myOwnedENS={props.myOwnedENS} />
                        </> :
                        !props.client &&
                        <>
                            <Paragraph>Sorry! Could not load your ENS (subgraph can be syncing), try changing network or enter as guest.</Paragraph>
                        </>

            }


        </>
    )
}
