import * as React from 'react';
import { Box, Typography } from '@mui/material';
import img from '../../assets/connected-dapp.svg';
// import { type Dapp } from '../../types/dapps/types';
import { Dapp } from "src/assets/dapps/dapps";

import { useNavigate } from 'react-router-dom';
import { PropTypes } from '@mui/material';

type HorizontalScrollContainerProps = {
	dapp: Dapp; // Define a prop 'dapp' of type 'Dapp'
};

const HorizontalScrollContainer: React.FC<HorizontalScrollContainerProps> = ({
    dapp,
}) => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/browser', { state: dapp.url });
    };

    return (
        <Box
            sx={{
                position: "relative", // Set position to relative
                width: "340px",
                height: "165px",
                overflowX: "auto", // Enable horizontal scrolling
                background:
                    "linear-gradient(to right, #0038FF 0%,  #000000 50%, #0038FF 100%)",
                padding: "10px",
                borderRadius: "22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end", // Align content to the bottom
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <Box
                    sx={{
                        justifyContent: "center",
                        alignItems: "center",
                        width: "33px",
                        height: "33px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        backgroundColor: "#000000",
                        marginRight: "7px",
                    }}
                >
                    <img
                        src={img}
                        alt="Connected Dapp"
                        style={{ width: "100%", height: "auto" }}
                    />
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                    }}
                >
                    <Typography
                        variant="body1"
                        sx={{ fontSize: "17px", fontWeight: "normal" }}
                    >
                        {dapp.name} {/* Use the 'name' property of the 'dapp' prop */}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ fontSize: "10px", fontWeight: "normal" }}
                    >
                        {dapp.description} {/* Use the 'description' property of the 'dapp' prop */}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default HorizontalScrollContainer;
