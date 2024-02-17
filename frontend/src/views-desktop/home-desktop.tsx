import * as React from "react";
import * as mui from "@mui/material";

import Layout from "./reusable/layout";
import { useNavigate } from "react-router-dom";

import { listen } from "@tauri-apps/api/event";


//services
import { getNetwork, getBackupFlag } from "../services/storage/persistent";
import { scan_messages } from "../services/scans/encrypted_messages";
import { scan_blocks } from "../services/scans/blocks";
import { sync_backup } from "../services/scans/backup";
import { pre_install_inclusion_prover } from "../services/transfer/inclusion";

import { set_first_visit, get_first_visit, set_visit_session_flag, get_visit_session_flag } from "../services/storage/localStorage";

import { handleGetTokens } from "../services/tokens/get_tokens";

//componenets
import Balance from "../components/balance";
import SideMenu from "../components/sidebar";
import ProfileBar from "../components/account/profile-header";
import TransferCTAButton from "../components/buttons/transfer_cta";
import AvailEventComponent from "../components/events/event";
import AssetDrawer from "../components/assets/asset_drawer";
import EventDrawer from "../components/events/event_drawer";
import Receive from "../components/dialogs/receive";
import ScanReAuthDialog from "../components/dialogs/scan_reauth";
import BackupDialog from "../components/backup/backup_dialog";
import RiseLoader from "react-spinners/RiseLoader";

//state functions
import { getName } from "../services/states/utils";
import { getAuth } from "../services/states/utils";
import { getTotalBalance, getTokenBalance } from "../services/states/utils";
import { getAddress } from "../services/states/utils";


//interfaces
import { AssetType } from "../types/assets/asset";
import { AvailEvent } from "../services/wallet-connect/WCTypes";
import Asset from "../components/assets/asset";
import { ScanProgressEvent, TxScanResponse } from "../types/events";
import { AvailError, AvailErrorType } from "../types/errors";
import { SuccinctAvailEvent } from "../types/avail-events/event";

//context hooks
import { useScan } from "../context/ScanContext";
import { useWalletConnectManager } from "../context/WalletConnect";
import { useRecentEvents } from "../context/EventsContext";

//typography
import { SmallText, SmallText400, SubtitleText } from "../components/typography/typography";

//alerts
import { ErrorAlert, SuccessAlert, WarningAlert, InfoAlert } from "../components/snackbars/alerts";

import { useTranslation } from "react-i18next";

function Home() {

    // alert states
    const [errorAlert, setErrorAlert] = React.useState(false);
    const [successAlert, setSuccessAlert] = React.useState(false);
    const [warningAlert, setWarningAlert] = React.useState(false);
    const [infoAlert, setInfoAlert] = React.useState(false);
    const [message, setMessage] = React.useState<string>("");

    // NOTE - Will only be used in case we enable mac biometrics
    const [biometric, setBiometric] = React.useState("false");
    const [loading, setLoading] = React.useState(false);

    const [username, setUsername] = React.useState<string>("");
    const [address, setAddress] = React.useState<string>("");
    const [network, setNetwork] = React.useState<string>("");

    {/* --ReAuth Dialog-- */ }
    const [backupDialog, setBackupDialog] = React.useState(false);

    {/* --ReAuth Dialog-- */ }
    const [reAuthDialogOpen, setReAuthDialogOpen] = React.useState(false);
    const [retryFunction, setRetryFunction] = React.useState<Promise<void>>(async () => { });

    {/* --Receive Dialog-- */ }
    const [receiveDialogOpen, setReceiveDialogOpen] = React.useState(false);

    {/* --Asset Drawer-- */ }
    const [assetDrawerOpen, setAssetDrawerOpen] = React.useState(false);
    const [asset, setAsset] = React.useState<AssetType | undefined>();

    {/* --Event Drawer-- */ }
    const [eventDrawerOpen, setEventDrawerOpen] = React.useState(false);
    const [event, setEvent] = React.useState<SuccinctAvailEvent | undefined>();

    {/* --Wallet Connect Url-- */ }
    const [uri, setUri] = React.useState<string>("");

    {/* --Block Scan State-- */ }
    const { scanInProgress, startScan, endScan } = useScan();
    const [scanProgressPercent, setScanProgressPercent] = React.useState<number>(0);

    {/* -- Recent Events State -- */ }
    const { events, fetchEvents, updateEventList } = useRecentEvents();

    {/* --Events || Balance || Assets-- */ }
    const [balance, setBalance] = React.useState<number>(0);
    const [assets, setAssets] = React.useState<AssetType[]>([]);

    const [transferState, setTransferState] = React.useState<boolean>(false);

    const { t } = useTranslation();
    const shouldRunEffect = React.useRef(true);

    const handleGetAssets = () => {

        handleGetTokens().then((response) => {
            console.log(response);
            console.log("firing");
            setAssets(response.assets);
            setBalance(response.balance_sum);
        })
            .catch((err) => {
                console.log(err)
                setMessage(t("home.messages.errors.balance"));
                setErrorAlert(true);
            });

    }

    /* --Event Listners */
    React.useEffect(() => {

        const unlisten_scan = listen('scan_progress', (event) => {
            console.log(scanInProgress);
            console.log(event);
            console.log(event.payload);
            setScanProgressPercent(event.payload as number);
        })

        const unlisten_tx = listen('tx_state_change', (event) => {
            console.log(event);

            fetchEvents();
            handleGetAssets();

        })

        /*
        const unlisten_reauth = listen('success_scan_reauth', (event) => {
    
            scan_messages().then(async (res) => {
                await handleBlockScan(res);

            }).catch((e) => {
                let error = JSON.parse(e) as AvailError;
                console.log(error.error_type);
                if (error.error_type === AvailErrorType.Network) {
                    setMessage(t("home.messages.errors.network"));
                    setErrorAlert(true);
                } else if (error.error_type.toString() === "Unauthorized") {
                    //TODO - Re-authenticate
                    console.log("Unauthorized, re auth");

                    setReAuthDialogOpen(true);
                } else {
                    console.log(error.internal_msg);
                    setMessage(error.internal_msg);
                    setErrorAlert(true);
                }
            });
            
        })
        */

        const unlisten_transfer = listen('transfer_off', async(event) => {
            setTransferState(false);
        })

        return () => {
            unlisten_scan.then(remove => remove());
            unlisten_tx.then(remove => remove());
           // unlisten_reauth.then(remove => remove());
            unlisten_transfer.then(remove => remove());
        }

    }, [])

    const handleBlockScan = async (res: TxScanResponse) => {
        if (res.txs) {
            handleGetAssets();
            fetchEvents();
        }

        if (!scanInProgress) {
            //set Scanning state to true
            startScan();

            //syncs blocks in different thread
            scan_blocks(res.block_height, setErrorAlert, setMessage).then((res) => {
                setSuccessAlert(true);
                setMessage(t("home.messages.success.scan"));
                endScan();

                if (res) {
                    console.log("Res: " + res);
                    handleGetTokens();
                    fetchEvents();
                }

            }).catch((e) => {
                let error = JSON.parse(e) as AvailError;
                console.log("Error" + error.internal_msg);
                endScan();
                setMessage(t("home.messages.errors.blocks-scan"));
                setErrorAlert(true);
            });;

            //set Scanning state to false


        } else {
            console.log("wrong response: " + res);
        }
    }

    React.useEffect(() => {
        if (shouldRunEffect.current) {
            let first_visit_session = get_visit_session_flag();
            console.log("First visit session: " + first_visit_session);

            if (!first_visit_session) {
                getBackupFlag().then(async (res) => {
                    if (res) {
                        await sync_backup();
                    }
                }).catch((err) => console.log(err));
                set_visit_session_flag();
            }

            let first_visit_persistent = get_first_visit();
            console.log("First visit persistent: " + first_visit_persistent);
            
            if (!first_visit_persistent) {
                set_first_visit();
                setBackupDialog(true);

                // info notify user that inclusion.prover is being installed
                pre_install_inclusion_prover();
                setMessage("Pre installing Aleo SRS...");
            }

            let transferState =sessionStorage.getItem('transferState'); 
            if (transferState === 'true'){
                setTransferState(true);
            }

            setLoading(true);
            getAuth(setBiometric)
                .catch((err) => console.log(err));

            getName(setUsername)
                .catch((err) => console.log(err));

            getAddress(setAddress)
                .catch((err) => console.log(err));

            getNetwork().then((res) => {
                setNetwork(res);
            }).catch((err) => console.log(err));

            handleGetAssets();
            fetchEvents();

            setLoading(false);


            //to get the initial balance and transactions
            scan_messages().then(async (res) => {
                await handleBlockScan(res);

            }).catch((e) => {
                let error = JSON.parse(e) as AvailError;
                console.log(error.error_type);
                if (error.error_type === AvailErrorType.Network) {
                    setMessage(t("home.messages.errors.network"));
                    setErrorAlert(true);
                } else if (error.error_type.toString() === "Unauthorized") {
                    //TODO - Re-authenticate
                    console.log("Unauthorized, re auth");

                    setReAuthDialogOpen(true);
                } else {
                    console.log(error.internal_msg);
                    setMessage(error.internal_msg);
                    setErrorAlert(true);
                }
            });

            shouldRunEffect.current = false;
        }
    }, [scanInProgress, startScan, endScan])


    const navigate = useNavigate();

    // Asset Drawer services
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
        <Layout>
            {/* Alerts */}
            <ErrorAlert errorAlert={errorAlert} setErrorAlert={setErrorAlert} message={message} />
            <SuccessAlert successAlert={successAlert} setSuccessAlert={setSuccessAlert} message={message} />
            <WarningAlert warningAlert={warningAlert} setWarningAlert={setWarningAlert} message={message} />
            <InfoAlert infoAlert={infoAlert} setInfoAlert={setInfoAlert} message={message} />

            {/* Backup Dialog */}
            <BackupDialog open={backupDialog} onClose={() => setBackupDialog(false)} />

            {/* Receive Dialog */}
            <Receive open={receiveDialogOpen} handleClose={() => setReceiveDialogOpen(false)} address={address} username={username} />

            {/* ReAuth Dialog */}
            <ScanReAuthDialog isOpen={reAuthDialogOpen}  onRequestClose={() => setReAuthDialogOpen(false)} />

            <SideMenu />
            {loading &&
                <mui.Box sx={{ display: 'flex', alignItems: 'center', alignContent: 'center', height: '100vh', justifyContent: 'center' }}>
                    <RiseLoader color="#00FFAA" loading={loading} size={300} aria-label="Home Loader" />
                </mui.Box>
            }
            {!loading &&
                <mui.Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "90%",
                    marginLeft: '10%',
                    mb: '3%'
                }}>
                    {scanInProgress &&
                        <mui.Box sx={{ width: '100%', bgcolor: '#00FFAA', height: '30px' }}>
                            <SmallText400 sx={{ color: '#111111' }}> {t("home.scan.progress")} {scanProgressPercent.toString()}%{t("home.scan.complete")}</SmallText400>
                        </mui.Box>
                    }
                    {scanInProgress &&
                        <mui.LinearProgress variant="determinate" value={scanProgressPercent} />
                    }
                    {/* Avail logo and Profile bar */}
                    <mui.Box sx={{ display: 'flex', flexDirection: "row", justifyContent: "flex-end", mt: '2%', mr: '5%', alignItems: "center" }}>
                        <mui.Chip label={network} variant="outlined" sx={{ mr: '2%', color: '#a3a3a3' }} />
                        <ProfileBar address={address} name={username}></ProfileBar>
                    </mui.Box>

                    {/* Balance section */}
                    <mui.Box sx={{ background: 'linear-gradient(90deg, #1E1D1D 0%, #111111 100%)', display: 'flex', flexDirection: 'column', p: 2, borderRadius: '30px', width: '65%' }}>
                        <SubtitleText sx={{ color: '#a3a3a3' }}>
                            {t("home.balance")}
                        </SubtitleText>

                        <Balance props={{ balance }} />

                        <mui.Box sx={{ display: 'flex', flexDirection: "row", alignItems: "center", mt: '2%' }}>
                            <TransferCTAButton text={t("home.send")} onClick={() => navigate('/send')} />
                            <mui.Box sx={{ width: '4%' }} />
                            <TransferCTAButton text={t("home.receive")} onClick={() => setReceiveDialogOpen(true)} />
                        </mui.Box>

                    </mui.Box>

                    <SubtitleText sx={{ color: '#FFF', mt: '2%', cursor: 'pointer', width: '10%' }}>
                        {t("home.tokens.title")}
                    </SubtitleText>
                    {assets.map((asset) => {
                        return (
                            <Asset image_ref={asset.image_ref} symbol={asset.symbol} total={asset.total} balance={asset.balance} value={asset.value} onClick={() => handleAssetDrawerOpen(asset)} key={asset.symbol} />
                        )

                    })}
                    {assets.length === 0 &&

                        <mui.Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignContent: 'center', justifyContent: 'center', mt: '1%', textAlign: 'center' }}>
                            <SubtitleText sx={{ color: '#a3a3a3', mt: '2%', width: '23%' }}>
                                {t("home.tokens.empty.part1")}
                            </SubtitleText>
                            <SmallText sx={{ color: '#a3a3a3', mt: '2%', width: '23%' }}>
                                {t("home.tokens.empty.part2")}
                            </SmallText>
                        </mui.Box>
                    }
                    <AssetDrawer open={assetDrawerOpen} onClose={handleAssetDrawerClose} asset={asset} address={address} username={username} />
                    <mui.Box sx={{ width: '40%', display: 'flex', justifyContent: 'center', mt: '1%' }}>
                    </mui.Box>

                    <SubtitleText sx={{ color: '#FFF', mt: '2%', cursor: 'pointer', width: '23%' }}>
                        {t("home.activity.title")}
                    </SubtitleText>
                    {events.map((event) => {
                        return (
                            <AvailEventComponent event={event} slideFunction={() => handleEventDrawerOpen(event)} fromAsset={false} key={event.id} />
                        )
                    })}
                    {events.length === 0 &&
                        <mui.Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignContent: 'center', justifyContent: 'center', mt: '1%', textAlign: 'center' }}>
                            <SubtitleText sx={{ color: '#a3a3a3', mt: '2%', width: '23%' }}>
                                {t("home.activity.empty.part1")}
                            </SubtitleText>
                            <SmallText sx={{ color: '#a3a3a3', mt: '2%', width: '23%' }}>
                                {t("home.activity.empty.part2")}
                            </SmallText>
                        </mui.Box>
                    }
                    <EventDrawer open={eventDrawerOpen} onClose={handleEventDrawerClose} event={event} />
                </mui.Box>
            }
        </Layout>
    )
}

export default Home;

{/* WalletConnect Tester */ }
{/* 
            <mui.Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignContent: 'center', justifyContent: 'center' }}>
                <mui.TextField
                    value={uri}
                    onChange={(e) => setUri(e.target.value)}
                    label="WalletConnect URI"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: '2%', width: '30%' }}
                />
                <mui.Button
                    variant="contained"
                    color="primary"
                    sx={{ width: '30%' }}
                    onClick={() => manager.pair(uri)}
                >
                    Pair
                </mui.Button>
            </mui.Box>
            */}
