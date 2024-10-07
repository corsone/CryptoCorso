/// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./ERC721.sol";
import "./SafeMath.sol";
import "./String.sol";


contract Market2 is ERC721{
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
    address[] private _studentsRequest; // salva gli indirizzi che hanno fatto una richiesta
    mapping(address => uint) private _studentIndex; // mapping per tenere traccia dell'indice di ogni studente nelle richieste


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

    function getCourses() view external returns(string[] memory){
        return CORSI;
    }

    function getCFU(string memory corso) view external returns(uint){
        require(_isCorrectCourse[corso], 'Course does not exist');

        return CFU[corso];
    }

    function getMatricola(address student) view external onlyOwner returns(string memory){
        require(student != address(0), 'input zero address');
        require(String.isEmpty(_students[student]) , 'Student does not exist'); 
        
        return _students[student];
    }

    function addStudent(address student, string memory matricola) external onlyOwner{
        require(!String.isEmpty(_students[student]) , 'Student dalready exist'); 

        _students[student] = matricola;
    }


    function getRequest() view external returns(address[] memory, string[][] memory){
        string[][] memory allRequests = new string[][](_studentsRequest.length);

         for(uint i = 0; i < _studentsRequest.length; i++){
            allRequests[i] = _requestPerStudent[_studentsRequest[i]];
         }

         return (_studentsRequest, allRequests);
    }


    function addRequest(string memory corso) external{
        require(String.isEmpty(_students[msg.sender]) , 'Student does not exist'); 
        require(_isCorrectCourse[corso], 'Course does not exist');
        require(_requestPerStudent[msg.sender].length < 5, "Request limit reached");

        string[] storage corsi = _requestPerStudent[msg.sender];
        uint length = corsi.length;
        for(uint i = 0; i < length; i++){
            if(String.isEqual(corsi[i], corso)){
                revert("Request already made for this token");
            }
        }
        
        _requestPerStudent[msg.sender].push(corso);
        if(_requestPerStudent[msg.sender].length == 1){
            _studentsRequest.push(msg.sender);
            _studentIndex[msg.sender] = _studentsRequest.length - 1;
        }
    }

    function removeRequest(string memory corso, address student) external onlyOwner{
        require(String.isEmpty(_students[student]), 'Student does not exist');
        require(_isCorrectCourse[corso], 'Course does not exist');
        
        string[] storage corsi = _requestPerStudent[student];
        uint length = corsi.length;


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
        

        for(uint i = 0; i < length; i++){
            if(String.isEqual(_requestPerStudent[student][i], corso)){
                _requestPerStudent[student][i] = _requestPerStudent[student][length - 1];
                _requestPerStudent[student].pop();
                break;
            }
        }
    }


    function safeMint(address to, string memory cid) external onlyOwner{
        require(to != address(0), 'ERC721: mint to the zero address');

        _tokenId = _tokenId.add(1);

        _balanceOf[to] = _balanceOf[to].add(1);
        _ownedTokens[to].push(_tokenId);
        _tokenOwners[_tokenId] = to;

        _setTokenURI(_tokenId, cid);

        emit Transfer(address(0), to, _tokenId);

        _checkOnERC721Received(address(0), to, _tokenId, "");
    }
 

    function _setTokenURI(uint256 tokenId, string memory cid) internal{
        require(tokenId <= _tokenId &&  tokenId != 0, 'There is no token with this id');
        
        _tokenURIs[tokenId] =  string.concat(_baseURI, cid);
    }
}
