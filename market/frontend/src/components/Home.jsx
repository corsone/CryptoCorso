import { useState, useContext } from "react";

import { useNavigate } from 'react-router-dom';

import { ethers } from "ethers";

import { AppContext } from "../AppContext.jsx";
import CosaSono from "./CosaSono.jsx";
import Accounts from "./Accounts.jsx";
import Modal from "./Modal.jsx";
import Footer from "./Footer.jsx";

import "../css/home.css";
import "../css/intro.css"

function Home() {
    const {setAddress, setError} = useContext(AppContext);
    const navigate = useNavigate();
    const [show, setShow] = useState(false);

    const connectWallet = async () => {
      try{
        const [address] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if(address){
          const fomattedAdress = ethers.utils.getAddress(address);
          setAddress(fomattedAdress); 
        }
      }catch(error){
        setError(error);
        setShow(true);
      }     
  };

    return(
        <div>
          <ConnectedAccount connectWallet={connectWallet} />

          <div className="intro" style={{margin: "0", paddingTop:"0", backgroundColor:"#748EA2"}}><h1 style={{padding: '25px 0 25px 0', color:"white", fontSize:"5vw"}}>CryptoCorso</h1></div>



            <div className="catalogo" style={{margin: "0", paddingTop:"0", paddingBottom:"7%", backgroundColor:"#748EA2"}}>
              <img src="/img/catalogo2.png" style={{maxWidth: "100%", filter: "brightness(0.7)", width:"70vw"}}></img>
              <div style={{position: "absolute", color: "white"}}>
                {/* <h1 style={{textShadow: "rgba(255, 255, 255, 0.5) 1px 0 10px"}}>Catalogo</h1> */}
                <h2 style={{textShadow: "rgba(255, 255, 255, 0.5) 1px 0 10px", paddingTop:"10vh"}}>Visualizza l'intera collezione</h2>
                <div className="bottoneCatalogo">
                  <button  onClick={() => {setTimeout(() => {navigate(`/Catalogue`)}, 300)}}><p style={{margin: 0}}>Vai al catalogo</p></button>
                </div>
              </div>
            </div>

          
            <CosaSono />

            <Accounts isHome={true}/>

            <hr style={{backgroundColor:"#748EA2", height:"2px"}}></hr>

            <div style={{width: "70%", margin: "auto", padding:"50px 0 20px 0" }}>
              <h1 style={{marginBottom:"30px"}}>Informazioni</h1>
              <h2 style={{margin:"0", padding:"0"}}>Cos'è una blockchain</h2>
              <p style={{marginBottom:"0"}}>Una blockchain una tecnologia che consente di gestire e aggiornare un registro <b>distribuito</b> e <b>immutabile</b> senza la necessità di averene un’entità centrale di controllo e verifica(<b>consenso decentralizzato</b>).</p>
              <p style={{marginTop:"0"}}>Come suggerisce il nome, la blockchain è una catena di blocchi, i quali sono una struttura dati contenente le informazioni sulle transazioni eseguite.</p>
              <p>La prima blockchain è stata introdotta nel 2009 da Satoshi Nakamoto con l’obiettivo di fungere da ”libro mastro” della valuta digitale Bitcoin.</p>
              <p>Le caratteristiche principali di una blockchain sono:</p>
                <ul>
                  <li><p>il <b>consenso decentralizzato</b>: in informatica il consenso è legato al problema della sincronizzazione dello stato di un sistema distribuito. L'innovazione principale della blockchain è proprio data dalla definizione di un protocollo per la costruzione di una rete peer-to-peer(P2P) in grado di raggiungere un consenso circa uno stato globale senza l’intervento di un’entità centrale.</p>
                  <p>I protocolli più diffusi per raggiungere tale consenso sono <b>Proof-of-Work(PoW)</b> e <b>Proof-of-Stake(PoS)</b>, i quali, attraverso un attento bilanciamento tra rischi e ricompense ”obbligano” i partecipanti a comportarsi onestamente per il proprio interesse personale.</p>
                  </li>                 
                  <li><p>l'<b>immutabilità</b>: nessun partecipante può modificare o manomettere una transazione dopo che è stata registrata sul libro registro condiviso.</p></li>
                </ul>
              
              <h2 style={{margin:"50px 0 0 0", padding:"0"}}>Cos'è un NFT</h2>
              <p style={{marginBottom:"0"}}>Per capire cos'è un <b>non-fungible token(NFT)</b> dobbiamo dare prima la definizione di <b>fungibilità</b>. Quando diciamo che un oggetto è fungibile, significa che questo può essere interscambiato con un altro oggetto identico e con le stesse proprietà.</p>
              <p style={{marginTop:"0"}}>Un esempio classico di bene fungibile è una banconota: non ci interessa quale particolare banconota da 5 euro abbiamo nel portafoglio perché sono tutte identiche e tutte hanno lo stesso valore.</p>
              <p>Al contrario, un NFT è un oggetto <b>non fungibile</b> che viene memorizzato sulla blockchain. Un oggetto, quindi, viene detto non fungibile quando è unico e possiede proprietà individuali che lo distinguono da tutti gli altri.</p>
              <p>Un NFT può rappresentare qualsiasi oggetto unico sia nel mondo reale che in quello digitale: possono essere utilizzati ad esempio nel campo dell'arte per rappresentare un'opera digitale, oppure come biglietti per un evento o per certificare di aver completato un determinato corso.</p>
              <p>Grazie alla blockchain tutte le transazioni che riguardano un token vengono resgitrate, ciò permette di avere una dichiarazione permanente di autenticità che può essere visualizzata e accessibile da chiunque.</p>
          </div>

            <Modal show={show} setShow={setShow}/>
            <Footer />
        </div>
    )
}

export default Home;

function ConnectedAccount({connectWallet}) {
  const {address} = useContext(AppContext);
  const navigate = useNavigate();
  const [showAccount, setShowAccount] = useState(true);

  if(!showAccount){
      return(
        <div style={{textAlign: 'center'}}>
          <button className="accountButton" style={{margin:"0", position: "absolute", color: "white", backgroundColor:"transparent", fontSize:"30px"}} onClick={() => {setShowAccount(true)}}>▼</button>
        </div>
      )
    }

    if(address){
      return(
        <div className="accountContainer">
          <p className="account" onClick={() => {navigate(`/Account/${address}`)}}>Account: {address}</p>
          <button className="accountButton" onClick={() => {setShowAccount(false)}} style={{fontSize:"25px"}}>▲</button>
        </div>
      )
    }else{
      return(
        <div className="accountContainer">
          <p className="account" onClick={connectWallet}>Premi qui per connettere un wallet</p>
        </div>
      )
    }
}