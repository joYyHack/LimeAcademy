// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

/**
 * @title BookLibraryBase
 * @notice BookLibraryBase contains basic struct, enum, events and functions.
 */
abstract contract BookLibraryBase is Ownable {
    /**
     * @dev Basic Structure of the book. Accessibility is the amount that is available to borrow.
     *      If accessibility amount is zero than there is no free books left.
     */
    struct Book {
        uint256 id;
        string name;
        uint256 numberOfCopies;
        uint256 accessibility;
    }

    enum BookStatus {
        FREE,
        BORROWED
    }

    event NewBookAdded(uint256 id, string name);
    event BookIsBorrowed(address borrower, uint256 id, string name);
    event BooksIsReturned(address borrower, uint256 id, string name);

    function addNewBook(Book calldata _book) public virtual;

    function borrowBook(uint256 _id) public virtual;

    function returnBook(uint256 _id) public virtual;
}
