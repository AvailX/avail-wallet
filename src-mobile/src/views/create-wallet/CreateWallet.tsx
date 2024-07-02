import { Box, Button, Typography } from "@mui/material";

import connectWallet from "../../assets/connect-wallet.png";
import ownNft from "../../assets/own-nft.png";
import ownPrivately from "../../assets/crypto-privately.png";
import powerApps from "../../assets/power-apps.png";

import AwesomeSlider from "react-awesome-slider";
import "react-awesome-slider/dist/styles.css";
import withAutoplay from "react-awesome-slider/dist/autoplay";

import * as React from "react";
import { useNavigate } from "react-router-dom";
import NewAccountDialog from "components/dialogs/NewAccount";

const AutoplaySlider = withAutoplay(AwesomeSlider, { Infinity: false });

interface IProps {
  title: string;
  img: string;
}

const Mob: React.FC<IProps> = ({ title, img }) => {
  return (
    <Box
      height='100vh'
      position='relative'
      sx={{ backgroundImage: `url(${img})`, backgroundSize: "cover" }}
    >
      <Typography
        mx='auto'
        width='90%'
        color='#fff'
        textAlign='center'
        fontSize='30px'
        fontWeight={500}
        lineHeight='31.8px'
        pt='50vh'
      >
        {title}
      </Typography>
    </Box>
  );
};

export const MobCarousel = () => {
  const navigate = useNavigate();

  const carouselData = [
    { title: "Connect to the Aleo Blockchain", img: connectWallet },
    {
      title: "Own NFTs in private for the first time",
      img: ownNft,
    },
    {
      title: "Own any crypto privately, finally",
      img: ownPrivately,
    },
    {
      title: "Power yourself with crypto apps built on Aleo",
      img: powerApps,
    },
  ];
  const [openDialog, setOpenDialog] = React.useState(false);
  return (
    <>
      <NewAccountDialog
        isOpen={openDialog}
        onRequestClose={() => {
          setOpenDialog(false);
        }}
      />
      <div style={{ height: "100vh", backgroundColor: "#111111" }}>
        <AutoplaySlider
          play={true}
          bullets={false}
          style={{ height: "100vh" }}
          infinite={false}
          mobileTouch={true}
          interval={4000}
          fillParent={true}
        >
          {carouselData.map((item) => (
            <div key={item.title} style={{ height: "100vh" }}>
              <Mob {...item} />
            </div>
          ))}
        </AutoplaySlider>
        <Box
          width='100%'
          position='absolute'
          p={2}
          left={0}
          bottom={0}
          zIndex={10}
        >
          <Button
            fullWidth
            onClick={(): void => {
              setOpenDialog(true);
              //;
            }}
            sx={{
              background:
                "linear-gradient(89.89deg, #3E3E3E -27.59%, rgba(62, 62, 62, 0) 42.72%), #00FFAA",
              py: 2,
            }}
            variant='contained'
            type='submit'
          >
            Create Wallet
          </Button>
          <Button
            onClick={() => {
              navigate("/login");
            }}
            sx={{ mt: 3 }}
            fullWidth
            variant='outlined'
          >
            Add an existing wallet
          </Button>
          <Typography variant='body1' mt={4} color='#9d9d9d' fontWeight={700}>
            By signing up you agree to Avail’s{" "}
            <span style={{ color: "#01f0a0" }}>
              Terms of Service and Privacy policy.
            </span>
          </Typography>
        </Box>
      </div>
    </>
  );
};

export default Mob;
