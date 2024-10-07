import { Route, Routes } from 'react-router-dom';

import Home from './Home.jsx'
import Catalogue from './Catalogue.jsx'
import Account from './Account.jsx'
import Accounts from './Accounts.jsx'
import Token from './Token.jsx';
import NoWalletDetected from "./NoWalletDetected.jsx"

import { ContextProvider } from '../AppContext.jsx';


function Dapp() {
  if (!window.ethereum) {
    return <NoWalletDetected />;
  }

    return(
      <ContextProvider>
        <Routes>
          <Route path="/" element={ <Home /> }></Route>
          <Route path="/Catalogue" element={ <Catalogue /> }></Route>
          <Route path="/Account/:account" element={ <Account /> }></Route>
          <Route path="/Accounts" element={ <Accounts /> }></Route>
          <Route path="/CryptoCorso/:corso" element={ <Token /> }></Route>
        </Routes>
      </ContextProvider>
    )
}

export default Dapp;