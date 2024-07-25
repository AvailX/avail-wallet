import { Box, Card, CardContent, CardMedia, Typography } from "@mui/material";
import React from "react";

type NftProperties = {
  name: string;
  image: string;
  onClick: () => void;
};

type Collection = {
  whitelist_img: string;
  name: string;
};

type AirdropNftProperties = {
  collection: Collection;
  setCollection: (collection: Collection) => void;
};

const Nft: React.FC<NftProperties> = ({ name, image, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "22px",
      backgroundColor: "#1f1f1f",
      //   padding: 2,
      marginTop: 2,
    }}
  >
    <Box sx={{ borderRadius: "22px", overflow: "hidden" }}>
      <img
        src={image}
        style={{
          width: 200,
          height: 200,
          //marginTop: 20
        }}
        draggable={false}
      />
    </Box>
    <Typography sx={{ color: "#fff", p: 2 }}>{name}</Typography>
  </Box>
);

export default Nft;

export const AirdropNft: React.FC<AirdropNftProperties> = ({
  collection,
  setCollection,
}) => (
  <Card
    sx={{
      bgcolor: "#2A2A2A",
      transition:
        "transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out, bgcolor 1s ease-in-out",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
      },
      width: "80%",
      borderRadius: "15px",
      mt: 2,
    }}
    onClick={() => {
      setCollection(collection);
    }}
  >
    <CardMedia image={collection.whitelist_img} />
    <img src={collection.whitelist_img} style={{ width: "100%" }} />
    <CardContent
      sx={{
        display: "flex",
        textAlign: "flex-start",
        flexDirection: "column",
        height: "45px",
        mt: "-5%",
      }}
    >
      <Typography sx={{ color: "#FFF", fontSize: "1.35rem", fontWeight: 500 }}>
        {collection.name}
      </Typography>
      <Typography sx={{ color: "#7B7B7B", fontSize: "1.1rem" }}>
        Airdrop
      </Typography>
    </CardContent>
  </Card>
);
