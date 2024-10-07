import { createContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import Market from './contracts/Market.json';

export const AppContext = createContext(null);

export const ContextProvider = ({children}) => {
    const [address, setAddress] = useState(localStorage.getItem('connectedAccount'));
    const [networkError, setNetworkError] = useState(undefined);
    const [errore, setErrore] = useState(undefined);

    const HARDHAT_NETWORK_ID = '0x7a69'; //id Hardhat Network
    const marketAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; 
    const marketOwner = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    const signer = provider.getSigner();
    const market = new ethers.Contract(marketAddress, Market.abi, signer);
  
    const handleAccountsChanged = ([newAddress]) => {
      if (!newAddress) {
        localStorage.removeItem('connectedAccount');
        setAddress(undefined);
      } else {
        const fomattedAdress = ethers.utils.getAddress(newAddress);
        localStorage.setItem('connectedAccount', fomattedAdress);
        setAddress(fomattedAdress);
      }
    }
  
    useEffect(() => {
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        return () => {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        };
      }
    }, [handleAccountsChanged]);
  
  
    const handleNetwork = async () => {
      const networkId = await window.ethereum.request({ method: 'eth_chainId' });
  
      if (networkId !== HARDHAT_NETWORK_ID) {
        setNetworkError(`Connected to wrong network. Please switch to the network with ID ${HARDHAT_NETWORK_ID}.`);
      }else{
        setNetworkError(undefined); 
      }
    };
    
  
    useEffect(() => {
      window.ethereum.on('chainChanged', handleNetwork);
      return () => {
        window.ethereum.removeListener('chainChanged', handleNetwork);
      }
    }, [handleNetwork])

    useEffect(() => {
        handleNetwork();
    })

    const setError = (err) => {
      // formatta il messaggio di errore
      let message = err.reason ? err.reason.replace('Error: VM ', '') : err.message;
      message = message.replace(' reverted with reason string \'', ' ');
      message = message.replace('\'', '');
      console.log(message);
      setErrore(message);
  }

    const value = {
        address,
        setAddress,
        networkError,
        setNetworkError,
        marketAddress,
        marketOwner,
        provider,
        signer,
        market,
        errore,
        setError
    }

    return (
        <AppContext.Provider value={value}>
            {networkError !== undefined && (
              <div className='networkError'>
                  <h2>{networkError}</h2>
              </div>
            )}
            {children}
        </AppContext.Provider>
    )
}