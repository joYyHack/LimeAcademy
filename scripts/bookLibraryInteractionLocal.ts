import { ethers, providers, Contract, Wallet } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { BookLibrary } from "../typechain-types";
import { BookLibraryBase } from "../typechain-types/utils";
import chalk from "chalk";
import bookLibraryJson from "../artifacts/contracts/BookLibrary/BookLibrary.sol/BookLibrary.json";

let provider: JsonRpcProvider;
let signer: Wallet;
let bookLibrary: BookLibrary;

const setProvider = async (url: string) => {
  provider = new providers.JsonRpcProvider(url);
};

const setBookLibraryContractInstance = async (
  provider: JsonRpcProvider,
  bookLibraryAddress: string
) => {
  bookLibrary = new Contract(
    bookLibraryAddress,
    bookLibraryJson.abi,
    provider.getSigner()
  ) as BookLibrary;
};
const createWallet = () => {
  const privKey = process.env.BOB_PK as string;
  signer = new Wallet(privKey, provider);
};

const createBook = async (
  id: number,
  name: string,
  numberOfCopies: number,
  accessibility: number
) => {
  try {
    const tx = await bookLibrary.addNewBook({
      id,
      name,
      numberOfCopies,
      accessibility,
    } as BookLibraryBase.BookStruct);

    const reciept = await tx.wait();
    const txIsOk = reciept.status == 1;
    const text = `addNewBook tx status: ${txIsOk ? "ok" : "failed"}`;
    console.log(txIsOk ? chalk.green(text) : chalk.red(text));
  } catch (error) {
    console.log(chalk.red("addNewBook tx status: failed"));
  }
};
const borrowBook = async (id: number) => {
  try {
    const tx = await bookLibrary.borrowBook(id);
    const reciept = await tx.wait();
    const txIsOk = reciept.status == 1;
    const text = `borrowBook tx status: ${txIsOk ? "ok" : "failed"}`;
    console.log(txIsOk ? chalk.green(text) : chalk.red(text));
  } catch (error) {
    console.log(chalk.red("borrowBook tx status: failed"));
  }
};
const returnBook = async (id: number) => {
  try {
    const tx = await bookLibrary.returnBook(id);
    const reciept = await tx.wait();
    const txIsOk = reciept.status == 1;
    const text = `returnBook tx status: ${txIsOk ? "ok" : "failed"}`;
    console.log(txIsOk ? chalk.green(text) : chalk.red(text));
  } catch (error) {
    console.log(chalk.red("returnBook tx status: failed"));
  }
};
const showAvailableBooks = async () => {
  console.log(chalk.blue("Available books"));
  const availableBooks = await bookLibrary.getAvailableBooks();
  console.log(
    availableBooks.map((book) => ({
      id: book.id.toNumber(),
      name: book.name,
      "number of copies": book.numberOfCopies.toNumber(),
      accessibility: book.accessibility.toNumber(),
    }))
  );
};

async function main() {
  await setProvider("http://127.0.0.1:8545/");
  createWallet();

  await setBookLibraryContractInstance(
    provider,
    "0x0Bde5BE26Bb2bCE5D5EAC7bB4862BE30fa4fF3b4"
  );

  await createBook(1, "Mastering Ethereum", 1, 1);
  await createBook(2, "Mastering Bitcoin", 1, 1);
  await showAvailableBooks();

  await borrowBook(1);
  await showAvailableBooks();

  await returnBook(1);
  await showAvailableBooks();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
