import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  Typography,
  Button,
} from "@mui/material";
import DashboardLayout from "../layouts/DashboardLayout";
import AssestCard from "../components/AssestCard";
import DashboardHeader from "../components/DashboardHeader";

import diamondShinyIcon from "../assets/diamond-shiny-icon.svg";
import sendIcon from "../assets/send-icon.svg";
import receiveIcon from "../assets/receive-icon.svg";

import { open_url } from "../services/utils/open";

import availLogo from "../assets/avail-icon.svg";
import NftDisplay from "../components/NftDisplay";
import NftDetailsDisplay from "../components/NftDetailsDisplay";
import {
  CompletedDisplay,
  PendingDisplay,
} from "../components/ActivityStatusCard";
import SwipeableEdgeDrawer from "../components/SwipeableDrawer";
import React, { useState } from "react";
import ActivityDetails from "../components/ActivityDetails";
import AsssetDisplay from "../components/AsssetDisplay";
import DashboardCarousel from "../components/DashboardCarousel";
import { useNavigate } from "react-router-dom";
import { getName } from "../services/states/util";
import { getAddress } from "../services/states/util";
import { AirdropNft } from "../components/Nft";

// Services
import { get_nfts } from "../services/nfts/fetch";
import { getWhitelists, getCollections } from "../services/quests/quests";

// Types
import { type INft, disruptorWhitelist } from "../types/nfts/nft";
import {
  type WhitelistResponse,
  type Collection,
  testCollection,
} from "../types/quests/quest_types";
import { type AvailError } from "../types/errors";

// Interfaces
import { type AssetType } from "../types/assets/asset";
import { AvailEvent } from "../services/wallet-connect/WCTypes";
import { handleGetTokens } from "services/tokens/get_tokens";
import { useTranslation } from "react-i18next";

//Images
import noNftsImage from "../assets/images/no_nfts.png";
import noAssetsImage from "../assets/images/no_balance.png";
import noActivyityImage from "../assets/images/no_activity.png";
import { SuccinctAvailEvent } from "types/avail-events/event";
import { listen } from "@tauri-apps/api/event";
import { useScan } from "../../../src/context/ScanContext";
import { useRecentEvents } from "../../../src/context/EventsContext";
import ReceiveItem from "components/modals/RecieveItem";

import { truncateText } from "../components/DashboardHeader";
const Dashboard = () => {
  const navigate = useNavigate();
  const goToOther = () => {
    navigate("/secret-recovery");
  };
  const DASHBOARD_ITEMS = [
    { icon: diamondShinyIcon },
    { icon: sendIcon, path: "/send" },
    { icon: receiveIcon },
    { icon: receiveIcon },
  ];

  const airdropNftData = [
    { whitelist_img: availLogo, name: "Airdrop NFT 1" },
    { whitelist_img: availLogo, name: "Airdrop NFT 2" },
    { whitelist_img: availLogo, name: "Airdrop NFT 3" },
  ];

  const [nfts, setNfts] = React.useState<INft[]>([]);
  const [airdropNfts, setAirdropNfts] = React.useState<Collection[]>([]);

  // Alert states
  const [errorAlert, setErrorAlert] = React.useState(false);
  const [successAlert, setSuccessAlert] = React.useState(false);
  const [warningAlert, setWarningAlert] = React.useState(false);
  const [infoAlert, setInfoAlert] = React.useState(false);
  const [message, setMessage] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);

  const [open, setOpen] = React.useState<boolean>(false);
  const [recieve, setReceiveActive] = React.useState<boolean>(true);
  const toggleDrawer = (newOpen: boolean) => (): void => {
    setOpen(newOpen);
  };
  const recievePressed = (receiveNow: boolean) => (): void => {
    setReceiveActive(receiveNow);
  };

  const [activeTab, setActiveTab] = useState("assets");

  const [openActivityDetails, setOpenActivityDetails] = useState(false);
  const toggleActivityDetails = (newOpen: boolean) => (): void => {
    setOpenActivityDetails(newOpen);
  };

  //Bottom Sheet
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const handleWhitelistCollectionCheck = (
    whitelist: WhitelistResponse,
    collections: Collection[]
  ) => {
    collections.forEach((collection) => {
      if (collection.name === whitelist.collection_name) {
        console.log("Adding airdrop nft");
        console.log(collection);
        console.log(airdropNfts);
        setAirdropNfts([...airdropNfts, collection]);
      }
    });
  };

  const checkWhitelists = (
    whitelists: WhitelistResponse[],
    collections: Collection[]
  ) => {
    console.log(whitelists);
    const selectedCollections: Collection[] = [];
    whitelists.forEach((whitelist) => {
      collections.forEach((collection) => {
        if (collection.name === whitelist.collection_name) {
          selectedCollections.push(collection);
        }
      });
    });

    setAirdropNfts(selectedCollections);
  };

  //Bottom sheet
  const handleItemClick = (index: number) => {
    console.log("I am being clicked");
    // if (index === 2) {
    //   console.log("INFO: Tapped on receive -- firing bottom sheet");
    //   setIsBottomSheetOpen(true);

    //   recievePressed(true);
    // }
    if (index === 2) {
      setReceiveActive(!recieve);
    }
    // Handle other items if necessary
  };

  const handleClose = () => {
    console.log("INFO: Tapped on receive -- killing bottom sheet");
    setIsBottomSheetOpen(false);
  };

  const handleXlink = async (url: string) => {
    await open_url(url);
  };
  // let address = get_address().then((data) => {
  //   console.log("address", data);
  // });

  const sampleData = {
    recipient: "@zack_x",
    date: "12 Mar at 2:34 PM",
    transactionDetails: [
      { title: "Transaction hash", value: "at13wfnwclps34..." },
      { title: "Network", value: "Aleo" },
      { title: "Network Fee", value: "$0.001 • 0.00166 ALEO" },
      { title: "Total est", value: "$90.86 " },
    ],
    transactions: [
      {
        imageUrl:
          "https://s3-alpha-sig.figma.com/img/b54a/8610/d906fd0744803a5ded08dd34492621f6?Expires=1716768000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=hSZoVruiksWEFRAiZwIaC6xWoG3LHh~UQpAIqwYzPxud7G6WsDnIKIC7k93E5u~VGSsNHfmyCKn9SspO7EoOaGOf0JXzzkhLyvAJTuaiEceqR-5j-6pysTg5lF72FZdyorymsHPOrUmsJeRaS66x7qi-r5I~9bzkWli~wfIrexkN4aHiGJC7AGzOO7t7Lbqo5sHR8pS9roHCpq8UCxK-WgvmiJ84g~vB0g~W47jppo7ruBZVwNWxM71NFyZ~31y3Yg4~DD3Onm-ayhgvLobb4NEjJmGBDC9eAVeoeIRhC7x446CJl5bFCIObuwhlHwSAXEw0C8UFEtWqAIcZOJ6aYA__",
        from: "G Block",
        amount: "-$90.87",
        aleo: "146.7 ALEO",
      },
      // Additional transactions can be added here
    ],
  };

  const shouldRunEffect = React.useRef(true);

  const [username, setUsername] = React.useState<string>("");
  const [address, setAddress] = React.useState<string>("aleo1gu...w4i");

  /* --Events || Balance || Assets-- */
  const [balance, setBalance] = React.useState<number>(0);
  const [assets, setAssets] = React.useState<AssetType[]>([]);

  /* --Event Drawer-- */
  const [eventDrawerOpen, setEventDrawerOpen] = React.useState(false);
  const [event, setEvent] = React.useState<SuccinctAvailEvent | undefined>();

  /* --Block Scan State-- */
  const { scanInProgress, startScan, endScan } = useScan();

  const [localScan, setLocalScan] = React.useState<boolean>(false);
  const [scanProgressPercent, setScanProgressPercent] =
    React.useState<number>(0);

  /* -- Recent Events State -- */
  const { events, fetchEvents, updateEventList } = useRecentEvents();

  const { t } = useTranslation();

  const handleGetAssets = () => {
    handleGetTokens()
      .then((response) => {
        console.log(response);
        console.log("firing");
        setAssets(response.assets);
        setBalance(response.balance_sum);
        // console.log(`nfts are --` + nfts.length);
      })
      .catch((error) => {
        console.log(error);
        setMessage(t("home.messages.errors.balance"));
        setErrorAlert(true);
      });
  };

  React.useEffect(() => {
    getName(setUsername).catch((error) => {
      console.log(error);
    });

    getAddress(setAddress).catch((error) => {
      console.log(error);
    });

    handleGetAssets();

    if (shouldRunEffect.current) {
      getCollections()
        .then(async (collections) => {
          console.log(collections);
          const whitelists = await getWhitelists();
          console.log(whitelists);

          checkWhitelists(whitelists, collections);
          setLoading(false);
        })
        .catch((err) => {
          const error = err as AvailError;

          if (error.error_type.toString() === "Unauthorized") {
            // eslint-disable-next-line no-warning-comments
            // TODO - Re-authenticate and fix execution on re-auth (Bala)

            console.log("Unauthorized, re auth");

            setOpen(true);
          } else {
            console.log(error.internal_msg);
            setMessage(error.internal_msg);
            setErrorAlert(true);
          }
        });

      get_nfts()
        .then((nfts) => {
          setNfts(nfts);
        })
        .catch((err) => {
          console.log(err);
        });

      shouldRunEffect.current = false;
    }
  }, []);

  /* --Event Listners */
  React.useEffect(() => {
    const unlistenScan = listen("scan_progress", (event) => {
      console.log(scanInProgress);
      console.log(event);
      console.log(event.payload);

      const progress = event.payload as number;
      if (progress !== 100) {
        startScan();
      }

      setScanProgressPercent(progress);
    });

    const unlistenTx = listen("tx_state_change", (event) => {
      console.log(event);

      fetchEvents();
      handleGetAssets();
    });

    return () => {
      unlistenScan
        .then((remove) => remove())
        .catch((error) => {
          console.log(error);
        });

      unlistenTx
        .then((remove) => remove())
        .catch((error) => {
          console.log(error);
        });
    };
  }, []);

  return (
    <>
      <DashboardLayout>
        <DashboardHeader
          onProfileClick={(): void => {
            setOpen(true);
          }}
          profileAddress={address}
        />
        <Typography color="#fff">Total Balance</Typography>
        <Typography
          sx={{ textShadow: "0 0 15px #00FFAA" }}
          color="#00FFAA"
          fontWeight={600}
          fontSize="40px"
        >
          {`$` + balance}
        </Typography>
        {/* This is the Percentage text, that shows in green or red, commented out by now -- order from Bala */}
        {/* <Typography color="#01FFAA">+450.6%</Typography> */}
        <Box
          display="flex"
          alignItems="center"
          my={3}
          justifyContent="space-between"
          width="90%"
          mx="auto"
        >
          {DASHBOARD_ITEMS.map((item, index) => (
            <Button
              key={index}
              onClick={() => handleItemClick(index)}
              sx={{
                borderRadius: "9px",
                p: 1,
                height: "63px",
                width: "62px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#2A2A2A",
                cursor: "pointer",
                outline: "none",
                border: "none",
                "&:focus": {
                  outline: "none",
                },
                "&:active": {
                  bgcolor: "#2A2A2A",
                },
                "&:hover": {
                  bgcolor: "#2A2A2A",
                },
              }}
            >
              <img src={item.icon} alt={`icon-${index}`} />
            </Button>
          ))}
        </Box>

        <Box display="flex" mb={2}>
          <Typography
            fontWeight={500}
            borderBottom={activeTab === "assets" ? "1px solid #FFFFFF" : ""}
            fontSize="20px"
            width="content-fit"
            mr={2}
            onClick={() => {
              setActiveTab("assets");
            }}
          >
            Assets
          </Typography>

          <Typography
            fontWeight={500}
            fontSize="20px"
            width="content-fit"
            borderBottom={activeTab === "nft" ? "1px solid #FFFFFF" : ""}
            mr={2}
            onClick={() => {
              setActiveTab("nft");
            }}
          >
            NFT
          </Typography>
          <Typography
            fontWeight={500}
            fontSize="20px"
            width="content-fit"
            borderBottom={activeTab === "activity" ? "1px solid #FFFFFF" : ""}
            onClick={() => {
              setActiveTab("activity");
            }}
          >
            Activity
          </Typography>
        </Box>

        <DashboardCarousel />

        {activeTab === "activity" &&
          (events.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center">
              <img src={noNftsImage} alt="No NFTs" />
              <Typography
                fontFamily="DM Sans"
                fontSize="17px"
                color="#B6B6B6"
                mt={3}
              >
                No Activity yet
              </Typography>
              <Typography
                fontFamily="DM Sans"
                fontSize="17px"
                color="#969696"
                mt={1}
              >
                Go and do something and it will appear{"\n"}{" "}
                <Box component="span" color="#00FFAA">
                  here
                </Box>
                .
              </Typography>
            </Box>
          ) : (
            <>
              <PendingDisplay
                onClick={() => {
                  setOpenActivityDetails(true);
                }}
                activity={events}
              />
              {/* <CompletedDisplay /> */}
            </>
          ))}

        {activeTab === "nft" &&
          (nfts.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center">
              <img src={noNftsImage} alt="No NFTs" />
              <Typography
                fontFamily="DM Sans"
                fontSize="17px"
                color="#B6B6B6"
                mt={3}
              >
                No NFTs yet
              </Typography>
              <Typography
                fontFamily="DM Sans"
                fontSize="17px"
                color="#969696"
                mt={1}
              >
                Send NFTs from another wallet or{"\n"}complete a{" "}
                <Box component="span" color="#00FFAA">
                  Quest
                </Box>
                .
              </Typography>
            </Box>
          ) : (
            <NftDisplay
              onClick={() => {
                setActiveTab("nftDetails");
              }}
              nft={nfts}
            />
          ))}
        {activeTab === "nftDetails" && <NftDetailsDisplay />}

        {activeTab === "assets" &&
          (assets.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center">
              <img src={noAssetsImage} alt="No NFTs" />
              <Typography
                fontFamily="DM Sans"
                fontSize="17px"
                color="#B6B6B6"
                mt={3}
              >
                No Assets yet
              </Typography>
              <Typography
                fontFamily="DM Sans"
                fontSize="17px"
                color="#969696"
                mt={1}
              >
                Send Assets from another wallet or{"\n"}buy{" "}
                <Box component="span" color="#00FFAA">
                  here
                </Box>
                .
              </Typography>
            </Box>
          ) : (
            <>
              <AsssetDisplay asset={assets} />
            </>
          ))}
      </DashboardLayout>
      <Drawer
        anchor="bottom"
        open={isBottomSheetOpen}
        onClose={handleClose}
        sx={{ "& .MuiDrawer-paper": { borderRadius: "16px 16px 0 0" } }}
      >
        <Box p={2}>
          <Typography variant="h6">{sampleData.recipient}</Typography>
          <Box>
            {sampleData.transactions.map((transaction, index) => (
              <Box key={index} sx={{ display: "flex", marginBottom: 1 }}>
                <img
                  src={transaction.imageUrl}
                  alt="transaction"
                  style={{ marginRight: 10, width: 50, height: 50 }}
                />
                <Box>
                  <Typography>{transaction.from}</Typography>
                  <Typography>{transaction.amount}</Typography>
                  <Typography>{transaction.aleo}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Drawer>
      <SwipeableEdgeDrawer open={recieve} toggleDrawer={recievePressed}>
        <Typography
          style={{
            color: "#00FFAA",
            fontSize: "2rem",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Receive
        </Typography>
        <Typography
          style={{
            color: "#979797",
            marginBlock: "1.5rem",
            fontSize: "1.2rem",
          }}
        >
          NFTs and Crypto
        </Typography>
        {assets.map(function (asset, index) {
          return (
            <ReceiveItem
              key={index}
              header={asset.symbol}
              walletAddress={truncateText(address, 10)}
              image={asset.image_ref}
            />
          );
        })}
      </SwipeableEdgeDrawer>
      <SwipeableEdgeDrawer open={open} toggleDrawer={toggleDrawer} />
      <SwipeableEdgeDrawer
        open={openActivityDetails}
        toggleDrawer={toggleActivityDetails}
      >
        <ActivityDetails {...sampleData} />
      </SwipeableEdgeDrawer>
    </>
  );
};

export default Dashboard;
