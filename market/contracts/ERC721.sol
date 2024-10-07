/// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./IERC721.sol";
import "./SafeMath.sol";

contract ERC721 is IERC721, IERC721Enumerable, IERC721Metadata{
    using SafeMath for uint;

    address internal _owner; // proprietario del contratto
    string  internal _name; // nome raccolta
    string  internal _symbol; // simbolo raccolta
    
    string internal _baseURI; 
    mapping (uint => string) internal _tokenURIs;

    uint internal _tokenId; // contatore id
    mapping(address => uint[]) internal _ownedTokens; // per ogni indirizzo salva tutti i token posseduti
    mapping(uint => address) internal _tokenOwners; // per ogni token salva l'owner

    mapping (uint => address) internal _tokenApprovals; // associa il token all'indirizzo approvato
    mapping (address => mapping (address => bool)) internal _operatorApprovals; // associa l'owner alla possibilita dell'indirizzo approvato di poter gestire tutti i suoi assets

    mapping(address => uint) internal _balanceOf; // salvo numero token per address


    modifier onlyOwner(){
        require(msg.sender == _owner, 'Caller is not the owner');
        _;
    }

    constructor(string memory name_, string memory symbol_){
        _owner = msg.sender;
        _name = name_;
        _symbol = symbol_;
        _tokenId = 0;
        _baseURI = "https://brown-eldest-tarsier-911.mypinata.cloud/ipfs/";
    }

    function supportsInterface(bytes4 interfaceID) public pure returns (bool){
        if(interfaceID != 0xffffffff){
            return  interfaceID == type(IERC721).interfaceId ||
                    interfaceID == type(IERC721Metadata).interfaceId ||
                    interfaceID == type(IERC721Enumerable).interfaceId;
        }

        return false;
    }


    /// ERC721Enumerable
    function totalSupply() external view returns (uint){
        return _tokenId;
    }

    function tokenByIndex(uint index) external view returns (uint){
        require(index < this.totalSupply(), 'ERC721: index >= totalSupply');

        return index + 1;
    }

    function tokenOfOwnerByIndex(address owner, uint index) external view returns (uint){
        require(index < _balanceOf[owner], 'ERC721: index >= balance');
        require(owner != address(0), 'ERC721: owner must be different from zero address');

        return _ownedTokens[owner][index];
    }


    /// ERC721Metadata
    function name() external view returns (string memory){
        return _name;
    }

    function symbol() external view returns (string memory){
        return _symbol;
    }

    function tokenURI(uint tokenId) external view returns (string memory){
        require(tokenId <= _tokenId &&  tokenId != 0, 'ERC721: There is no token with this id');

        return  _tokenURIs[tokenId];
    }


    /// ERC721
    function balanceOf(address owner) external view returns (uint){
        require(owner != address(0), "ERC721: balance query for the zero address");

        return _balanceOf[owner];
    }

    function ownerOf(uint tokenId) external view returns (address){
        require(tokenId <= _tokenId &&  tokenId != 0, 'ERC721: There is no token with this id');

        return _tokenOwners[tokenId];
    }

    function approve(address approved, uint tokenId) external{
        address owner = _tokenOwners[tokenId];
        require(msg.sender == owner || this.isApprovedForAll(owner, msg.sender), 'ERC721: you are not the owner or an approved');
        require(approved != owner, 'ERC721: approved == owner');

        _tokenApprovals[tokenId] = approved;
        emit Approval(owner, approved, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) external{
        require(operator != address(0), 'ERC721: operator == address(0)');
        require(operator != msg.sender, 'ERC721: operator == msg.sender');

        _operatorApprovals[msg.sender][operator] = approved;

        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function getApproved(uint tokenId) external view returns (address){
        require(tokenId <= _tokenId &&  tokenId != 0, 'ERC721: There is no token with this id');

        return _tokenApprovals[tokenId];
    }

    function isApprovedForAll(address owner, address operator) external view returns (bool){
        return _operatorApprovals[owner][operator];
    }

    function safeTransferFrom(address from, address to, uint tokenId) external{
        this.safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(address from, address to, uint tokenId, bytes memory data) external{
        require(_isApprovedOrOwner(msg.sender, tokenId));

        _transfer(from, to, tokenId);
        _checkOnERC721Received(from, to, tokenId, data);
    }

    function transferFrom(address from, address to, uint tokenId) external{
        _transfer(from, to, tokenId);
    }

    function _transfer(address from, address to, uint256 tokenId) internal {
        require(tokenId <= _tokenId &&  tokenId != 0, 'ERC721: There is no token with this id');
        require(from != address(0), 'ERC721: from == address(0)');
        require(to != address(0), 'ERC721: to == address(0)');
        require(_tokenOwners[tokenId] == from, 'ERC721: You must own the token to transfer it');
        require(_tokenOwners[tokenId] != to, 'ERC721: You already own this token');

        // rimuove l'approvazione
        _tokenApprovals[tokenId] = address(0);
        emit Approval(this.ownerOf(tokenId), to, tokenId);

        _balanceOf[from] = _balanceOf[from].sub(1);
        
        // tolgo dalla lista dei token posseduti(per non lasciare buchi sposto l'ultimo elemento nella posizione eliminata)
        uint length = _ownedTokens[from].length;
        for (uint i = 0; i < length; i++) {
            if (_ownedTokens[from][i] == tokenId) {
                _ownedTokens[from][i] = _ownedTokens[from][length - 1];
                _ownedTokens[from].pop();
                break;
            }
        }

        _balanceOf[to] = _balanceOf[to].add(1);
        _ownedTokens[to].push(tokenId);

        emit Transfer(from, to, tokenId);
    }


    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        require(tokenId <= _tokenId &&  tokenId != 0, 'ERC721: There is no token with this id');

        address owner = _tokenOwners[tokenId];
        return (spender == owner || _tokenApprovals[tokenId] == spender || this.isApprovedForAll(owner, spender));
    }

    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory data) internal returns(bool){
       // se l'address a cui invio il token è un utente oppure è un contratto che implementa lo standard ERC721(ritorna il magic value) ritorna tru
       // altrimenti lancia l'eccezione
        if (to.code.length > 0) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert("ERC721: transfer to non ERC721Receiver implementer");
                } else {
                    revert(string(reason));
                }
            }
        }else{
            return true;
        }
    }
}