import React from "react";
import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react";
import Link from "next/link";
import {
  BellIcon,
  ShoppingCartIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

function Header() {
  const connectWithMetamask = useMetamask();
  const disconnect = useDisconnect();
  const address = useAddress();

  return (
    <div className=" py-2 px-5">
      <nav className="flex justify-between  max-w-6xl mx-auto sticky top-0 z-50 py-2 bg-white">
        <div className="flex items-center space-x-2 text-xs ">
          {address ? (
            <button onClick={disconnect} className="connectWalletbtn ">
              Hi,{" "}
              {address.slice(0, 4) +
                " . . . . " +
                address.slice(address.length - 4, address.length)}
            </button>
          ) : (
            <button onClick={connectWithMetamask} className="connectWalletbtn">
              Connect your walle
            </button>
          )}
          <p className="hidden md:inline-flex cursor-pointer">Daily Deals</p>
          <p className="hidden md:inline-flex cursor-pointer">Help & Contact</p>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <p className="headerRight">Ship to</p>
          <p className="headerRight">Sell</p>
          <p className="headerRight">Watchlist</p>
          <Link
            href={"/addItem"}
            className="flex items-center space-x-1 hover:link"
          >
            <span>Add to inventory</span>
            <ChevronDownIcon className="h-4" />
          </Link>
          <BellIcon className="h-6" />
          <ShoppingCartIcon className="h-6" />
        </div>
      </nav>
      <hr className="mt-3 h-[2px] bg-gray-300" />
      <section className="flex items-center space-x-2 py-4">
        <div className="h-16 w-16 sm:w-28 md:w-44 cursor-pointer flex-shrink-0">
          <Link href={"/"}>
            <Image
              className="w-full h-full object-contain"
              height={100}
              width={100}
              alt="Ebay logo"
              src={"https://links.papareact.com/bdb"}
            />
          </Link>
        </div>
        <button className=" hidden lg:flex items-center space-x-2 w-20 ">
          <p className="text-gray-500 text-sm">Shop by Category</p>
          <ChevronDownIcon className="h-4 flex-shrink-0" />
        </button>
        <div className="flex items-center flex-grow space-x-2 px-2 md:px-5 py-2 border-black border-2 ">
          <MagnifyingGlassIcon className="h-6 pr-2 text-gray-400" />
          <input
            placeholder="Search for Anything"
            type="text"
            className=" flex-grow outline-none "
          />
        </div>
        <button className="text-white bg-blue-500 hidden sm:inline px-5 md:px-10 py-2 border-2 border-blue-500">Search</button>
        <Link href={"/Create"}>
        <button className="border border-blue-500 text-blue-500 hidden sm:inline px-5 md:px-10 py-2 hover:bg-blue-500/50 hover:text-white">
          List Item
        </button>
        </Link>
      </section>
      <hr />
      <section className="flex items-center py-3 text-sm whitespace-nowrap justify-center px-7">
        <p className="Lowerlink">Home</p>
        <p className="Lowerlink">Electronics</p>
        <p className="Lowerlink">Computers</p>
        <p className="Lowerlink hidden sm:inline">Video Games</p>
        <p className="Lowerlink hidden sm:inline">Home & Garden</p>
        <p className="Lowerlink hidden md:inline">Health & Beauty</p>
        <p className="Lowerlink hidden lg:inline">Collectibles and Art</p>
        <p className="Lowerlink hidden lg:inline">Books</p>
        <p className="Lowerlink hidden lg:inline">Music</p>
        <p className="Lowerlink hidden xl:inline">Deals</p>
        <p className="Lowerlink hidden xl:inline">Others</p>
        <p className="Lowerlink">More</p>
      </section>
    </div>
  );
}

export default Header;
