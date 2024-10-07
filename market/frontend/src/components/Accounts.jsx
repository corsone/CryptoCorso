import { useContext, useEffect, useState } from "react";

import { Link, useNavigate } from 'react-router-dom';

import { AppContext } from "../AppContext.jsx";

import Navbar from "./Navbar.jsx";

import "../css/account.css"
import "../css/token.css"
import Footer from "./Footer.jsx";
import Modal from "./Modal.jsx";

function Accounts({isHome}) {
    const { market, setError } = useContext(AppContext);
    const navigate = useNavigate();
    const [minted, setMinted] = useState(0);
    const [balance, setBalance] = useState([]);
    const [show, setShow] = useState(false);


    useEffect(() => {
        getCount(); // recupera tutti i token creati
        getTopOwners();
    }, [minted]);
    
    const getCount = async () => {
       try{
            // ritorna il numero totale
            const count = await market.totalSupply();
            setMinted(parseInt(count));
       }catch(error){
            setError(error);
            setShow(true);
       }
    }


    const getTopOwners = async () => {
        try{
            let owner = "";
            let balance = new Map();
            let n = 0;

            // cicla tutti gli nft creati e salva per ogni owner il numero di nft
            for(let i=1; i<=minted;i++){
                owner = await market.ownerOf(i);
                n = await market.balanceOf(owner);

                balance.set(owner, parseInt(n));
            }        

            // li ordina in ordine decrescente in base al numero di nft posseduti
            balance = new Map([...balance.entries()].sort((a, b) => b[1] - a[1]));

            // tiene solo i primi 10
            if(balance.length > 10)
                balance.length = 10;

            setBalance(balance);
        }catch(error){
            setError(error);
            setShow(true);
        }
    };
    

    return(
        <div>
        {!isHome && <Navbar prevPage="/" />}
        {balance.size > 0 && (
        <div style={{margin:"50px 0 0px 0"}}>
            <div className="profilo" style={!isHome ? {margin:"0", padding:"20px 0 50px 0",  width:"100%", backgroundColor:"white", height:window.innerHeight} : {margin:"0", padding:"20px 0 50px 0",  width:"100%", backgroundColor:"white"}}>
                <div className="posseduti">
                        <div style={{width:"70%", margin: "auto", color:"black"}}>
                            {!isHome ? <h2>Tutti gli account</h2> : <h2>Accounts con il maggior numero di CryptoCorso</h2>}
                                <table style={{marginTop:"20px"}}>
                                    <thead>
                                        <tr>
                                            <th><p>Posizione</p></th>
                                            <th><p>Indirizzo</p></th>
                                            <th style={{textAlign:"center"}}><p>Numero CryptoCorsi</p></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.from(balance).map(([key, value], i) => (
                                            <tr key={i}>
                                                <td><p>#{i+1}</p></td>
                                                <td style={{cursor:"pointer", maxWidth:"200px"}}><Link to={`/Account/${key}`}><p>{key}</p></Link></td>
                                                <td style={{textAlign:"center"}}><p>{value}</p></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {isHome && <div className="catalogo">
                                    <div>
                                        <button className="button" onClick={() => {setTimeout(() => {
                                            navigate(`/Accounts`);
                                        }, 300)}}><p style={{margin: 0}}>Visualizza tutti gli account</p></button>
                                    </div>
                                </div>}
                        </div>
                    </div>
                </div>
                {!isHome && <Footer />}
            </div> )}
                    
            <Modal show={show} setShow={setShow} />
        </div>
    )
}

export default Accounts;
