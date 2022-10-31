import { useRouter } from "next/router";
import React, { FormEvent, useState } from "react";
import Header from "../components/Header";
import {
  MediaRenderer,
  useAddress,
  useContract,
  useNetwork,
  useNetworkMismatch,
  useOwnedNFTs,
  useCreateDirectListing,
  useCreateAuctionListing,
} from "@thirdweb-dev/react";
import { NFT, NATIVE_TOKENS, NATIVE_TOKEN_ADDRESS } from "@thirdweb-dev/sdk";
import network from "../utils/network";
import { Enum } from "@solana/web3.js";

function Create() {
  const router = useRouter();
  const address = useAddress();
  const [selectedNft, setSelectedNft] = useState<NFT>();
  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    "marketplace"
  );
  const { contract: nftCollection } = useContract(
    process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
    "nft-collection"
  );
  const { mutate: createDirectListing, isLoading: isLoadingDirect, error: errorDirect } = useCreateDirectListing(contract);
  const { mutate: createAuctionListing, isLoading: isLoadingAuction, error: errorAuction } = useCreateAuctionListing(contract);
  const ownerNFT = useOwnedNFTs(nftCollection, address);
  const unSelect = () => {
    setSelectedNft(undefined);
  };
//   1:12:41
  const handleCreateListing = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (networkMismatch) {
      switchNetwork && switchNetwork(network);
      return;
    }
    if (!selectedNft) return;

    
    const target = e.target as typeof e.target & {
      elements: {
        listingType: { value: string };
        price: { value: string };
      };
    };

    const { listingType, price } = target.elements;

    if (listingType?.value === "directlisting") {
        await createDirectListing({
            assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
            tokenId: selectedNft.metadata.id,
            currencyContractAddress: NATIVE_TOKEN_ADDRESS,
            listingDurationInSeconds: 60 * 60 * 24 * 7, // 1 week
            quantity: 1,
            buyoutPricePerToken: price.value,
            startTimestamp: new Date()
        }, {
            onSuccess(data, variables, context) {
                console.log('Success',data, variables, context);
                router.push('/');
            },
            onError(error, variables, context) {
                console.log('ERROR',error, variables, context);
            }
        })
    }
    if(listingType?.value === "auctionlisting") {
        await createAuctionListing({
            assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
            buyoutPricePerToken: price.value,
            tokenId: selectedNft.metadata.id,
            startTimestamp: new Date(),
            currencyContractAddress: NATIVE_TOKEN_ADDRESS,
            listingDurationInSeconds: 60 * 60 * 24 * 7, // 1 week
            quantity: 1,
            reservePricePerToken: 0
        }, {
            onSuccess(data, variables, context) {
                console.log('Success',data, variables, context);
                router.push('/');
            },
            onError(error, variables, context) {
                console.log('ERROR',error, variables, context);
            }
        })
    }
  };
  return (
    <div>
      <Header />
      <main className="max-w-6xl mx-auto p-10 pt-2 ">
        <h1 className="text-4xl font-bold">List an Item</h1>
        <h2 className="text-xl font-semibold pt-5">
          Select an Item you would like to Sell
        </h2>

        <hr className="mb-5" />

        <p>Below you will find the NFT's you own in your wallet</p>

        <div className="flex overflow-x-scroll space-x-3 p-4">
          {ownerNFT?.data?.map((nft) => (
            <div
              className={`flex flex-col space-y-2 card min-w-fit border-2 hover:scale-105 transition-transform duration-150 ease-out ${
                nft?.metadata?.id === selectedNft?.metadata?.id
                  ? "border-black"
                  : "border-transparent"
              } `}
              key={nft.metadata.id}
              onClick={() => setSelectedNft(nft)}
            >
              <MediaRenderer
                className="h-48 rounded-lg"
                src={nft.metadata.image}
              />
              <p className="text-lg font-bold">{nft.metadata.name}</p>
              <p className="text-xs truncate">{nft.metadata.description}</p>
            </div>
          ))}
        </div>

        {selectedNft && (
          <form onSubmit={handleCreateListing}>
            <div className="flex flex-col p-10">
              <div className=" grid grid-cols-2 gap-5 ">
                <label className="border-r font-light">
                  Direct Listing / Fixed Price
                </label>
                <input
                  type="radio"
                  name="listingType"
                  id="directlisting"
                  value="directlisting"
                  className="ml-auto h-6 w-6"
                />
                <label className="border-r font-light">Auction</label>
                <input
                  type="radio"
                  name="listingType"
                  id="auctionlisting"
                  value="auctionlisting"
                  className="ml-auto h-6 w-6"
                />
                <div className="flex items-center justify-between">
                  <label className="border-r font-light">Price</label>
                  <input
                    type="text"
                    placeholder="0.0005"
                    id="price"
                    className="outline-none bg-gray-100 p-4"
                    name="price"
                  />
                </div>
              </div>
              <button
                className=" bg-blue-500 text-white font-semibold tracking-wide rounded-lg p-3 text-center mt-8 "
                type="submit"
              >
                Create Listing
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default Create;
