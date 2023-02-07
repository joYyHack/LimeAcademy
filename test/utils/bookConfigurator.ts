import type { BookLibraryBase as BookLibrary } from "../../typechain-types/contracts/BookLibrary/utils";
import * as Chance from "chance";

export const createBooks = (amount: number): BookLibrary.BookStruct[] => {
  let chance = Chance.default();
  let books: BookLibrary.BookStruct[] = [];
  for (let i = 0; i < amount; i++) {
    const numOfCopies = chance.integer({ min: 0 });
    books.push({
      id: i,
      name: chance.name(),
      numberOfCopies: numOfCopies,
      accessibility: numOfCopies,
    });
  }
  return books;
};
