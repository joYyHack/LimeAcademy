// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./utils/BookLibraryErrors.sol";
import "./utils/BookLibraryBase.sol";

/**
 * @title BookLibrary
 * @author joYyHack
 * @notice BookLibrary is a base contract that provides methods for
 *         borrowing, returning and tracking owners history of the books.
 */
contract BookLibrary is BookLibraryBase, BookLibraryErrors {
    // book id => book
    mapping(uint256 => Book) private _books;

    // book id => addresses => book statuses
    // map book id to respective addresses and book statuses
    // to see if the book is borrowed or free by specific address
    mapping(uint256 => mapping(address => BookStatus)) private _booksStatus;

    // books id => owners
    mapping(uint256 => address[]) private _booksOwnershipHistory;

    // array of book ids to allow iteration
    uint256[] private _bookIds;

    /**
     * @notice Add multiple books at once to the book library.
     *         Each book has to have a name and unique id that
     *         is not already reserved.
     *
     * @param books Books data to be added.
     */
    function addNewBooks(Book[] calldata books) external onlyOwner {
        for (uint i = 0; i < books.length; i++) {
            addNewBook(books[i]);
        }
    }

    /**
     * @notice Borrow multiple books at once.
     *         If some book is not accessible or the
     *         borrower already has a copy of some
     *         book then the error is thrown.
     *
     * @param ids Ids of the books to borrow.
     */
    function borrowBooks(uint256[] calldata ids) external {
        for (uint i = 0; i < ids.length; i++) {
            borrowBook(ids[i]);
        }
    }

    /**
     * @notice Return multiple books at once.
     *         If some of the book is not owned
     *         by the caller then the error is thrown.
     *
     * @param ids Ids of the books to return.
     */
    function returnBooks(uint[] calldata ids) external {
        for (uint i = 0; i < ids.length; i++) {
            returnBook(ids[i]);
        }
    }

    /**
     * @notice Return addresses of all people that have ever
     *         borrowed a given book.
     *
     * @return owners All owners of the given book.
     */
    function getBookOwnersHistory(
        uint256 _id
    ) external view returns (address[] memory owners) {
        owners = _booksOwnershipHistory[_id];
        return owners;
    }

    /**
     * @notice Return all available books to the end user.
     *
     * @return availableBooks Array of available books.
     */
    function getAvailableBooks()
        public
        view
        returns (Book[] memory availableBooks)
    {
        uint availableBooksCount;
        for (uint i = 0; i < _bookIds.length; i++) {
            if (_books[_bookIds[i]].accessibility > 0) availableBooksCount += 1;
        }

        require(
            availableBooksCount > 0,
            err("no available books in a library")
        );

        availableBooks = new Book[](availableBooksCount);
        uint256 index;

        for (uint i = 0; i < _bookIds.length; i++) {
            Book memory book = _books[_bookIds[i]];
            if (book.accessibility > 0) {
                availableBooks[index] = book;
                index++;
            }
        }
    }

    /**
     * @notice Add new book to the book library.
     *         Book has to have a name and unique id that
     *         is not already reserved.
     *
     * @param book Book data to be added.
     */
    function addNewBook(Book calldata book) public override onlyOwner {
        uint256 id = book.id;

        require(
            bytes(_books[id].name).length == 0,
            err("book with this id already exsists", id)
        );

        require(
            bytes(book.name).length > 0 && book.numberOfCopies > 0,
            err("incorrect book object", id)
        );

        _books[id] = book;
        _bookIds.push(id);

        emit NewBookAdded(id, book.name);
    }

    /**
     * @notice Borrow a book. If book is not accessible
     *         or the borrower already has a copy of this
     *         book then the error is thrown.
     *
     * @param id Id of the book to borrow.
     */
    function borrowBook(uint256 id) public override {
        require(_books[id].accessibility > 0, err("no free books", id));

        require(
            _booksStatus[id][msg.sender] == BookStatus.FREE,
            err("caller already owns a book", id)
        );

        _booksStatus[id][msg.sender] = BookStatus.BORROWED;

        Book storage book = _books[id];
        book.accessibility--;

        _booksOwnershipHistory[id].push(msg.sender);

        emit BookIsBorrowed(msg.sender, book.id, book.name);
    }

    /**
     * @notice Return a book. If book is not owned
     *         by the caller then the error is thrown.
     *
     * @param id Id of the book to return.
     */
    function returnBook(uint id) public override {
        require(
            _booksStatus[id][msg.sender] == BookStatus.BORROWED,
            err("caller doesn't own a book", id)
        );

        _booksStatus[id][msg.sender] = BookStatus.FREE;

        Book storage book = _books[id];
        book.accessibility++;

        emit BooksIsReturned(msg.sender, book.id, book.name);
    }
}
