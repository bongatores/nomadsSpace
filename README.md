# NomadSpace

  This dapp allows users to explore and modify an empty world by inserting data in it.

  A Smart Contract was deployed to map coordinates in the world (x,z) into a URI, which can be a IPFS Hash from custom data with same NFT metadata standatard, an ENS (goerli testnetwork) domain name, an UNS domain name or a decentralized identity from Ceramic `self.id`. In the event of trying to insert data at an occupied position  Chainlink VRF is used to simulate a coin flip (50% chance of replacing).

## Technologies

  - **React** - constructs the dapp;
  - **Groomet** - react framework to help doing the user interface;
  - **ThreeJS** - renders the 3d world and allows the user to explore it and interact with it;
  - **IPFS** -  gets data from ipfs, upload data to ipfs using nft.storage (custom data with NFT metadata pattern or ceramic self.id image)
  - **TheGraph** - gets NFTs and ENS from connected wallet, get positions occupied by users data in the game (custom graph deployed at https://thegraph.com/hosted-service/subgraph/henrique1837/empty-space);
  - **ENS** - gets data from ENS domains (avatar, description, name) to display;
  - **UNS** - allows user login with his UNS domain in order to insert it as the data source in the world;
  - **Ceramic** - used as data for decentralized identities inserted in the contract;
  - **Polygon Mumbai Testnetwork** - game contract deployed at https://mumbai.polygonscan.com/address/0x441ea25a2cd3343fcd1e958c1bfcb0376ffa8b75
  - **Chainlink VRF** - simulates battle for the occupied space;

## Demo Video

 - https://bafybeidu4hbqvnr5p7k3njhsgdz3n6z76gqiqvzxgzd72sh4cw2o4gruv4.ipfs.nftstorage.link/

## Demo

 - https://nomadspace.on.fleek.co/

## Testing Guide

#### Controls
  - `WASD` keys: Move
  - `M` key: Initiate Streamr and send hello message
  - `P` key: Insert data in the current coordinate

<details>
<summary style="font-size:24px"><b>Guest (No Wallet)</b></summary>

  This option can be selected by users that don't have Wallet connected, NFTs or custom URI setted.

 - Click "Play" button;

 ![Guest](https://nftstorage.link/ipfs/bafybeifdfj6j47qflrid3w2h52gjzh7w2fdxyb72o3v74zdb2ppcgo7sha/guest_1.png "Guest")

 - Move using `WASD` keys, explore the empty space! (it can be really empty or not, that depends on users!);

 ![Guest](https://nftstorage.link/ipfs/bafybeifdfj6j47qflrid3w2h52gjzh7w2fdxyb72o3v74zdb2ppcgo7sha/guest_2.png "Guest")

</details>

<details>
<summary style="font-size:24px"><b>Custom Data</b></summary>

- Connect your wallet

![Custom](https://nftstorage.link/ipfs/bafybeifdfj6j47qflrid3w2h52gjzh7w2fdxyb72o3v74zdb2ppcgo7sha/wallet_1.png "Custom")

- Click "Use Wallet" tab;

- Insert data in IPFS

 ![Custom](https://nftstorage.link/ipfs/bafybeifdfj6j47qflrid3w2h52gjzh7w2fdxyb72o3v74zdb2ppcgo7sha/wallet_2.png "Custom")

- Click "Play"

- Use "P" to insert the data in the world

 ![Custom](https://nftstorage.link/ipfs/bafybeifdfj6j47qflrid3w2h52gjzh7w2fdxyb72o3v74zdb2ppcgo7sha/wallet_3.png "Custom")


</details>

<details>

<summary style="font-size:24px"><b>Using NFT</b></summary>

- Click "Use NFT" tab;

- Select NFT

 ![NFT](https://nftstorage.link/ipfs/bafybeifdfj6j47qflrid3w2h52gjzh7w2fdxyb72o3v74zdb2ppcgo7sha/nft_1.jpeg "NFT")

- Click "Play"

- Use "P" to insert the nft data in the world

 ![NFT](https://nftstorage.link/ipfs/bafybeifdfj6j47qflrid3w2h52gjzh7w2fdxyb72o3v74zdb2ppcgo7sha/nft_2.jpeg "NFT")

</details>


<details>

<summary style="font-size:24px"><b>Using UNS</b></summary>

- Login with UNS;

 ![UNS](https://nftstorage.link/ipfs/bafybeifdfj6j47qflrid3w2h52gjzh7w2fdxyb72o3v74zdb2ppcgo7sha/uns_1.png "UNS")

- Click "Play"

 ![UNS](https://nftstorage.link/ipfs/bafybeifdfj6j47qflrid3w2h52gjzh7w2fdxyb72o3v74zdb2ppcgo7sha/uns_2.png "UNS")

- Use "P" to insert the uns data in the world

 ![UNS](https://nftstorage.link/ipfs/bafybeifdfj6j47qflrid3w2h52gjzh7w2fdxyb72o3v74zdb2ppcgo7sha/uns_3.png "UNS")

</details>


<details>

<summary style="font-size:24px"><b>Using ENS</b></summary>

- Do a domain at https://app.ens.domains/ on goerli test network

 ![ENS](https://nftstorage.link/ipfs/bafybeifdfj6j47qflrid3w2h52gjzh7w2fdxyb72o3v74zdb2ppcgo7sha/ens_1.png "ENS")

- Click "Use ENS" tab;

- Select ENS

 ![ENS](https://nftstorage.link/ipfs/bafybeifdfj6j47qflrid3w2h52gjzh7w2fdxyb72o3v74zdb2ppcgo7sha/ens_2.jpeg "ENS")

- Click "Play"

- Use "P" to insert the ens data in the world.

 ![ENS](https://nftstorage.link/ipfs/bafybeifdfj6j47qflrid3w2h52gjzh7w2fdxyb72o3v74zdb2ppcgo7sha/ens_3.jpeg "ENS")


</details>


<details>

<summary style="font-size:24px"><b>Using Ceramic did</b></summary>

- Click "Connect ceramic" secondary button;

 ![Ceramic](https://nftstorage.link/ipfs/bafybeifdfj6j47qflrid3w2h52gjzh7w2fdxyb72o3v74zdb2ppcgo7sha/ceramic_1.jpeg "Ceramic")

- Use actual or update profile

 ![Ceramic](https://nftstorage.link/ipfs/bafybeifdfj6j47qflrid3w2h52gjzh7w2fdxyb72o3v74zdb2ppcgo7sha/ceramic_2.jpeg "Ceramic")

- Click "Play"

- Use "P" to insert the self.id data in the world

 ![Ceramic](https://nftstorage.link/ipfs/bafybeifdfj6j47qflrid3w2h52gjzh7w2fdxyb72o3v74zdb2ppcgo7sha/ceramic_3.jpeg "Ceramic")

</details>


## .env variables

 - `REACT_APP_NFT_STORAGE_API`
 - `REACT_APP_UNS_REDIRECT`
 - `REACT_APP_UNS_ID`

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
