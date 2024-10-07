import "../css/footer.css"

function Footer(){
    return(
        <div className="footerContainer">
        <div style={{width: "70%", margin:"auto", display: "flex"}}>
        <div className="left">
                <p>Progetto tesi di laurea di Riccardo Corsini</p>
                <p>2023/2024</p>
            </div>
            <div className="right">
                <p><a href="https://github.com/corsone" target="_blank" style={{color: 'inherit', textDecoration: 'inherit'}}>Github</a></p>
            </div>
        </div>
        </div>
    )
}

export default Footer;