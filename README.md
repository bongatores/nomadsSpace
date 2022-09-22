# EmptySpace

  A 3d space where all places can be yours until someone removes it from you.

  This dapp allows users explore and modfy an empty world by inserting data in it.

  A smart contract has been done to map coordenates in the world (x,z) into a uri, which can be a ipfs hash from custom data with same nft metadata standatard, an ENS (goerli testnetwork) domain name, an UNS domain name, a ipfs hash of a nft metadata or a decentralized identity from ceramic self.id. In the event of data being inserted in a occupied position, chainlink vrf is used to generated a random number that defines if the actual data must be replaced or not.  

## Technologies

  - **React** - constructs the dapp;
  - **Groomet** - react framework to help doing the user interface;
  - **ThreeJS** - renders the 3d world and allows the user to explore it and interact with it;
  - **IPFS** - get data from ipfs, upload data to ipfs using nft.storage (custom data with nft metadata pattern or ceramic self.id image)
  - **TheGraph** - get NFTs and ENS from connected wallet, get positions occupied by users data in the game (custom graph deployed at https://thegraph.com/hosted-service/subgraph/henrique1837/empty-space);
  - **ENS** - get data from ENS domains (avatar, description, name) to display;
  - **UNS** - allows user login with his UNS domain in order to insert it as the data source in the world;
  - **StreamR** - allows connected users to send hello message to all possible connected users;
  - **Ceramic** - used as data for decentralized identities inserted in the contract;
  - **Polygon Mumbai Testnetwork** - game contract deployed at https://mumbai.polygonscan.com/address/0x441ea25a2cd3343fcd1e958c1bfcb0376ffa8b75
  - **Chainlink VRF** - simulates battle for the occupied space;

## Demo Video


## Demo

 - https://empty-space.on.fleek.co/

## Testing Guide

#### Controls
  - WASD keys: move
  - M:  initate streamr and send hello message
  - P: insert data in the current coordenate

<details>
<summary style="font-size:24px"><b>Guest (No Wallet)</b></summary>

  This option can be used by users that does not have Wallet connected, NFTs or custom URI setted.

 - Click "Play" button;

 - Move using arrows keys, explore the empty space! (it can be really empty or not, that depends on users);


</details>

<details>
<summary style="font-size:24px"><b>Custom Data</b></summary>

- Click "Use Wallet" tab;

- Insert data in IPFS

- Click "Play"

- Use "P" to insert the data in the world


</details>

<details>

<summary style="font-size:24px"><b>Using NFT</b></summary>

- Click "Use NFT" tab;

- Select NFT

- Click "Play"

- Use "P" to insert the nft data in the world

</details>


<details>

<summary style="font-size:24px"><b>Using UNS</b></summary>

- Login with UNS;

- Click "Play"

- Use "P" to insert the uns data in the world

</details>


<details>

<summary style="font-size:24px"><b>Using ENS</b></summary>

- Do a domain at https://app.ens.domains/ on goerli testnetwork

- Click "Use ENS" tab;

- Select ENS

- Click "Play"

- Use "P" to insert the ens data in the world


</details>


<details>

<summary style="font-size:24px"><b>Using Ceramic did</b></summary>

- Click "Connect ceramic" secondary button;

- Use actual or update profile

- Click "Play"

- Use "P" to insert the self.id data in the world

</details>



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
