import { ethers, network } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { BigNumber } from "ethers";
import { Signer } from "ethers";
import { expect } from "chai";

import { BookLibrary } from "../typechain-types";
import { deploy } from "./utils/deployment";

import * as bookConfigurator from "./utils/bookConfigurator";

import {
  keccak256,
  defaultAbiCoder as abi,
  hexZeroPad,
} from "ethers/lib/utils";

import type { BookLibraryBase } from "../typechain-types/contracts/BookLibrary/utils";

describe("Book library basic functions", () => {
  let bookLibrary: BookLibrary;
  let owner: Signer;
  let alice: Signer;
  let bob: Signer;
  let books: BookLibraryBase.BookStruct[];

  async function initialState() {
    [owner, alice, bob] = await ethers.getSigners();
    bookLibrary = (await deploy("BookLibrary", owner)) as BookLibrary;
  }

  async function stateWithAddedBooks() {
    await initialState();
    await bookLibrary.addNewBooks(books);
  }

  async function stateWithBorrowedBooks() {
    await stateWithAddedBooks();
    await bookLibrary.borrowBooks([books[0].id, books[1].id]);
  }

  describe("Add", async () => {
    beforeEach(async () => {
      books = bookConfigurator.createBooks(2);
      await loadFixture(initialState);
    });

    it("Add books emit an event", async () => {
      await expect(bookLibrary.addNewBooks(books)).emit(
        bookLibrary,
        "NewBookAdded"
      );

      expect((await bookLibrary.getAvailableBooks()).length).to.be.equal(
        books.length
      );
    });
    it("Add books throw error that a caller is not the owner", async () => {
      await expect(
        bookLibrary.connect(alice).addNewBook(books[0])
      ).revertedWith("Ownable: caller is not the owner");

      await expect(bookLibrary.connect(alice).addNewBooks(books)).revertedWith(
        "Ownable: caller is not the owner"
      );
    });
    it("Add books throw error when try to submit books with same ids", async () => {
      books.forEach((book) => (book.id = 1));
      await expect(bookLibrary.addNewBooks(books)).revertedWith(
        /(BookLibrary: book with this id already exsists).*/
      );
    });
    it("Add books throw error when try to submit a book with an empty name or zero number of copies", async () => {
      books.forEach((book) => (book.name = ""));
      await expect(bookLibrary.addNewBooks(books)).revertedWith(
        /(BookLibrary: incorrect book object).*/
      );
    });
  });

  describe("Borrow", async () => {
    before(() => {
      books = bookConfigurator.createBooks(2);
    });

    beforeEach(async () => {
      await loadFixture(stateWithAddedBooks);
    });

    it("Borrow books emit an event", async () => {
      await expect(bookLibrary.borrowBooks(books.map((book) => book.id))).emit(
        bookLibrary,
        "BookIsBorrowed"
      );
    });

    it("Borrow books throw error when no free books left", async () => {
      let unavailableBook = books[0];

      // read books data from mapping storage
      // keccak256(abi.encode(book.id, slot of mapping))
      let encdodedData = abi.encode(
        ["uint256", "uint256"],
        [unavailableBook.id, 1]
      );
      let pointerToTheBookData = keccak256(encdodedData);
      let orderOfAccessibilityField = 3;
      let pointerToTheBookAccessibilityField = BigNumber.from(
        pointerToTheBookData
      )
        .add(orderOfAccessibilityField)
        .toHexString();

      const accessibility = await ethers.provider.getStorageAt(
        bookLibrary.address,
        pointerToTheBookAccessibilityField
      );

      // check that accessibility from storage is the same as in the book object
      expect(BigNumber.from(accessibility)).equal(
        BigNumber.from(unavailableBook.accessibility)
      );

      // set accessibility to zero in storage
      await network.provider.send("hardhat_setStorageAt", [
        bookLibrary.address,
        pointerToTheBookAccessibilityField,
        hexZeroPad("0x", 32),
      ]);

      await expect(bookLibrary.borrowBook(unavailableBook.id)).revertedWith(
        /(BookLibrary: no free books).*/
      );
    });

    it("Borrow books throw error when user try to borrow already owned book", async () => {
      await bookLibrary.borrowBook(books[0].id);
      await expect(bookLibrary.borrowBook(books[0].id)).revertedWith(
        /(BookLibrary: caller already owns a book).*/
      );
    });
  });

  describe("Return", async () => {
    before(() => {
      books = bookConfigurator.createBooks(3);
    });

    beforeEach(async () => {
      await loadFixture(stateWithBorrowedBooks);
    });

    it("Return books emit an event", async () => {
      await expect(bookLibrary.returnBooks([books[0].id, books[1].id])).emit(
        bookLibrary,
        "BooksIsReturned"
      );
    });

    it("Return books throw an error when try to return not owned book", async () => {
      await expect(bookLibrary.returnBook(books[2].id)).revertedWith(
        /(BookLibrary: caller doesn't own a book).*/
      );
    });
  });

  describe("Read only functions", async () => {
    beforeEach(async () => await initialState());
    it("Return book ownership history. Should return ordered array of owners. First is Alice, second is Bob.", async () => {
      books = bookConfigurator.createBooks(2);
      await bookLibrary.addNewBooks(books);

      await bookLibrary.connect(alice).borrowBook(books[0].id);
      await bookLibrary.connect(alice).returnBook(books[0].id);

      await bookLibrary.connect(bob).borrowBook(books[0].id);
      await bookLibrary.connect(bob).returnBook(books[0].id);

      const bookOwners = [await alice.getAddress(), await bob.getAddress()];
      expect(
        await bookLibrary.getBookOwnersHistory(books[0].id)
      ).to.have.ordered.members(bookOwners);
    });

    it("Should return two available books of three books created", async () => {
      books = bookConfigurator.createBooks(3);
      books[0].accessibility = 0;

      await bookLibrary.addNewBooks(books);
      expect((await bookLibrary.getAvailableBooks()).length).equal(
        books.filter((book) => BigNumber.from(book.accessibility).gt(0)).length
      );
    });

    it("Return error when no available books", async () => {
      await expect(bookLibrary.getAvailableBooks()).revertedWith(
        /(BookLibrary: no available books in a library).*/
      );
    });
  });
});
