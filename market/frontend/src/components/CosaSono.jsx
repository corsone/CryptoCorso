import { useInView } from 'react-intersection-observer';

import "../css/cosaSono.css";

function CosaSono(){
  const { ref: img1Ref, inView: img1Visible } = useInView({ triggerOnce: true });
  const { ref: img2Ref, inView: img2Visible } = useInView({ triggerOnce: true });
  const { ref: img3Ref, inView: img3Visible } = useInView({ triggerOnce: true });
  const { ref: img4Ref, inView: img4Visible } = useInView({ triggerOnce: true });
  const { ref: img5Ref, inView: img5Visible } = useInView({ triggerOnce: true });


    return(
      <div>
        <div className="cosaSonoContainer" style={{padding:"50px 0 25px 0"}}>
            <div className="cosaSono">
              <div className="spiegazione">
              <h2>Cosa sono i CryptoCorso?</h2>
                <ul>
                  <li>I <b>CryptoCorso</b> sono una collezione di 24 NFT unici, ciascuno dei quali rappresenta un corso diverso del programma di laurea in informatica.</li>
                  <li>Gli NFT vengono salvati su <a href="https://pinata.cloud/" target="_blank">IPFS</a>.</li>
                  <li>La raccolta si basa sullo <a href="https://eips.ethereum.org/EIPS/eip-721" target="_blank">standard ERC-721</a>.</li>
                </ul>
              </div>

            </div>
        </div>


          <div style={{width: "70%" ,margin: "auto", padding:"25px 0 0px 0"}}>
            <h2 style={{margin:"0", padding:"0"}}>Come diventare proprietario di un CryptoCorso</h2>
            <p>Per diventare proprietario di un CryptoCorso, è necessario superare l'esame corrispondente e successivamente presentare una richiesta alla segreteria. Una volta approvata la richiesta, la segreteria emette un NFT che contiene tutte le informazioni relative all'esame, come la matricola dello studente e il voto ottenuto.</p>
           
           <div style={{display: "flex", alignItems: "center", justifyContent:"space-between", textAlign: "center", width:"100%"}}>
                <img ref={img1Ref} className={`fade-in ${img1Visible ? 'visible' : ''}`}  src='/img/tutorial1.png' width="20%"></img>
                <img ref={img2Ref} className={`fade-in ${img2Visible ? 'visible' : ''}`} style={{transitionDelay: "0.2s", rotate:"180deg", width:"5%"}} src='/img/back.svg'></img>
                <img ref={img3Ref} className={`fade-in ${img3Visible ? 'visible' : ''}`} style={{transitionDelay: "0.4s"}}  src='/img/tutorial2.png' width="20%"></img>
                <img ref={img4Ref} className={`fade-in ${img4Visible ? 'visible' : ''}`} style={{transitionDelay: "0.6s", rotate:"180deg", width:"5%"}} src='/img/back.svg' ></img>
                <img ref={img5Ref} className={`fade-in ${img5Visible ? 'visible' : ''}`} style={{transitionDelay: "0.8s"}} src='/img/tutorial3.png' width="20%"></img>
            </div>
           </div>
      </div>

    )
}

export default CosaSono;