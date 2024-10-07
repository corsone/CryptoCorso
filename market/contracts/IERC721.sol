/// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface ERC165 {
    /// @notice Query if a contract implements an interface
    /// @param interfaceID The interface identifier, as specified in ERC-165
    /// @dev Interface identification is specified in ERC-165. This function
    ///  uses less than 30,000 gas.
    /// @return `true` if the contract implements `interfaceID` and
    ///  `interfaceID` is not 0xffffffff, `false` otherwise
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}

interface IERC721 is ERC165 {

    /// @dev Emitted when tokenId token is transferred from from to to
    event Transfer(address indexed from, address indexed to, uint indexed tokenId);

    /// @dev Emitted when owner enables approved to manage the tokenId token
    event Approval(address indexed owner, address indexed approved, uint indexed tokenId);

    /// @dev Emitted when owner enables or disables (approved) operator to manage all of its assets.
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    /// @notice Returns the number of tokens in owner's account
    /// @dev NFTs assigned to the zero address are considered invalid, and this
    ///       function throws for queries about the zero address.
    /// @param owner An address for whom to query the balance
    /// @return The number of NFTs owned by `_owner`, possibly zero
    function balanceOf(address owner) external view returns (uint);

    /// @notice Returns the owner of the tokenId token
    /// @dev `tokenId` must exist
    ///       NFTs assigned to zero address are considered invalid, and queries about them do throw.
    /// @param tokenId The identifier for an NFT
    /// @return The address of the owner of the NFT
    function ownerOf(uint tokenId) external view returns (address);

    /// @notice Safely transfers tokenId token `from` from to `to`
    /// @dev - `from` cannot be the zero address
    ///      - `to` cannot be the zero address
    ///      - `tokenId` token must exist and be owned by `from`
    ///      - If the caller is not `from`, it must be approved to move this token by either `approve` or `setApprovalForAll`
    ///      - If to refers to a smart contract, it must implement IERC721Receiver.onERC721Received,
    ///        which is called upon a safe transfer
    ///     Emits a Transfer event.
    /// @param from The current owner of the NFT
    /// @param to The new owner
    /// @param tokenId The NFT to transfer
    /// @param data Additional data with no specified format, sent in call to `_to`
    function safeTransferFrom(address from, address to, uint tokenId, bytes calldata data) external;

    /// @notice Safely transfers tokenId token from from to to, checking first that contract recipients
    ///         are aware of the ERC721 protocol to prevent tokens from being forever locked
    /// @dev - `from` cannot be the zero address
    ///      - `to` cannot be the zero address
    ///      - `tokenId` token must exist and be owned by `from`
    ///      - If the caller is not `from`, it must be approved to move this token by either `approve` or `setApprovalForAll`
    ///      - If to refers to a smart contract, it must implement IERC721Receiver.onERC721Received,
    ///        which is called upon a safe transfer
    ///     Emits a Transfer event.
    /// @param from The current owner of the NFT
    /// @param to The new owner
    /// @param tokenId The NFT to transfer
    function safeTransferFrom(address from, address to, uint tokenId) external;

    /// @notice Transfers tokenId token from from to to.
    ///         The caller is responsible to confirm that the recipient is capable of receiving ERC721 or else they may be permanently lost.
    /// @dev - `from` cannot be the zero address
    ///      - `to` cannot be the zero address
    ///      - `tokenId` token must exist and be owned by `from`
    ///      - If the caller is not `from`, it must be approved to move this token by either `approve` or `setApprovalForAll`.
    ///     Emits a Transfer event.
    /// @param from The current owner of the NFT
    /// @param to The new owner
    /// @param tokenId The NFT to transfer
    function transferFrom(address from, address to, uint tokenId) external;

    /// @notice Gives permission to to to transfer tokenId token to another account. 
    ///         The approval is cleared when the token is transferred.
    ///         Only a single account can be approved at a time, so approving the zero address clears previous approvals.
    /// @dev - The caller must own the token or be an approved operator
    ///      - tokenId` token must exist and be owned by `from`
    ///     Emits an Approval event.
    /// @param approved The new approved NFT controller
    /// @param tokenId The NFT to approve
    function approve(address approved, uint tokenId) external;

    /// @notice Approve or remove operator as an operator for the caller. 
    ///         Operators can call transferFrom or safeTransferFrom for any token owned by the caller.
    /// @dev The operator cannot be the address zero.
    ///      Emits an ApprovalForAll event
    /// @param operator Address to add to the set of authorized operators
    /// @param approved True if the operator is approved, false to revoke approval
    function setApprovalForAll(address operator, bool approved) external;

    /// @notice Returns the account approved for tokenId token
    /// @dev tokenId must exist
    /// @param tokenId The NFT to find the approved address for
    /// @return The approved address for this NFT, or the zero address if there is none
    function getApproved(uint tokenId) external view returns (address);

    /// @notice Returns if the operator is allowed to manage all of the assets of owner
    /// @param owner The address that owns the NFTs
    /// @param operator The address that acts on behalf of the owner
    /// @return True if `_operator` is an approved operator for `_owner`, false otherwise
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}


interface IERC721Metadata is IERC721{
    /// @notice A descriptive name for a collection of NFTs in this contract
    function name() external view returns (string memory);

    /// @notice An abbreviated name for NFTs in this contract
    function symbol() external view returns (string memory);

    /// @notice A distinct Uniform Resource Identifier (URI) for a given asset.
    /// @dev Throws if `tokenId` is not a valid NFT. 
    ///      The URI may point to a JSON file that conforms to the "ERC721 Metadata JSON Schema".
    function tokenURI(uint tokenId) external view returns (string memory);
}

interface IERC721Enumerable is IERC721{
    /// @notice Returns the total amount of valid NFTs tracked by this contract, where each one of
    ///  them has an assigned and queryable owner not equal to the zero address
    function totalSupply() external view returns (uint);

    /// @notice Returns a token ID at a given index of all the tokens stored by the contract.
    ///         Use along with balanceOf to enumerate all of owner's tokens.
    /// @dev Throws if `index` >= `totalSupply()`
    /// @param index A counter less than `totalSupply()`
    /// @return The token identifier for the `_index`th NFT
    function tokenByIndex(uint index) external view returns (uint);

    /// @notice Returns a token ID owned by owner at a given index of its token list.
    ///          Use along with totalSupply to enumerate all tokens.
    /// @dev Throws if `index` >= `balanceOf(owner)` or if `owner` is the zero address, representing invalid NFTs
    /// @param owner An address where we are interested in NFTs owned by them
    /// @param index A counter less than `balanceOf(_owner)`
    /// @return The token identifier for the `_index`th NFT assigned to `_owner`
    function tokenOfOwnerByIndex(address owner, uint index) external view returns (uint);
}


interface IERC721Receiver is IERC721{
    /// @notice Handle the receipt of an NFT
    /// @dev The ERC721 smart contract calls this function on the recipient
    ///  after a `transfer`. This function MAY throw to revert and reject the
    ///  transfer. Return of other than the magic value MUST result in the
    ///  transaction being reverted.
    ///  Note: the contract address is always the message sender.
    /// @param operator The address which called `safeTransferFrom` function
    /// @param from The address which previously owned the token
    /// @param tokenId The NFT identifier which is being transferred
    /// @param data Additional data with no specified format
    /// @return `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
    ///  unless throwing
    function onERC721Received(address operator, address from, uint256 tokenId, bytes memory data) external returns(bytes4);
}