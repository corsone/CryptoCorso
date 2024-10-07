import { Link } from 'react-router-dom';


import Navbar from "./Navbar.jsx";

import "../css/catalogue.css"
import Footer from "./Footer.jsx";


function Catalogue() { 
    const tipi = [
        {tipo: "unico", img: "img/unico.png", desc: "Sfondo arcobaleno", cfu: 'tesi'},
        {tipo: "epico", img: "img/epico.png", desc: "Sfondo viola", cfu: '12 cfu'},
        {tipo: "raro", img: "img/raro.png", desc: "Sfondo arancione", cfu: '6 cfu'},
        {tipo: "comune", img: "img/comune.png", desc: "Sfondo verde", cfu: '3 cfu'},
    ]


    const corsi = {
        anno: ["Primo anno", "Secondo anno", "Terzo anno"],
        titoli: [["analisi matematica I", "logica", "lingua inglese", "algebra lineare", "fisica I", "probabilità", "architettura degli elaboratori", "programmazione I"],
                ["programmazione Python", "analisi matematica II", "reti di calcolatori", "sistemi e segnali", "fisica II", "programmazione II e ingegneria del software",
                    "sistemi operativi", "algoritmi"],
                ["latex", "programmazione di smart contract per Ethereum", "elaborazione segnali e immagini", "fondamenti dell'informatica", "linguaggi", 
                    "programmazione e sicurezza delle reti", "basi di dati", "tesi"]]
    }

    let n = 0;
    

    return(
        <div>
            <Navbar prevPage={"/"}/>
            <div className="container">
                <div className="testo">
                    <h1 style={{marginBottom: "20px"}}>Catalogo CryptoCorso</h1>
                    <p style={{margin: '0px 0px 0px 0px'}}>Benvenuto nel catalogo della raccolta. Qui troverai tutti gli NFT che puoi richiedere.</p>
                    <p style={{margin: '0px 0px 0px 0px'}}>Ognuno di essi rappresenta un corso diverso della laurea in informatica.</p>
                    
                    <p style={{margin: '20px 0px 0px 0px'}}>Esistono diverse tipologie di corsi con diverse rarità.</p>
                    <p style={{margin: '0px 0px 0px 0px'}}>La rarità di un NFT è data dal numero di CFU del corso che quel token rappresenta.</p>
                </div>
                <div className="tipi" style={{margin: "0", padding: "0"}}>
                    {tipi.map((value, index) => (
                        <div key={index} className="tipo">
                            <p style={{marginBottom: '0'}}>{value.tipo} - {value.cfu}</p>
                            <img src={value.img} width="70%"></img>
                            <p style={{marginTop: '0'}}>{value.desc}</p>
                        </div>
                    ))}
                </div>

                <div style={{width: '70%', margin:"auto"}}>
                    <h1>Tutti i CryptoCorso</h1>
                    {corsi.anno.map((anno, i) => (
                            <div key={i}>
                                <h2>{anno}</h2>
                                <div style={{display:"flex",flexWrap: "wrap", gap: "15px"}}>
                                    {corsi.titoli[i].map((corso, j) => (
                                        <div key={j} className="corsiContainer" style={{ width: "calc(33.33% - 10px)" }}>
                                            <Link to={`/CryptoCorso/${corso}?prevPage=/Catalogue`}>
                                                <img className="corsi" src={`/img/corsi/${corso}.png`} width="100%"></img>
                                            </Link>
                                            <div style={{height:"100px", padding:"0 20px 0 20px", overflow:"hidden"}}>
                                                <b><p style={{margin:"0", padding:"20px 0 0 0"}}>#{n++}</p></b>
                                                <p style={{margin:"0", padding:"0"}}>{corsi.titoli[i][j]}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
            
            <Footer />
        </div>
    )
}

export default Catalogue;