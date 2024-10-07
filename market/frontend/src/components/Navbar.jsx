import { useNavigate } from 'react-router-dom';

import '../css/navbar.css'

function Navbar({prevPage}){
    const navigate = useNavigate();
    
    return(
        <nav className='navbar'>
            <button onClick={() => {navigate(prevPage)}}><img src='/img/back.svg' width="100%"></img></button>
            <h1 onClick={() => {navigate("/")}} style={{cursor:"pointer"}}>CryptoCorso</h1>
        </nav>
    )
}

export default Navbar;