/// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./ERC721.sol";
import "./SafeMath.sol";
import "./String.sol";


contract Market is ERC721{
    using SafeMath for uint;
    using String for string;
    
    string[] private CORSI = ["analisi matematica I", "logica", "lingua inglese", "algebra lineare", "fisica I", unicode"probabilità", "architettura degli elaboratori", "programmazione I",
                    "programmazione Python", "analisi matematica II", "reti di calcolatori", "sistemi e segnali", "fisica II", "programmazione II e ingegneria del software",
                    "sistemi operativi", "algoritmi","latex", "programmazione di smart contract per Ethereum", "elaborazione segnali e immagini", "fondamenti dell'informatica", "linguaggi", 
                    "programmazione e sicurezza delle reti", "basi di dati", "tesi"]; // tutti i possibili corsi
    mapping(string => uint) private CFU; // per ogni corso salva i CFU       
    mapping(string => bool) private _isCorrectCourse; // salva se un corso è valido
    mapping(address => string) private _students; // salva le matricole
    mapping(address => string[]) private _requestPerStudent; // salva per ogni studente le richieste fatte
    mapping(address => mapping(string => uint)) private _courseIndex; // tiene traccia dell'indice di ogni corso nell'array delle richieste(per evitare cicli for)
    address[] private _studentsRequest; // salva gli indirizzi che hanno fatto una richiesta
    mapping(address => uint) private _studentIndex; // tiene traccia dell'indice di ogni studente nelle richieste(per evitare cicli for)


    /// @notice per ogni corso salva che è valido e salva il numero di CFU
     constructor(string memory name, string memory symbol) ERC721(name, symbol){        
        for(uint i = 0; i < CORSI.length; i++){
            _isCorrectCourse[CORSI[i]] = true;
            if (i == 8 || i == 16 || i == 17) {
                CFU[CORSI[i]] = 3;
            } else if (i == 6 || i == 7 || i == 13 || i == 14 || i == 15 || i == 22) {
                CFU[CORSI[i]] = 12;
            } else {
                CFU[CORSI[i]] = 6;
            }
        }
    }

    /// @notice ritorna tutti i corsi disponibili
    function getCourses() view external returns(string[] memory){
        return CORSI;
    }

    /// @notice ritorna il numero di CFU del corso richiesto
    /// @param corso è il nome del corso
    function getCFU(string memory corso) view external returns(uint){
        require(_isCorrectCourse[corso], 'Course does not exist');

        return CFU[corso];
    }

    /// @notice ritorna la matricola dell'indirizzo dello studente
    /// @param student è l'indirizzo dello studente
    function getMatricola(address student) view external onlyOwner returns(string memory){
        require(student != address(0), 'input zero address');
        require(String.isEmpty(_students[student]) , 'Student does not exist'); 
        
        return _students[student];
    }


    /// @notice aggiunge uno studente al sistema
    /// @param student è l'indirizzo dello studente
    /// @param matricola è la matricola che identifica lo studente
    function addStudent(address student, string memory matricola) external onlyOwner{
        require(!String.isEmpty(_students[student]) , 'Student dalready exist'); 

        _students[student] = matricola;
    }


    /// @notice ritorna tutte le richieste fatte
    /// @return un array contenente tutti gli indirizzi e un array multidimensionale che contiene tutti i corsi richiesti per ogni studente
    function getRequest() view external returns(address[] memory, string[][] memory){
        string[][] memory allRequests = new string[][](_studentsRequest.length);

         for(uint i = 0; i < _studentsRequest.length; i++){
            allRequests[i] = _requestPerStudent[_studentsRequest[i]];
         }

         return (_studentsRequest, allRequests);
    }


    /// @notice aggiunge una nuova richiesta
    /// @param corso è il nome del corso richiesto
    function addRequest(string memory corso) external{
        require(String.isEmpty(_students[msg.sender]) , 'Student does not exist'); 
        require(_isCorrectCourse[corso], 'Course does not exist');
        require(_requestPerStudent[msg.sender].length < 5, "Request limit reached");

        uint length = _requestPerStudent[msg.sender].length;
        require(_courseIndex[msg.sender][corso] == 0 && (length == 0 || !String.isEqual(_requestPerStudent[msg.sender][_courseIndex[msg.sender][corso]], corso)), "Request already made for this token");
        
        _requestPerStudent[msg.sender].push(corso); // aggiunge la richiesta(studente->[corsi])
        _courseIndex[msg.sender][corso] = length; // salva l'indice del corso dell'array corsi

        // se è la prima richiesta deve aggiungere lo studente all'array e salvare la posizione dello studente nell'array
        if(length == 0){
            _studentsRequest.push(msg.sender);
            _studentIndex[msg.sender] = _studentsRequest.length - 1;
        }
    }

    /// @notice rimuove una richiesta già fatta. Viene chiamata dalla segreteria quando una richiesta viene rifiutata o accettata
    /// @param corso è il nome del corso da rimuovere
    /// @param student è lo studente che ha fatto la richiesta
    function removeRequest(string memory corso, address student) external onlyOwner{
        _deleteRequest(corso, student);
    }


    /// @notice crea un nuovo NFT e assegna la proprietà allo studente
    /// @param to è l'indirizzo dello studente a cui assegnare l'NFT
    /// @param cid è il content id del file json contenete i metadati dell'NFT
    function safeMint(address to, string memory cid, string memory corso) external onlyOwner{
        _mint(to, cid);
        _deleteRequest(corso, to);
    }


    function _deleteRequest(string memory corso, address student) internal{
        require(String.isEmpty(_students[student]), 'Student does not exist');
        require(_isCorrectCourse[corso], 'Course does not exist');
        
        uint length =  _requestPerStudent[student].length;

        // se è l'ultima richiesta dello studente, devo toglierlo dall'array
        if(length == 1){
            uint index = _studentIndex[student]; // trovo l'indice dello studente
            uint lastIndex = _studentsRequest.length - 1; // trovo l'ultimo indice

            if(index != lastIndex){
                _studentsRequest[index] = _studentsRequest[lastIndex]; // copio l'ultimo elemento nella posizione dell'indice
                _studentIndex[_studentsRequest[lastIndex]] = index; // cambio l'indice dell'ultimo elemento 
            }

            _studentsRequest.pop(); // elimino l'ultimo elemento
        }
        

        uint indiceCorso = _courseIndex[student][corso];

        _requestPerStudent[student][indiceCorso] = _requestPerStudent[student][length - 1]; // copio l'ultimo elemento nella posizione da eliminare
        _courseIndex[student][_requestPerStudent[student][length - 1]] = indiceCorso; // aggiorno l'indice 
        _requestPerStudent[student].pop(); // rimuovo l'ultimo elemento
        delete _courseIndex[student][corso]; // rimuovo dalla mappa l'indice del corso rimosso
    }

    
    function _mint(address to, string memory cid) internal{
        require(to != address(0), 'ERC721: mint to the zero address');

        _tokenId = _tokenId.add(1);

        _balanceOf[to] = _balanceOf[to].add(1);
        _ownedTokens[to].push(_tokenId);
        _tokenOwners[_tokenId] = to;

        _setTokenURI(_tokenId, cid);

        emit Transfer(address(0), to, _tokenId);

        _checkOnERC721Received(address(0), to, _tokenId, "");
    }
 

    /// @notice crea la URI: concatena la uri con il CID
    /// @param tokenId è l'id del token per cui deve creare la URI
    /// @param cid è il content id del file json contenete i metadati dell'NFT
    function _setTokenURI(uint256 tokenId, string memory cid) internal{
        require(tokenId <= _tokenId &&  tokenId != 0, 'There is no token with this id');
        
        _tokenURIs[tokenId] =  string.concat(_baseURI, cid);
    }
}
