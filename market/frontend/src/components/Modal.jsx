import { useContext, useEffect, useState } from "react";

import { ethers } from "ethers";
import Market from '../contracts/Market.json'

import { AppContext } from "../AppContext.jsx";


function Modal({show, setShow, getCount, minted, getRequest, op, setOp, student, setStudent, matricola, setMatricola, setCorso, corso, address, marketOwner}) {
    const {market, marketAddress, provider, errore, setError} = useContext(AppContext);
    const [cid, setCid] = useState("");
    const [stato, setStato] = useState("non completato");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(stato === "in corso"){
            setLoading(true);
        }else{
            setLoading(false)
        }
    }, [loading, stato])

    const mint = async () => {
        // crea un nuovo token e lo manda allo studente
        try {
            const result = await market.safeMint(student, cid, corso);
            setStato("in corso")
            await result.wait();

            setCid("");
            getCount();

            setStato("completato");
        } catch (error) {
            setError(error);
        }
    };


    const addRequest = async () => {
        // crea la richiesta di un token
        try {
            const result = await market.addRequest(corso);
            setStato("in corso")
            await result.wait();

            setStato("completato");
        } catch (error) {
            setError(error);
        }
    };

    const removeRequest = async () => {
        // rimuove la richiesta quando viene accettata o rifiutata
        try {
            const result = await market.removeRequest(corso, student);
            setStato("in corso")
            await result.wait();
            
            setStato("completato");
        } catch (error) {
            setError(error);
        }
    };


    const addStudent = async () => {
        // aggiunge lo studente al sistema
        try {
            const result = await market.addStudent(student, matricola);
            setStato("in corso")
            await result.wait();
            
            setStato("completato");
        } catch (error) {
            setError(error);
        }
    }


    if(loading)
        return(<div className="saleContainer">
            <div style={{margin:"12% 0 0 0", textAlign:"center"}}>
                <div className="loader"></div>
                <b><p style={{color:"white"}}>Transazione in corso.</p></b>
                <b><p style={{color:"white"}} className="loading"> Attendere...</p></b>
            </div>
        </div>)

    if(!show)
        return null;

    // se c'è un errore 
    if(errore !== undefined){
        return(
            <div className="saleContainer">
                <div className="sale" style={{maxWidth: '500px', padding: "50px"}}>
                    <div className="saleRiepilogo" style={{textAlign:"center", alignItems:"center"}}>
                        <h2>L'operazione non è andata a buon fine</h2>
                        <img src="/img/errore.png" width="50%"></img>
                        <p><span style={{color:'red'}}>Errore: </span>{errore}</p>
                        <div className="operazioni">
                            <button className="button" onClick={() => {
                                setShow(false);
                                setError(undefined);
                                setStudent && setStudent("");
                                setMatricola && setMatricola("");
                                setCorso && setCorso("");
                                setOp && setOp("");
                                {getRequest && getRequest()}
                            }}><p style={{margin: 0}}>ok</p></button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // se va a buon fine 
    if(stato == "completato"){
        return(
            <div className="saleContainer">
                <div className="sale">
                    <div className="saleRiepilogo" style={{textAlign:"center", alignItems:"center", padding:" 0 50px 0 50px"}}>
                        <h2>L'operazione è andata a buon fine</h2>
                        <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", height:"100%"}}>
                            <div className="operazioni" style={{margin:"auto 0 20px 0"}}>
                                <button className="button" onClick={() => {
                                    setShow(false);
                                    setStato("non completato");
                                    getRequest();
                                    setStudent && setStudent("");
                                    setMatricola && setMatricola("");
                                    setCorso && setCorso("");
                                    setOp && setOp("");
                                }}><p style={{margin: 0}}>ok</p></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // se è l'owner e aggiunge uno studente
    if(address === marketOwner && op === "aggiungi"){
        return(
            <div className="saleContainer">
                    <div className="sale" style={{width:"70%" ,margin:"auto"}}>
                        <button className="close" onClick={() => {setShow(false);}}>x</button>
                        <div className="saleRiepilogo" style={{padding:" 0 50px 0 50px"}}>
                            <h2 style={{paddingBottom: "0", marginBottom: "0"}}>Riepilogo</h2>
                            <p>Vuoi confermare l'aggiunta dello studente al sistema?</p>
                            <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", height:"100%"}}>
                                <div className="operazioni" style={{margin:"auto 0 20px 0"}}>
                                    <div style={{textAlign: "left"}}>
                                        <p><b>address</b>: {student}</p>
                                        <p><b>matricola</b>: {matricola}</p>
                                    </div>
                                    <div style={{textAlign:"center", margin:"auto 0 20px 0"}}>
                                        <button className="button" style={{width:"50%"}} onClick={() => {addStudent();}}><p style={{margin: 0}}>Aggiungi lo studente</p></button>
                                    </div>
                                    </div>
                                    </div>
                        </div>
                    </div>
            </div>
        )
    }

    // se è l'owner e la richiesta viene accettata
    if(address === marketOwner && op === "accetta"){
        return(
            <div className="saleContainer">
                    <div className="sale" style={{width:"90%" ,margin:"auto"}}>
                        <button className="close" onClick={() => {setShow(false);}}>x</button>
                        <div className="saleImage" >
                            <img src={`/img/corsi/${corso}.png`} ></img>
                        </div>
                        <div className="saleRiepilogo" style={{padding:" 0 50px 0 50px"}}>
                            <h2 style={{paddingBottom: "0", marginBottom: "0"}}>Riepilogo</h2>
                            <p>CryptoCorso #{minted + 1}</p>
                            <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", height:"100%"}}>
                                <div className="operazioni" style={{margin:"auto 0 20px 0"}}>
                                    <div style={{textAlign: "left"}}>
                                        <input style={{margin:"20px 0 20px 0", width:"100%"}} type="text" placeholder="CID file Json" value={cid} onChange={(event) => {setCid(event.target.value)}}/>
                                        <p><b>address</b>: {student}</p>
                                        <p><b>matricola</b>: {matricola}</p>
                                        <p style={{margin:"25px 0 50px 0"}}><b>corso</b>: {corso}</p>
                                    </div>
                                    <div style={{textAlign:"center", margin:"auto 0 20px 0"}}>
                                        {cid !== ""?<button className="button" style={{width:"50%"}} onClick={() => {mint();}}><p style={{margin: 0}}>Invia CryptoCorso</p></button> : <button className="button" style={{width:"50%", pointerEvents:"none", opacity: "0.2"}} disabled><p style={{margin: 0}}>Invia CryptoCorso</p></button>}
                                    </div>
                                    </div>
                                    </div>
                        </div>
                    </div>
            </div>
        )
    }

    // se è l'owner e la richiesta viene rifiutata
    if(address === marketOwner && op === "rifiuta"){
        return(
            <div className="saleContainer">
                    <div className="sale">
                        <button className="close" onClick={() => {setShow(false);}}>x</button>
                        <div className="saleRiepilogo" style={{padding:" 0 50px 0 50px"}}>
                            <h2 style={{paddingBottom:"0", marginBottom:"0"}}>Rifiuta questa richiesta</h2>
                            <div style={{display:"flex", flexDirection:"column", justifyContent:"space-between"}}>
                                <div style={{textAlign: "left"}}>
                                    <p style={{margin:"50px 0 0 0"}}><b>address</b>: {student}</p>
                                    <p><b>matricola</b>: {matricola}</p>
                                    <p style={{margin:"25px 0 50px 0"}}><b>corso</b>: {corso}</p> 
                                </div>
                                <div style={{margin:"auto 0 20px 0"}}>
                                    <div className="operazioni" style={{textAlign:"center"}}>
                                        <button className="button" style={{width:"50%"}} onClick={removeRequest}><p style={{margin: 0}}>Rifiuta</p></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
        )
    }
    

    // altrimenti
    return(
        <div className="saleContainer">
            <div className="sale" style={{width:"50%", margin:"auto"}}>
                    <button className="close" onClick={() => {setShow(false);}}>x</button>
                    <div className="saleImage">
                        <img src={`/img/corsi/${corso}.png`}></img>
                    </div>
                    <div className="saleRiepilogo">
                        <h2 style={{paddingBottom:"0", marginBottom:"0"}}>Riepilogo</h2>
                        <p style={{margin:"25px 0 50px 0"}}><b>CryptoCorso</b>: {corso}</p>
                        <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", height:"100%"}}>
                            <div className="operazioni" style={{margin:"auto 0 20px 0"}}>
                                <button className="button" style={{width: "100%"}} onClick={addRequest}><p style={{margin: 0}}>Richiedi CryptoCorso</p></button>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default Modal;