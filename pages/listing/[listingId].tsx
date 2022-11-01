import { UserCircleIcon } from "@heroicons/react/24/outline";
import {
  useContract,
  useListing,
  MediaRenderer,
  useNetwork,
  useNetworkMismatch,
  useMakeBid,
  useOffers,
  useBuyNow,
  useMakeOffer,
  useAddress,
  useAcceptDirectListingOffer,
} from "@thirdweb-dev/react";
import { ListingType, NATIVE_TOKENS } from "@thirdweb-dev/sdk";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Countdown from "react-countdown";
import network from "../../utils/network";
import { ethers } from "ethers";

function ListingPage() {
  const router = useRouter();
  const address = useAddress();
  const { listingId } = router.query as { listingId: string };
  const [bidAmt, setBidAmount] = useState("");
  const [, switchNetwork] = useNetwork();
  const networkMismatch = useNetworkMismatch();
  const [minimumNextBid, setMinimumNextBid] = useState<{
    displayValue: string;
    symbol: string;
  }>();
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    "marketplace"
  );
  const { data: listing, isLoading, error } = useListing(contract, listingId);
  const { mutate: buyNow } = useBuyNow(contract);
  const { mutate: makeOffer } = useMakeOffer(contract);
  const { data: offers } = useOffers(contract, listingId);
  const { mutate: makeBid } = useMakeBid(contract);
  const { mutate: acceptOffer } = useAcceptDirectListingOffer(contract);
  console.log(offers);

  useEffect(() => {
    if (!listingId || !contract || !listing) {
      return;
    }
    if (listing.type === ListingType.Auction) {
      fetchMinNextBid();
    }
  }, [listing, listingId, contract]);

  const fetchMinNextBid = async () => {
    if (!listingId || !contract) {
      return;
    }
    const minNextBid = await contract?.auction.getMinimumNextBid(listingId);
    setMinimumNextBid({
      displayValue: minNextBid?.displayValue,
      symbol: minNextBid?.symbol,
    });
  };

  const formatePlaceHolder = () => {
    if (!listing) {
      return;
    }
    if (listing.type === ListingType.Direct) {
      return "Enter Offer Amount";
    }
    if (listing.type === ListingType.Auction) {
      return Number(minimumNextBid?.displayValue) === 0
        ? "Enter Bid Amount"
        : `${minimumNextBid?.displayValue}  ${minimumNextBid?.symbol} or more`;
    }
  };
  const buyNft = async () => {
    if (networkMismatch) {
      switchNetwork && switchNetwork(network);
      return;
    }
    if (!listing || !contract || !listingId) {
      return;
    }
    //  id: ,
    // buyAmount: ,
    // type: listing.type,
    // address: address,
    await buyNow(
      {
        id: listingId,
        buyAmount: 1,
        type: listing.type,
      },
      {
        onSuccess(data, variables, context) {
          alert("NFT bought successfully!");
          console.log("SUCCESS", data, variables, context);
          router.replace("/");
        },
        onError(error, variables, context) {
          alert("NFT could not be bought");
          console.log("ERROR", error, variables, context);
        },
      }
    );
  };
  const createBidOrOffer = async () => {
    try {
      if (networkMismatch) {
        switchNetwork && switchNetwork(network);
        return;
      }
      if (!listing) {
        return;
      }

      // Direct Listing
      if (listing.type === ListingType.Direct) {
        if (
          listing.buyoutPrice.toString() ===
          ethers.utils.parseEther(bidAmt).toString()
        ) {
          console.log("Buyout Price met, buying NFT...");
          buyNft();
          return;
        }
        // error here
        // make offer (bargain)
        console.log("Buy out price not meet now makig offer");

        await makeOffer(
          {
            listingId,
            quantity: 1,
            pricePerToken: bidAmt,
          },
          {
            onSuccess(data, variables, context) {
              console.log("SUCCESS", data, variables, context);
              alert("Offer Made Successfully!");
              setBidAmount("");
            },
            onError(error, variables, context) {
              console.log("ERROR", error, variables, context);
              alert("Error: Offer could not be made");
            },
          }
        );
      }

      // Auction Listing
      if (listing.type === ListingType.Auction) {
        console.log("Making bidding offer");
        await makeBid(
          {
            bid: bidAmt,
            listingId,
          },
          {
            onSuccess(data, variables, context) {
              console.log("SUCCESS", data, variables, context);
              alert("Bid Made Successful");
              setBidAmount("");
            },
            onError(error, variables, context) {
              console.log("ERROR", error, variables, context);
              alert("Bid ERROR Made");
            },
          }
        );
      }
    } catch (error) {
      console.error(error);
    }
  };
  if (isLoading) {
    return (
      <>
        <Header />
        <div>
          <p className="text-3xl animate-pulse text-blue-500">
            Loading Item...
          </p>
        </div>
      </>
    );
  }
  if (!listing) {
    return <div className="text-4xl mt-10 text-center">Listing Not Found</div>;
  }

  
  return (
    <div>
      <Header />
      <main className="max-w-6xl mx-auto p-2 flex flex-col lg:flex-row space-y-10 space-x-5">
        <div className="p-10 border mx-auto lg:mx-0 max-w-md lg:max-w-xl">
          <MediaRenderer className="object-cover" src={listing.asset.image} />
        </div>
        <section className="flex-1 space-y-5 pb-20 lg:pb-5 ">
          <div>
            <h1>{listing.asset.name}</h1>
            <p className="text-gray-600">{listing.asset.description}</p>
            <p className="flex items-center text-xs sm:text-base ">
              <UserCircleIcon className="h-6" />
              <span className="font-bold pl-1 pr-3">Seller:</span>{" "}
              {listing.sellerAddress}
            </p>
          </div>

          <div className="grid grid-cols-2 items-center py-2 ">
            <p className="font-bold">Listing Type:</p>
            {listing.type === ListingType.Direct
              ? "Direct Listing"
              : "Auction Listing"}

            <p className="font-bold">Buy Now</p>
            <p className="text-4xl font-bold">
              {listing.buyoutCurrencyValuePerToken.displayValue} {"  "}{" "}
              {listing.buyoutCurrencyValuePerToken.symbol}{" "}
            </p>
            <button
              onClick={buyNft}
              className="col-start-2 mt-3 bg-blue-500 font-semibold text-white rounded-full w-44 py-4 px-10 "
            >
              Buy Now
            </button>
          </div>

          {/* Direct offer div */}
          {listing.type === ListingType.Direct && offers && (
            <div className="grid grid-cols-2 gap-y-2">
              <p className="font-bold">Offers:</p>
              <p className="font-bold">
                {offers.length > 0 ? offers.length : 0}
              </p>
              {offers.map((offer) => (
                <div>
                  {/*  {address.slice(0, 4) +
                " . . . . " +
                address.slice(address.length - 4, address.length)} */}
                  <p className="flex items-center ml-5 text-sm italic">
                    <UserCircleIcon className="h-3 mr-2" />
                    {offer.offeror.slice(0, 5) +
                      "..." +
                      offer.offeror.slice(-5)}
                  </p>
                  <div>
                    <p
                      key={
                        offer.listingId +
                        offer.offeror +
                        offer.totalOfferAmount.toString()
                      }
                      className="text-sm italic"
                    >
                      {ethers.utils.formatEther(offer.totalOfferAmount)}{" "}
                      {NATIVE_TOKENS[network].symbol}
                    </p>
                    {listing.sellerAddress === address && (
                        <button onClick={() => {
                            acceptOffer({
                                addressOfOfferor: offer.offeror,
                                listingId,
                            },{
                                onSuccess(data, variables, context) {
                                    alert("Offer Accepted successfully!");
                                    console.log('SUCCESS',data, variables, context);
                                    router.replace('/');
                                },
                                onError(error, variables, context) {
                                    alert("ERROR: Offer not Accepted!");
                                    console.log("ERROR",error, variables, context);
                                },
                            })
                        }}
                            className="p-2 w-32 bg-red-500/50 rounded-lg font-bold text-xs cursor-pointer"
                        >
                            Accept Offer
                        </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 space-y-2 items-center justify-end">
            <hr className="col-span-2" />
            <p className="col-span-2 font-bold">
              {listing.type === ListingType.Direct
                ? "Make an Offer"
                : "Bid on this Auction"}
            </p>
            {listing.type === ListingType.Auction && (
              <>
                <p>Current Minimum Bid:</p>
                <p className="font-bold">
                  {minimumNextBid?.displayValue} {minimumNextBid?.symbol}{" "}
                </p>

                <p>Time Remaining</p>
                <Countdown
                  date={Number(listing.endTimeInEpochSeconds.toString()) * 1000}
                />
              </>
            )}
            {/* reaming time of auction */}
            <input
              type="text"
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={formatePlaceHolder()}
              className="border pb-2 outline-1 rounded-lg mr-5 px-5 py-1.5 placeholder:text-gray-600"
            />
            <button
              onClick={createBidOrOffer}
              className="bg-red-500 mt-3 font-semibold text-white rounded-full w-44 py-4 px-10  "
            >
              {listing.type === ListingType.Direct ? "Offer" : "Bid"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ListingPage;
