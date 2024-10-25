<!-- markdownlint-disable MD014 -->
<!-- markdownlint-disable MD033 -->
<!-- markdownlint-disable MD041 -->
<!-- markdownlint-disable MD029 -->

<div align="center">

<h1 style="font-size: 2.5rem; font-weight: bold;">web4 sandbox</h1>

  <p>
    <strong>simple sandbox to test contract methods in web4 environment</strong>
  </p>

</div>

<details>
  <summary>Table of Contents</summary>

- [Getting Started](#getting-started)
  - [Installing dependencies](#installing-dependencies)
  - [Running the app](#running-the-app)
  - [Building for production](#building-for-production)
- [Learn more about NEAR](#learn-more-about-near)
- [Ethereum wallet login](#ethereum-wallet-login)
- [Preparing for production](#preparing-for-production)
- [Deploy to web4](#deploy-to-web4)
- [Contributing](#contributing)

</details>

## Getting Started

### Installing dependencies

```bash
pnpm install
```

### Running the app

First, run the development server:

```bash
pnpm run dev
```

### Building for production

```bash
pnpm run build
```

## Learn more about NEAR

To learn more about NEAR, take a look at the following resources:

- [NEAR Developer Portal](https://dev.near.org/) - homebase for near developers.
- [NEAR Documentation](https://docs.near.org) - learn about NEAR.
- [Frontend Docs](https://docs.near.org/build/web3-apps/quickstart) - learn about this example.

You can check out [the NEAR repository](https://github.com/near) - your feedback and contributions are welcome!

## Ethereum wallet login

If developing in testnet and logging in with an Ethereum wallet, you will need to top up the created EVM wallet on NEAR Testnet.
Go to [Aurora's NEAR wallet playground](https://near-wallet-playground.testnet.aurora.dev/), switch to the chain, connect to Metamask and load accounts, then Add funds.

Note that you should also modify the Project IDs in [ethereum-wallet](./src/wallets/ethereum-wallet.ts) for the REOWN_PROJECT_ID.

## Preparing for production

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

## Deploy to web4

1. Build the project

```cmd
pnpm run build
```

2. Create a web4 subaccount of your master account (this will be your domain).

```cmd
near account create-account fund-myself web4.MASTER_ACCOUNT.testnet '1 NEAR' autogenerate-new-keypair save-to-keychain sign-as MASTER_ACCOUNT.testnet network-config testnet sign-with-keychain send
```

Be sure to "Store the access key in legacy keychain"!

3. Run web4-deploy to upload production bundle to nearfs and deploy it to a minimum-web4 contract to your account.

```cmd
npx github:vgrichina/web4-deploy dist web4.MASTER_ACCOUNT.testnet --deploy-contract --nearfs
```

Deploy should be accessible and your website accessible at 

`testnet`: MASTER_ACCOUNT.testnet.page

`mainnet`: MASTER_ACCOUNT.near.page

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you're interested in contributing to this project, please read the [contribution guide](./CONTRIBUTING).

<div align="right">
<a href="https://nearbuilders.org" target="_blank">
<img
  src="https://builders.mypinata.cloud/ipfs/QmWt1Nm47rypXFEamgeuadkvZendaUvAkcgJ3vtYf1rBFj"
  alt="Near Builders"
  height="40"
/>
</a>
</div>
