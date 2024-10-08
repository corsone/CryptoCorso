import { createContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import Market from './contracts/Market.json';

export const AppContext = createContext(null);

export const ContextProvider = ({children}) => {
    const [address, setAddress] = useState(localStorage.getItem('connectedAccount'));
    const [networkError, setNetworkError] = useState(undefined);
    const [errore, setErrore] = useState(undefined);

    const SEPOLIA_NETWORK_ID = '0xaa36a7'; //id sepolia Network
    const marketAddress = '0x277027C09036fAe65A4D4013ac2F3949327b2D50'; 
    const marketOwner = '0xC783Ab3AdCfdC25900F1A2B4776823D5D8D703cB';
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let signer;
    if(address){
      signer = provider.getSigner();
    }else{
      signer = provider.getSigner('0xC783Ab3AdCfdC25900F1A2B4776823D5D8D703cB');
    }
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
  
      if (networkId !== SEPOLIA_NETWORK_ID) {
        setNetworkError(`Connected to wrong network. Please switch to the sepolia network`);
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
      if(err !== undefined && err.reason !== undefined){
        let message = err.reason.replace('Error: VM ', '');
        message = message.replace(' reverted with reason string \'', ' ');
        message = message.replace('\'', '');
        console.log(message);
        setErrore(message);
      }else if(err !== undefined && err.message !== undefined){
        let message = err.message.replace('Error: VM ', '');
        message = message.replace(' reverted with reason string \'', ' ');
        message = message.replace('\'', '');
        console.log(message);
        setErrore(message);
      }else{
        setErrore(undefined);
      }
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