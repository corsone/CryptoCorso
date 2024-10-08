import { useContext, useEffect, useState } from "react";

import { useLocation, useParams } from 'react-router-dom';

import { Canvas } from '@react-three/fiber';
import { useGLTF, Stage, PresentationControls } from '@react-three/drei'; 

import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import { AppContext } from "../AppContext.jsx";
import Modal from "./Modal.jsx";

import "../css/token.css"


function Model(props){
    const {scene} = useGLTF(props.corso);
    
    return(<primitive object={scene} {...props} />)
}


function Token({}){
    const {address, marketOwner, market, setError } = useContext(AppContext);
    
    const { corso } = useParams();
    const query = new URLSearchParams(useLocation().search);
    const prevPage = query.get('prevPage');
    const tokenId = query.get('tokenId');
    const account = prevPage.split('/Account/')[1];

    const [minted, setMinted] = useState(undefined);  // numero nft creati
    const [owned, setOwned] = useState(undefined); // nft posseduti
    const [cids, setCIDs] = useState(undefined); // cids di tutti gli nft
    const [cid, setCid] = useState(""); // cid nft corrente
    const [corsi, setCorsi] = useState(undefined); // tutti i corsi
    const [request, setRequest] = useState(undefined); // richiesta studente i-esimo
    const [requests, setRequests] = useState(undefined); // tutte le richieste
    const [student, setStudent] = useState(""); // indirizzo studente corrente
    const [matricola, setMatricola] = useState(""); // matricola corrente
    const [op, setOp] = useState(""); // operazione corrente
    const [cfu, setCfu] = useState(""); // cfu corso
    const [rarita, setRarita] = useState(""); // rarità corso
    const [loading, setLoading] = useState(true); // se sta caricando i dati
    const [show, setShow] = useState(false); // se il modal si vede

    useEffect(() => {
        getCount(); // recupera tutti i token creati
        getRequest(); // Recupera tutte le richieste fatte dagli studenti
        getOwned();   // Recupera i corsi che lo studente possiede
        if(owned !== undefined)
            getCid();     // Recupera i dettagli per ogni NFT posseduto
        
        if(request !== undefined)
            getCorsi();  // recupera tutti i corsi
        getCfu(); // recupera i cfu e setta la rarità
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
        if (minted !== undefined && owned !== undefined && cids !== undefined && corsi !== undefined && request !== undefined && requests !== undefined) {
            setTimeout(() => {setLoading(false)}, 1000); // Se tutti gli stati sono valorizzati, il caricamento è completato
        }

      }, [minted, owned, corsi, request, requests, cids]);


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
            let ownedTokens = [];

            // cicla tutti gli nft creati e se è l'address il possessore lo salva
            for(let i=1; i<=minted;i++){
                result = await market.ownerOf(i);
                if(result === account && address !== account)
                    ownedTokens.push(i);
                else if (result === address)
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
            const ownedJson = [];

            // recupera il cid del json e fa una chiamata http per recuperare le informazioni per ogni nft posseduto
            for(let i=1; i<=owned.length;i++){
                idToken = owned[i-1];
                result = await market.tokenURI(idToken);
                
                response = await fetch(result);
                if(!response.ok)
                    throw new Error('Errore recupero json');

                json = await response.json();
                if(json.properties.corso.description === corso)
                    setCid(json);


                ownedJson.push(json);
            }

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
            if(address === marketOwner){
                await Promise.all(students.map(async (e,i) => {
                    const matricola = await market.getMatricola(e);
                    matricole.push(matricola);
                }));
            }
            const student = result[0].indexOf(address);
            const nonEmptyCourses = result[1].filter(element => element.length > 0); // rimuove gli array vuoti

            // salva tutte le richieste per tutti gli studenti
            setRequests({
                students: result[0],
                matricole: matricole,
                courses: nonEmptyCourses
            })

            // salva l'indice dello studente corrente
            setRequest({
                indexStudent: student,
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

            // se è già stato richiesto non lo salva
            if(request.courses[request.indexStudent])
                request.courses[request.indexStudent].map((element, index) => (
                    result = result.filter((course) => !element.includes(course))
                ));
            
            // result = nomi dei corsi il cui proprietario è l'address
            if(account === undefined){
                await Promise.all(cids.map(async (element, i) => {
                    const owner = await market.ownerOf(element.properties.id.description);
                    if(owner === address){
                        result = result.filter(course => element.properties.corso.description !== course);
                    }
                }));
            }else{
                cids.map((e, i) => (result = result.filter((course) => e.properties.corso.description !== course)));
            }


            setCorsi(result);
        }catch(error){
            setError(error);
            setShow(true);
        }
    }

    const getCfu = async () => {
        try{
            let result = await market.getCFU(corso);
            result = parseInt(result);

            if(result === 3){
                setRarita("Comune")
            }else if(result === 6 && corso !== "tesi"){
                setRarita("Raro")
            }else if(result === 12){
                setRarita("Epico")
            }else{
                setRarita("Unico")
            }

            setCfu(result);
        }catch(error){
            setError(error);
            setShow(true);
        }
    }


    if(loading){
        return(<div className="saleContainer" style={{backgroundColor:"#748EA2"}}><div className="loader"></div></div>)
    }

    // se è l'owner e arriva al token dal catalogo
    if(address === marketOwner && (account === undefined || !tokenId)){
        return(
            <div>
                <Navbar prevPage={prevPage}/>
                <Canvas camera={{fov: 45}} style={{width: "100vw", height:"50vh"}} > 
                        <color attach="background" args={["#748EA2"]} ></color>
                        <ambientLight intensity={0.5} /> 
                        <directionalLight intensity={0.7} position={[0, 20, 0]} />
                        <PresentationControls speed={5} polar={[-0.9, Math.PI / 4]} >
                            <Stage environment={null} shadows={false} >
                                <directionalLight intensity={2} position={[0, 10, 10]} />
                                <Model corso={`/corsi3D/${corso}.glb`} scale={0.7} rotation={[0.2, Math.PI / 8, 0]} />
                            </Stage>
                        </PresentationControls>
                    </Canvas>
                <div className="token">
                    <h1>CryptoCorso: {corso}</h1>
                    <div style={{display:"flex"}}>
                        <h3 style={{flex: "1"}}>CFU: {cfu}</h3>
                        <h3 style={{flex: "8"}}>Rarità: {rarita}</h3>
                    </div>

                    <div className="posseduti">
                    <h2>Richieste</h2>
                    {request && request.courses.length > 0  && requests.courses.some((element) => (element.includes(corso)))? (
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
                                {requests.courses.map((element, index) => (
                                    element
                                    .filter((c) => c.includes(corso))
                                    .map((course, courseIndex) => (
                                        <tr key={index}>
                                            <td><p>{requests.matricole[index]}</p></td>
                                            <td style={{maxWidth:"200px"}}><p>{requests.students[index]}</p></td>
                                            <td style={{paddingLeft: "20px"}}>{course}</td>
                                            <td><button className="button" onClick={() => {
                                                setShow(true);
                                                setStudent(requests.students[index]);
                                                setMatricola(requests.matricole[index]);
                                                setOp("accetta");
                                            }}><p style={{margin: 0}}>Accetta richiesta</p></button></td>
                                            <td><button className="button" onClick={() => {
                                                setShow(true);
                                                setStudent(requests.students[index]);
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
                            <img  className="noSale" src='/img/sad.png' alt='sad' width="45%"></img>
                        </div>
                    )}
                    </div>
                </div>

                <Modal show={show} setShow={setShow} getCount={getCount} minted={minted} getRequest={getRequest} op={op} student={student} matricola={matricola} corso={corso} address={address} marketOwner={marketOwner}/>
                <Footer />
            </div>
        )
    }


    // se non ho fatto richiesta e non ce l'ho
    if(corsi && corsi.includes(corso) && (account === undefined || account === address || !tokenId)){
        return(
            <div>
                <Navbar prevPage={prevPage}/>
                <Canvas camera={{fov: 45}} style={{width: "100vw", height:"50vh"}} > 
                        <color attach="background" args={["#748EA2"]} ></color>
                        <ambientLight intensity={0.5} /> 
                        <directionalLight intensity={0.7} position={[0, 20, 0]} />
                        <PresentationControls speed={5} polar={[-0.9, Math.PI / 4]} >
                            <Stage environment={null} shadows={false} >
                                <directionalLight intensity={2} position={[0, 10, 10]} />
                                <Model corso={`/corsi3D/${corso}.glb`} scale={0.7} rotation={[0.2, Math.PI / 8, 0]} />
                            </Stage>
                        </PresentationControls>
                    </Canvas>
                <div className="token">
                    <h1>CryptoCorso: {corso}</h1>
                    <div style={{display:"flex", width:"50%"}}>
                        <h3 style={{flex: "1", marginRight: "50px"}}>CFU: {cfu}</h3>
                        <h3 style={{flex: "1"}}>Rarità: {rarita}</h3>
                    </div>

                    {address && <div>
                        <p>Non possiedi ancora questo token.</p>
                        {request.courses[request.indexStudent] === undefined || request.courses[request.indexStudent].length < 5 ? <button className="button" onClick={() => setShow(true)}><p style={{margin: 0}}>Richiedi il CryptoCorso</p></button> : <p>Al momento non puoi richiederlo perché hai superato il numero di richieste per volta. Attendi che vengano processate.</p>}
                    </div>}
                </div>


                <Modal show={show} setShow={setShow} getCount={getCount} minted={minted} getRequest={getRequest} corso={corso} address={address} marketOwner={marketOwner}/>
                <Footer />
            </div>
        )
    }else if(corsi && !corsi.includes(corso) && request.courses[request.indexStudent] && request.courses[request.indexStudent].includes(corso) && (account === undefined || account === address  || !tokenId)){
        // se è stato richiesto
        return(
            <div>
                <Navbar prevPage={prevPage}/>
                <Canvas camera={{fov: 45}} style={{width: "100vw", height:"50vh"}} > 
                        <color attach="background" args={["#748EA2"]} ></color>
                        <ambientLight intensity={0.5} /> 
                        <directionalLight intensity={0.7} position={[0, 20, 0]} />
                        <PresentationControls speed={5} polar={[-0.9, Math.PI / 4]} >
                            <Stage environment={null} shadows={false} >
                                <directionalLight intensity={2} position={[0, 10, 10]} />
                                <Model corso={`/corsi3D/${corso}.glb`} scale={0.7} rotation={[0.2, Math.PI / 8, 0]} />
                            </Stage>
                        </PresentationControls>
                    </Canvas>
                <div className="token">
                    <h1>CryptoCorso: {corso}</h1>
                    <div style={{display:"flex", width:"50%"}}>
                        <h3 style={{flex: "1", marginRight: "50px"}}>CFU: {cfu}</h3>
                        <h3 style={{flex: "1"}}>Rarità: {rarita}</h3>
                    </div>

                    <p>Hai già richiesto questo token. Attendi la conferma.</p>

                </div>

                <Modal show={show} setShow={setShow}/>
                <Footer />
            </div>
        )
    }else{ // se ce l'ho oppure è di un'altro account
        return(
            <div>  
                <Navbar prevPage={prevPage}/>
                {cid && <div>
                    <Canvas camera={{fov: 45}} style={{width: "100vw", height:"50vh"}} > 
                            <color attach="background" args={["#748EA2"]} ></color>
                            <ambientLight intensity={0.5} /> 
                            <directionalLight intensity={0.7} position={[0, 20, 0]} />
                            <PresentationControls speed={5} polar={[-0.9, Math.PI / 4]} >
                                <Stage environment={null} shadows={false} >
                                    <directionalLight intensity={2} position={[0, 10, 10]} />
                                    <Model corso={`${cid.properties.object.description}`} scale={0.7} rotation={[0.2, Math.PI / 8, 0]} />
                                </Stage>
                            </PresentationControls>
                    </Canvas>
                    <div className="token">
                        <h1 style={{margin:"0"}}>CryptoCorso #{cid.properties.id.description}</h1>
                        <h2 style={{margin:"0"}}>Corso: {cid.properties.corso.description}</h2>
                        <div style={{display:"flex", width:"50%"}}>
                        <h3 style={{flex: "1", marginTop:"0", marginRight: "50px"}}>CFU: {cid.properties.cfu.description}</h3>
                            <h3 style={{flex: "1", margin:"0"}}>Rarità: {cid.properties.rarity.description}</h3>
                        </div>
                        {account === undefined || account === address ? <p>Questo token è di tua proprietà</p> : <p>Questo token è di proprietà di: {account}</p>}
                    </div>
                </div>}


                <Modal show={show} setShow={setShow}/>
                <Footer />
            </div>
        )
    }
}

export default Token;