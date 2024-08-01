import { Box, Button, IconButton, Typography } from "@mui/material";
import DashboardLayout from "../layouts/DashboardLayout";
import AssestCard from "../components/AssestCard";
import DashboardHeader from "../components/DashboardHeader";
import ScanReAuthDialog from "../../../src/components/dialogs/scan_reauth";
import Receive from "../../../src/components/dialogs/receive";
import BackupDialog from "../../../src/components/backup/backup_dialog";
import NetworkDownDialog from "../../../src/components/dialogs/network_down";
import {
  ErrorAlert,
  SuccessAlert,
  WarningAlert,
  InfoAlert,
} from "../../../src/components/snackbars/alerts";
import {
  set_first_visit,
  get_first_visit,
  set_visit_session_flag,
  get_visit_session_flag,
} from "../../../src/services/storage/localStorage";
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
import { getName } from "../services/states/util";
import { getAddress } from "../services/states/util";
import { AirdropNft } from "../components/Nft";

// Services
import { get_nfts } from "../services/nfts/fetch";
import {
  getWhitelists,
  getCollections,
  getPoints,
} from "../services/quests/quests";

// Types
import { type INft, disruptorWhitelist } from "../types/nfts/nft";
import {
  type WhitelistResponse,
  type Collection,
  testCollection,
} from "../types/quests/quest_types";
import { AvailErrorType, type AvailError } from "../types/errors";

// Interfaces
import { type AssetType } from "../types/assets/asset";
import { AvailEvent } from "../services/wallet-connect/WCTypes";
import { handleGetTokens } from "services/tokens/get_tokens";
import { useTranslation } from "react-i18next";
import {
  ScanProgressEvent,
  type TxScanResponse,
} from "..../../../src/types/events";

//Images
import noNftsImage from "../assets/images/no_nfts.png";
import noAssetsImage from "../assets/images/no_balance.png";
import noActivyityImage from "../assets/images/no_activity.png";
import { SuccinctAvailEvent } from "types/avail-events/event";
import { listen } from "@tauri-apps/api/event";
import { useScan } from "../../../src/context/ScanContext";
import { useRecentEvents } from "../../../src/context/EventsContext";
import { Link, useNavigate } from "react-router-dom";
import {
  getBackupFlag,
  getNetwork,
  get_address,
} from "../../../src/services/storage/persistent";
import { scan_blocks } from "../../../src/services/scans/blocks";
import { getAuth } from "../../../src/services/states/utils";

// Scan Imports
import { os } from "../../../src/services/util/open";
import { preInstallInclusionProver } from "../../../src/services/transfer/inclusion";
import { sync_backup } from "../../../src/services/scans/backup";
import { scan_messages } from "../services/scans/encrypted_messages";
import { getNetworkStatus } from "../../../src/services/util/network";
import { updateData } from "../../../src/services/util/migrate_data";
import {
  NetworkStatus,
  switchToObscura,
} from "../../../src/services/util/network";
import {
  delete_util,
  session_and_local_auth,
} from "../../../src/services/authentication/auth";
import ReAuthDialog from "components/dialogs/reauth";

const Dashboard = () => {
  const navigate = useNavigate();
  const goToOther = () => {
    navigate("/secret-recovery");
  };
  const DASHBOARD_ITEMS = [
    { icon: diamondShinyIcon, path: "" },
    { icon: sendIcon, path: "/send" },
    { icon: receiveIcon, path: "" },
    { icon: receiveIcon, path: "" },
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
  const [success, setSuccessAlert] = React.useState(false);
  const [warningAlert, setWarningAlert] = React.useState(false);
  const [infoAlert, setInfoAlert] = React.useState(false);
  const [message, setMessage] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);

  //Scan States
  const [reAuthDialogOpen, setReAuthDialogOpen] = React.useState(false);
  const [networkStatus, setNetworkStatus] = React.useState<NetworkStatus>(
    NetworkStatus.Up
  );
  const [networkDownDialog, setNetworkDownDialog] = React.useState(false);
  /* --ReAuth Dialog-- */
  const [backupDialog, setBackupDialog] = React.useState(false);

  /* --ReAuth Dialog-- */

  /* --Receive Dialog-- */
  const [receiveDialogOpen, setReceiveDialogOpen] = React.useState(false);

  /* --Asset Drawer-- */
  const [assetDrawerOpen, setAssetDrawerOpen] = React.useState(false);
  const [asset, setAsset] = React.useState<AssetType | undefined>();

  const [transferState, setTransferState] = React.useState<boolean>(false);
  const [biometric, setBiometric] = React.useState("false");
  const [network, setNetwork] = React.useState<string>("");
  const [points, setPoints] = React.useState<PointsResponse[]>([]);

  const [open, setOpen] = React.useState<boolean>(false);
  const toggleDrawer = (newOpen: boolean) => (): void => {
    setOpen(newOpen);
  };

  const [activeTab, setActiveTab] = useState("assets");

  const [openActivityDetails, setOpenActivityDetails] = useState(false);
  const toggleActivityDetails = (newOpen: boolean) => (): void => {
    setOpenActivityDetails(newOpen);
  };

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

          if (
            error.error_type.toString() === "Unauthorized" ||
            error.internal_msg === "Session not found"
          ) {
            // eslint-disable-next-line no-warning-comments
            // TODO - Re-authenticate and fix execution on re-auth (Bala)
            setReAuthDialogOpen(true);

            console.log("Unauthorized, re auth");
            console.log(error);
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

  const handleBlockScan = async (res: TxScanResponse) => {
    if (res.txs) {
      handleGetAssets();
      fetchEvents();
    }

    if (!scanInProgress && !transferState) {
      // Set Scanning state to true
      startScan();
      setLocalScan(true);

      // Syncs blocks in different thread
      scan_blocks(res.block_height, setErrorAlert, setMessage)
        .then(async (res) => {
          setSuccessAlert(true);
          setMessage(t("home.messages.success.scan"));
          setScanProgressPercent(0);
          endScan();
          setLocalScan(false);

          if (res) {
            console.log("Res: " + res);
            await handleGetTokens();
            fetchEvents();
          }
        })
        .catch(async (err) => {
          const error = err as AvailError;

          console.log("Error" + error.internal_msg);
          endScan();
          setMessage(t("home.messages.errors.blocks-scan"));
          setErrorAlert(true);
        });

      // Set Scanning state to false
    } else {
      console.log(
        `Scan in progress: ${scanInProgress} Transfer state: ${transferState}`
      );
    }
  };

  console.log("handle");
  const handleScan = () => {
    setReAuthDialogOpen(true);
    console.log("authDialog");
    scan_messages()
      .then(async (res) => {
        console.log(res);
        getNetworkStatus()
          .then(async (status) => {
            console.log(status)
            setNetworkStatus(status);
            if (status === NetworkStatus.Down) {
              setNetworkDownDialog(true);
            }

            console.log("Network status: " + status);
          })
          .catch(() => {
            setMessage("Issue checking network status.");
            setErrorAlert(true);
          });
        await handleBlockScan(res);
      })
      .catch(async (err) => {
        const error = err as AvailError;
        console.log(err);
        console.log(error.error_type);

        if (error.error_type === AvailErrorType.Network) {
          setMessage(t("home.messages.errors.network"));
          setErrorAlert(true);
          console.log("network ish");
        } else if (
          error.error_type.toString() === "Validation" ||
          "Unauthorized"
        ) {
          // eslint-disable-next-line no-warning-comments
          // TODO - Re-authenticate and fix execution on re-auth (Bala)

          // session_and_local_auth(password, navigate, setErrorAlert, setMessage, false).then(async () => {
          //   setMessage('Successfully authenticated.');
          //   setSuccess(true);
          //   // Wait for 0.8 seconds and fire onRequestClose
          //   await new Promise(r => setTimeout(r, 800));
          //   onRequestClose();

          //   if (onAuthSuccess !== undefined) {
          //     await onAuthSuccess();
          //   }
          // }).catch(async e => {
          //   console.log(e);
          //   const error = e as AvailError;
          //   setMessage('Failed to authenticate, please try again.');
          //   setErrorAlert(true);
          //   onRequestClose();
          // });
          
          setReAuthDialogOpen(true);
          console.log("now authorized");
          // console.log("Unauthorized, re auth");
        } else {
          console.log(error.internal_msg);
          setMessage(error.internal_msg);
          setErrorAlert(true);
        }
      });
  };

  //HandleTransferCheck

  React.useEffect(() => {
    if (shouldRunEffect.current) {
      handleTransferCheck();
      const firstVisitSession = get_visit_session_flag();

      if (!firstVisitSession) {
        switchToObscura().catch(() => {
          setMessage("Issue switching to Obscura.");
          setErrorAlert(true);
        });

        getBackupFlag()
          .then(async (res) => {
            if (res) {
              await sync_backup();
            }
          })
          .catch((error) => {
            console.log(error);
          });

        // Info notify user that inclusion.prover is being installed
        preInstallInclusionProver().catch(() => {
          setMessage("Issue checking Aleo resources.");
          setErrorAlert(true);
        });

        set_visit_session_flag();
      }

      const firstVisitPersistent = get_first_visit();
      console.log("First visit persistent: " + firstVisitPersistent);

      if (!firstVisitPersistent) {
        set_first_visit();
        setBackupDialog(true);
      }

      const transferState = sessionStorage.getItem("transferState");
      if (transferState === "true") {
        setTransferState(true);
      }

      setLoading(true);
      getAuth(setBiometric).catch((error) => {
        console.log(error);
      });

      getName(setUsername).catch((error) => {
        console.log(error);
      });

      getAddress(setAddress).catch((error) => {
        console.log(error);
      });

      getNetwork()
        .then((res) => {
          setNetwork(res);
        })
        .catch((error) => {
          console.log(error);
        });

      getPoints()
        .then((res) => {
          console.log(res);
          setPoints(res);
        })
        .catch((error) => {
          console.log(error);
        });

      handleGetAssets();
      fetchEvents();

      setLoading(false);

      handleScan();

      shouldRunEffect.current = false;
    }
  }, [scanInProgress, startScan, endScan]);

  const handleTransferCheck = () => {
    const wcFlag = sessionStorage.getItem("transfer_on");
    const transferState = sessionStorage.getItem("transferState");

    if (wcFlag === "true" || transferState === "true") {
      setTransferState(true);
    } else {
      setTransferState(false);
    }
  };
  const handleAssetDrawerOpen = (asset: AssetType) => {
    setAsset(asset);
    setAssetDrawerOpen(true);
  };

  const handleAssetDrawerClose = () => {
    setAssetDrawerOpen(false);
  };

  // Event Drawer services

  const handleEventDrawerOpen = (event: SuccinctAvailEvent) => {
    setEvent(event);
    setEventDrawerOpen(true);
  };

  const handleEventDrawerClose = () => {
    setEventDrawerOpen(false);
  };

  return (
    <>
      {/* <ScanReAuthDialog
        isOpen={open}
        onRequestClose={() => {
          setOpen(false);
        }}
      />
      <SuccessAlert
        successAlert={success}
        setSuccessAlert={setSuccessAlert}
        message={message}
      />
      <ErrorAlert
        errorAlert={errorAlert}
        setErrorAlert={setErrorAlert}
        message={message}
      />
       */}
      {/* <ReAuthDialog /> */}
      <ErrorAlert
        errorAlert={errorAlert}
        setErrorAlert={setErrorAlert}
        message={message}
      />
      <SuccessAlert
        successAlert={success}
        setSuccessAlert={setSuccessAlert}
        message={message}
      />
      <WarningAlert
        warningAlert={warningAlert}
        setWarningAlert={setWarningAlert}
        message={message}
      />
      <InfoAlert
        infoAlert={infoAlert}
        setInfoAlert={setInfoAlert}
        message={message}
      />

      {/* Backup Dialog */}
      <BackupDialog
        open={backupDialog}
        onClose={() => {
          setBackupDialog(false);
        }}
      />

      {/* Receive Dialog */}
      <Receive
        open={receiveDialogOpen}
        handleClose={() => {
          setReceiveDialogOpen(false);
        }}
        address={address}
        username={username}
      />

      {/* ReAuth Dialog */}
      <ScanReAuthDialog
        isOpen={reAuthDialogOpen}
        onRequestClose={() => {
          setReAuthDialogOpen(false);
        }}
      />

      {/* Network Down Dialog */}
      <NetworkDownDialog
        isOpen={networkDownDialog}
        onRequestClose={() => {
          setNetworkDownDialog(false);
        }}
        status={networkStatus}
      />

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
        {/* <Typography color="#01FFAA">+450.6%</Typography> */}
        <Box
          display="flex"
          alignItems="center"
          my={3}
          justifyContent="space-between"
          width="90%"
          mx="auto"
        >
          {DASHBOARD_ITEMS.map(({ icon, path }, i) => (
            <Box
              borderRadius="9px"
              p={1}
              height="63px"
              width="62px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              bgcolor="#2A2A2A"
              key={i}
            >
              <img src={icon} />
            </Box>
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
              handleScan();
              // setReAuthDialogOpen(true);
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
