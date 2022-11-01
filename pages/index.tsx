import type { NextPage } from "next";
import Header from "../components/Header";
import {
  useContract,
  useActiveListings,
  MediaRenderer,
} from "@thirdweb-dev/react";
import { ListingType } from "@thirdweb-dev/sdk";
import { BanknotesIcon, ClockIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";
const Home: NextPage = () => {
  const router = useRouter();
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    "marketplace"
  );

  const { data: listings, isLoading: loadinglisting } =
    useActiveListings(contract);

  return (
    <div className="">
      <Header />
      <main className="max-w-6xl mx-auto py-2 px-5">
        {loadinglisting ? (
          <p className="text-center animate-pulse text-blue-500">
            Loading listing...
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mx-auto">
            {listings?.map((item) => (
              
                <div
                onClick={() => router.push(`/listing/${item.id}`)}
                  key={item.id}
                  className="flex flex-col card hover:scale-105 transition-transform duration-150 ease-out"
                >
                  <div className="flex-1 flex flex-col pb-2 items-center ">
                    <MediaRenderer className="w-44" src={item.asset.image} />
                  </div>
                  <div className="pt-2 space-y-4">
                    <div>
                      <h2 className="text-lg">{item.asset.name}</h2>
                      <hr />
                      <p className="truncate text-sm text-gray-600 mt-2">
                        {item.asset.description}
                      </p>
                    </div>

                    <p>
                      <span className="font-bold mr-1">
                        {item.buyoutCurrencyValuePerToken.displayValue}
                      </span>{" "}
                      {item.buyoutCurrencyValuePerToken.symbol}
                    </p>
                    <div
                      className={`flex items-center space-x-1 justify-end text-xs border w-fit ml-auto p-2 rounded-lg text-white ${
                        item.type === ListingType.Direct
                          ? "bg-blue-500"
                          : "bg-red-500"
                      }`}
                    >
                      <p>
                        {item.type === ListingType.Direct
                          ? "Buy Now"
                          : "Auction"}
                      </p>
                      {item.type === ListingType.Direct ? (
                        <BanknotesIcon className="h-4" />
                      ) : (
                        <ClockIcon className="h-4" />
                      )}
                    </div>
                  </div>
                </div>
              
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
