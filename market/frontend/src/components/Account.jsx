import { useContext, useEffect, useState } from "react";

import { Link, useParams } from 'react-router-dom';
import { AppContext } from "../AppContext.jsx";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import Modal from "./Modal.jsx";

import "../css/account.css"
import "../css/token.css"

function Account() {
    const { address,marketOwner, market, setError } = useContext(AppContext);
    const { account } = useParams(); // account passato dalla url
    const [show, setShow] = useState(false); // setta se il modal è visibile
    const [minted, setMinted] = useState(undefined); // numero di token creati
    const [owned, setOwned] = useState(undefined); // token posseduti
    const [corsi, setCorsi] = useState(undefined); // tutti i corsi
    const [request, setRequest] = useState(undefined); 
    const [student, setStudent] = useState(""); // indirizzo corrente
    const [matricola, setMatricola] = useState(""); // matricola corrente
    const [corso, setCorso] = useState(""); // corso corrente
    const [op, setOp] = useState(""); // operazione corrente: accetta o rifiuta
    const [cids, setCIDs] = useState(undefined); // cids di quelli posseduti
    const [cfu, setCfu] = useState(0); // cfu totali
    const [loading, setLoading] = useState(true); // se sta caricando

    useEffect(() => {
        getCount(); // recupera tutti i token creati
        getRequest(); // Recupera tutte le richieste fatte dagli studenti
        getOwned();   // Recupera i corsi che lo studente possiede
        if(owned !== undefined)
            getCid();     // Recupera i dettagli per ogni NFT posseduto
        
        if(request !== undefined)
            getCorsi(); // recupera i nomi di tutti i corsi
    }, [address]);
    
    useEffect(() => {
        if(request !== undefined)
            getCorsi();
    }, [request, cids]);

    useEffect(() => {
        if(owned !== undefined)
            getCid();
    }, [owned]);
    
    useEffect(() => {
        getOwned();
    }, [minted]);

    useEffect(() => {
        if (minted && owned && corsi && request && cids) {
          setTimeout(() => {setLoading(false)}, 1000); // Se tutti gli stati sono valorizzati, il caricamento è completato
        }
      }, [minted, owned, corsi, request, cids]);


    const getCount = async () => {
        // ritorna il numero totale
        try{
            const count = await market.totalSupply();
            setMinted(parseInt(count));
        }catch(error){
            setError(error);
            setShow(true);
        }
    }


    const getOwned = async () => {
        try{
            let result = "";
            const ownedTokens = [];

            // cicla tutti gli nft creati e se è l'address il possessore lo salva
            for(let i=1; i<=minted;i++){
                result = await market.ownerOf(i);
                if (result === account)
                    ownedTokens.push(i);
            }
            
            setOwned(ownedTokens);
        }catch(error){
            setError(error);
            setShow(true);
        }
    };

    const getCid = async () => {
        try{
            let result = "";
            let idToken = 0;
            let response = "";
            let json = "";
            let sumCfu = 0;
            const ownedJson = [];
    
            // recupera il cid del json e fa una chiamata http per recuperare le informazioni per ogni nft posseduto
            for(let i=1; i<=owned.length;i++){
                idToken = owned[i-1];
                result = await market.tokenURI(idToken);
                
                response = await fetch(result);
                if(!response.ok)
                    throw new Error('Errore recupero json');
    
                json = await response.json();
                sumCfu += parseInt(json.properties.cfu.description);
                ownedJson.push(json);
            }
    
            setCfu(sumCfu);
            setCIDs(ownedJson);
        }catch(error){
            setError(error);
            setShow(true);
        }
    };

    const getRequest = async () => {
        try{
            // recupera tutte le richieste(il risultato è un array di studenti e un array con le richieste per ogni studente)
            const result = await market.getRequest();
            let matricole = [];

            const students = result[0];
            if (address === marketOwner){
                await Promise.all(students.map(async (e,i) => {
                    const matricola = await market.getMatricola(e);
                    matricole.push(matricola);
                }));
            }

            const nonEmptyCourses = result[1].filter(element => element.length > 0); // rimuove gli array vuoti

            setRequest({
                students: students,
                matricole: matricole,
                courses: nonEmptyCourses
            });
        }catch(error){
            setError(error);
            setShow(true);
        }
    }

    const getCorsi = async () => {
        try{
            let result = await market.getCourses();

            // se è già stato richiesto non lo fa vedere
            const students = request.students;
            for(let i = 0; i < students.length; i++){
                if(students[i] === account){
                    request.courses.map((element, index) => (
                        result = result.filter((course) => !element.includes(course))
                    ));
                }
            }

            // se ce lho già non lo fa vedere
            cids.map((element, index) => (
                result = result.filter((course) => element.properties.corso.description !== course)
            ));


            setCorsi(result);
        }catch(error){
            setError(error);
            setShow(true);
        }
    }

    const handleAggiungiStudente = () => {
        const studentRegex = /^(0x)?[0-9a-fA-F]{40}$/;
        const matricolaRegex = /^(VR)[0-9]{6}$/;

        if(!studentRegex.test(student) && !matricolaRegex.test(matricola)){
            setError("The entered address and student id are incorrect.");
            setStudent("");
            setMatricola("");
        }else if(!studentRegex.test(student)){
            setError("The entered address is incorrect.");
            setStudent("");
        }else if(!matricolaRegex.test(matricola)){
            setError("The entered student id is incorrect.");
            setMatricola("");
        }

        setShow(true);
        setOp("aggiungi");
    }

    // se sta caricando i dati
    if(loading){
        return(<div className="saleContainer" style={{backgroundColor:"#748EA2"}}><div className="loader"></div></div>)
    }

    // se è l'owner
    if(address === marketOwner && address === account){
        return(
            <div>
                <Navbar prevPage="/" account={account}/>
                <div className="profilo" style={{height:window.innerHeight, marginBottom:"20vh"}}>
                    <h1>Dettagli account</h1>
                    <p>{address} - <b>proprietario del market</b></p>

                    <div style={{margin:"50px 0 75px 0"}}>
                        <h2>Aggiungi nuovo studente</h2>
                        <div className="saleRiepilogo">
                        <div className="operazioni">
                            <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
                                <p>Indirizzo: </p> <input style={{margin:"20px 10px 20px 10px", width:"100%"}} type="text" placeholder="Indirizzo dello studente" value={student} onChange={(event) => {setStudent(event.target.value)}} ></input>
                            </div>
                            <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
                                <p>Matricola: </p> <input style={{margin:"20px 10px 20px 10px", width:"100%"}} type="text" placeholder="Matricola dello studente" value={matricola} onChange={(event) => {setMatricola(event.target.value)}} ></input>
                            </div>
                            <div style={{width:"100%", textAlign:"center"}}>
                                {student && matricola !== ""? <button className="button" style={{width:"30%"}} onClick={() => {handleAggiungiStudente()}}><p>Aggiungi</p></button> : <button className="button" style={{width:"30%", pointerEvents:"none", opacity: "0.2"}} disabled><p>Aggiungi</p></button>}
                            </div>
                        </div>
                        </div>
                    </div>
                    

                    <div className="posseduti" style={{margin:"75px 0 75px 0"}}>
                    <h2>Richieste</h2>
                    {request && request.courses.length > 0? (
                        <table style={{overflow: "hidden", wordWrap: "break-word"}}>
                            <thead>
                                <tr>
                                    <th>matricola</th>
                                    <th>indirizzo</th>
                                    <th style={{paddingLeft: "20px"}}>CryptoCorso richiesto</th>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {request.courses.map((element, index) => (
                                    element.map((course, courseIndex) => (
                                        <tr key={courseIndex}>
                                            <td><p>{request.matricole[index]}</p></td>
                                            <td style={{maxWidth: "200px"}}><p>{request.students[index]}</p></td>
                                            <td style={{paddingLeft: "20px"}}><p>{course}</p></td>
                                            <td><button className="button" onClick={() => {
                                                setShow(true);
                                                setStudent(request.students[index]);
                                                setMatricola(request.matricole[index])
                                                setCorso(course);
                                                setOp("accetta");
                                            }}><p style={{margin: 0}}>Accetta richiesta</p></button></td>
                                            <td><button className="button" onClick={() => {
                                                setShow(true);
                                                setStudent(request.students[index]);
                                                setMatricola(request.matricole[index])
                                                setCorso(course);
                                                setOp("rifiuta");
                                            }}><p style={{margin: 0}}>Rifiuta richiesta</p></button></td>
                                        </tr>
                                    ))
                                ))}
                            </tbody>
                        </table>
                        ) : (
                        <div style={{textAlign:'center'}}>
                            <p>non sono presenti richieste al momento</p>
                            <img  className="noSale" src='/img/sad.png' alt='sad' width="35%"></img>
                        </div>
                        )}
                    </div>
                </div>
                <Modal show={show} setShow={setShow}
                 getCount={getCount} minted={minted}
                  getRequest={getRequest} 
                  op={op} setOp={setOp} 
                  student={student} setStudent={setStudent} 
                  matricola={matricola} setMatricola={setMatricola}
                   corso={corso} setCorso={setCorso}
                    address={address} marketOwner={marketOwner}/>

                <Footer />
            </div>
        )
    }

    // altrimenti
    return(
        <div>
            <Navbar prevPage="/" account={account}/>
            <div className="profilo">
                <h1>Dettagli account</h1>
                {address === account? <p>{address} - <b>Questo è il tuo account</b></p> : <p>{account}</p>}

                <div className="posseduti" style={{margin:"50px 0 75px 0"}}>
                    <span style={{display:'flex'}}><h2>CryptoCorso posseduti: {owned.length}</h2> <h2>CFU posseduti: {cfu}/180</h2></span>
                    
                    <div>
                        {owned && cids && cids.length !== 0 ? (
                            <div style={{display:"flex",flexWrap: "wrap", gap: "10px"}}>
                                {cids.map((element, index) => (
                                    <div key={index} className="corsiContainer" style={{ width: "calc(33.33% - 10px)" }}>
                                    <Link to={`/CryptoCorso/${element.properties.corso.description}?prevPage=/Account/${account}&tokenId=${element.properties.id.description}`}>
                                            <img className="corsi" src={element.properties.image.description} width="100%"/>
                                    </Link>
                                    <div style={{height:"100px", padding:"0 20px 0 20px", overflow:"hidden"}}>
                                                <b><p style={{margin:"0", padding:"20px 0 0 0"}}>#{element.properties.id.description}</p></b>
                                                <p style={{fontSize:"15px", margin:"0", padding:"0"}}>{element.properties.corso.description}</p>
                                            </div>
                                        </div>
                                ))}
                            </div>
                        )
                        :
                        (<div style={{textAlign:'center', marginTop:"25px"}}>
                            {address === account? <p>Non possiedi nessun CryptoCorso</p> : <p>Questo account non possiede nessun CryptoCorso</p>}
                            <img  className="noSale" src='/img/sad.png' alt='sad' width="35%"></img>
                        </div>)}
                    </div>
                </div>

                {address === account  && (
                    <div>
                        {request.courses.length > 0 && request.students.includes(address) && <div style={{margin:"75px 0 75px 0"}}>
                            <h2>CryptoCorso richiesti: {request.courses[request.students.findIndex((student => student === address))].length}</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {request.courses[request.students.findIndex((student => student === address))].map((element, index) => (
                                                <tr key={index}>
                                                        <td><Link to={`/CryptoCorso/${element}?prevPage=/Account/${account}`} style={{all:"unset", cursor:"pointer"}}><p>{element}</p></Link></td>
                                                        <td style={{textAlign:"right", width:"100%"}}><Link to={`/CryptoCorso/${element}?prevPage=/Account/${account}`} style={{all:"unset", cursor:"pointer"}}><img src={`/img/corsi/${element}.png`} style={{maxWidth: "250px", width: "30%"}}></img></Link></td>
                                                </tr>
                                            ))
                                    }
                                </tbody>
                            </table>

                        </div>}
                        <div style={{margin:"75px 0 0 0"}}>
                            <h2>CryptoCorso Mancanti: {corsi.length}</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {corsi.map((element, index) => (
                                        <tr key={index}>
                                                <td><Link to={`/CryptoCorso/${element}?prevPage=/Account/${account}`} style={{all:"unset", cursor:"pointer"}}><p>{element}</p></Link></td>
                                                <td style={{textAlign:"right", width:"100%"}}><Link to={`/CryptoCorso/${element}?prevPage=/Account/${account}`} style={{all:"unset", cursor:"pointer"}}><img src={`/img/corsi/${element}.png`} style={{maxWidth: "250px", width: "100%"}}></img></Link></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                    </div>
                </div>
                )}
                
            </div>

            <Modal show={show} setShow={setShow}
                getCount={getCount} minted={minted}
                getRequest={getRequest} 
                op={op} setOp={setOp} 
                student={student} setStudent={setStudent} 
                address={address} marketOwner={marketOwner}/>
            <Footer />
        </div>
    )
    
}

export default Account;
