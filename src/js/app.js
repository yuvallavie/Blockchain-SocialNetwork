/*
MetaMask documentation
https://docs.metamask.io/guide/getting-started.html

EtherJS Documentation
https://docs.ethers.io/v5/getting-started/

Deploying for binance
https://docs.binance.org/smart-chain/developer/issue-BEP20.html

Auto identation (Alt + Shift + F)

// ----------------------------------- //
            Initialization
// ----------------------------------- //
1. Open up Ganache, click QuickStart.
2. Open a CMD screen in the root folder.
3. Run the following commands
  3.1 truffle compile
  3.2 truffle migrate --reset
4. Copy the "Contract address" of "2_deploy_token.js" from the CMD and replace it with the one below.
5. Run the command
  5.1 npm run dev
6. Open the browser at localhost:8000.
7. Import the private key of the first address in the Ganache CLI to MetaMask.
8. Open MetaMask and connect this new account.
9. use truffle console to access this contract manually.
10. In truffle console type - let instance = await SocialCoin.deployed().
11. try checking the contract name with instance.name()

// ----------------------------------- //
                Flow
// ----------------------------------- //
  1. Present a loading screen
  2. Verify the installation of MetaMask and handle the cases.
  3. Ask the user to connect his wallet
  4. Load the accounts and balances


// ----------------------------------- //
                 TODO
// ----------------------------------- //

  1. Add the token to the users MetaMask 
    https://docs.metamask.io/guide/registering-your-token.html#code-free-example

  2. Understand token verification
  3. Understand if we need to change Etherjs to the binance injected web3 service.
  4. We can probably deploy from remix and then write the frontend only.
  5. Create a token dashboard (OPTIONAL)

*/


App = {

  provider: null,
  signer: null,
  contractAddress: "0x754d5C635aaB366f5766f80689623BC6da7BeFEB",
  currentAccount: null,
  contractABI:null,
  content: document.getElementById("content"),

  load: async () => {
    content.innerHTML = "<p>Loading..</p>";
    $.getJSON('SocialCoin.json', function(data) {
      App.contractABI = data.abi;
      App.startUp();
    });
  },


  startUp: async () => {
    console.log("1. Verifying MetaMask installation.");
    if (typeof window.ethereum !== 'undefined') {
      console.log("   MetaMask is installed.");

      // Handle refresh and other changes.
      ethereum
        .request({ method: 'eth_accounts' })
        .then(App.handleAccountsChanged)
        .catch((err) => {
          // Some unexpected error.
          // For backwards compatibility reasons, if no accounts are available,
          // eth_accounts will return an empty array.
          console.error(err);
        });


      // Handle changing of networks
      ethereum.on('chainChanged', chainId => {
        console.log("Networks chainId: ", chainId);
        if (chainId != "0x539") {
          content.innerHTML = "<p>Please connect to the development network</p>";
          //  App.connectToNetwork(); // We are not using this right now because of a bug in Ganache GUI. it works for CLI and mainnet.
        } else {
          window.location.reload();
        }
      })


      // Add a listener to handle when the user changes his current account
      ethereum.on('accountsChanged', App.handleAccountsChanged);

    } else {
      console.log('Please install MetaMask!');
      // Render
      content.innerHTML = "<p>Please install MetaMask</p><br> <a class = 'button-23' href='https://metamask.io/download'>Download MetaMask</a>";
    }
  },

  connectWallet: async () => {
    await ethereum
      .request({ method: 'eth_requestAccounts' }).then(() => {
        console.log("   Wallet connected - handleAccountsChanged() takes care of this.");
      });
  },
  connectToNetwork: async () => {
    // Make sure the user's wallet is connected to the correct network.
    ethereum
      .request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x539' }] })
      .then(App.handleAccountsChanged)
      .catch((err) => {
        // Some unexpected error.
        // For backwards compatibility reasons, if no accounts are available,
        // eth_accounts will return an empty array.
        console.error(err);
      });
  },
  // For now, 'eth_accounts' will continue to always return an array
  handleAccountsChanged: async (accounts) => {
    // Make sure the user is connected to the correct network
    ethereum
      .request({ method: 'eth_chainId' }).then((val) => {
        if (val != '0x539') {
          console.log("Network id is", val);
          content.innerHTML = "<p>Please connect to the development network</p>";
        } else {
          if (accounts.length === 0) {
            // MetaMask is locked or the user has not connected any accounts
            // Render
            console.log("2. Please connect your wallet.");
            content.innerHTML = "<p>Please connect to MetaMask</p><br> <button id = 'connectButton' class='button-23' role='button'>CONNECT WALLET</button>";
            document.getElementById("connectButton").onclick = App.connectWallet;

          } else if (accounts[0] !== App.currentAccount) {
            // Loading the account
            App.loadAccount(accounts);
          }
        }
      });

  },


  loadAccount: async (accounts) => {

    // Initialize the Web3 provider
    App.provider = new ethers.providers.Web3Provider(window.ethereum);
    // Get the account details
    App.currentAccount = accounts[0];
    var ethBalance = await App.provider.getBalance(App.currentAccount);

    console.log("3. Account connected");
    console.log("   Address:", App.currentAccount);
    console.log("   Ethereum Balance:", ethers.utils.formatEther(ethBalance));
    content.innerHTML = "<p>Getting your details..</p>";
    // Loading the contract
    App.loadContract();
  },

  loadContract: async () => {
    console.log("4. Loading contract");

    if (App.provider != null) {
      // The MetaMask plugin also allows signing transactions to
      // send ether and pay to change state within the blockchain.
      // For this, you need the account signer...
      App.signer = App.provider.getSigner();

      // Verify that we are connected to the correct network


      // Connect to the contract
      // The Contract object

      const contract = new ethers.Contract(App.contractAddress, App.contractABI, App.provider);
      var tokenName = await contract.name();
      var tokenSymbol = await contract.symbol();
      console.log("   Contract:", tokenName, "(", tokenSymbol, ")");
      var tokenBalance = await contract.balanceOf(App.currentAccount);
      var formattedTokenBalance = ethers.utils.formatUnits(tokenBalance, 18)
      console.log("   Balance:" + formattedTokenBalance);

      if (formattedTokenBalance >= 100) {
        content.innerHTML = "<p>Welcome!</p>";
      } else {
        content.innerHTML = "<p>You must have at least 100 SC's to view the site.</p><br> <a class = 'button-23' href='https://pancakeswap.finance/swap?inputCurrency=0x55d398326f99059ff775485246999027b3197955&outputCurrency=0x8d14C39B856A763744a5C09F628b5df19fdcefd3'>Buy SC on PancakeSwap</a>";
      }

    } else {
      console.log("Please try connecting to the MetaMask again.");
    }
  },
}

$(() => {
  $(window).load(() => {
    App.load();
  })
})