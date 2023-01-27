// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @dev Contract that format error for BookLibrary.
 */
abstract contract BookLibraryErrors {
    function err(string memory text) internal pure returns (string memory) {
        return string.concat("BookLibrary: ", text);
    }

    function err(
        string memory text,
        uint256 bookId
    ) internal pure returns (string memory) {
        return
            string.concat(
                "BookLibrary: ",
                text,
                " 'book id: ",
                Strings.toString(bookId),
                "'"
            );
    }
}
