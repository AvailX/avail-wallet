import * as React from 'react';
import * as mui from '@mui/material';

import { useNavigate } from 'react-router-dom';
import { ArrowBackIos } from '@mui/icons-material';
import AvailTextField from '../../components/texfields/AvailTextField';

function Username() {
    const navigate = useNavigate();
    return (
        <mui.Grid
            container
            justifyContent="center"
            alignItems="center"
            height="100vh"
            sx={{
                backgroundSize: "cover",
                backgroundColor: "#000000",
            }}
        >
            {/* Arrow back icon */}
            <mui.IconButton
                onClick={() => navigate(-1)}
                sx={{
                    position: "absolute",
                    top: "50px",
                    left: "10px",
                    color: "lightgray",
                    zIndex: "1000",
                    pl: 2,
                    width: "40px", // Adjust width and height to set the size of the circular container
                    height: "40px",
                    borderRadius: "50%", // Setting borderRadius to 50% makes the container a circle
                    backgroundColor: "gray", // You can adjust the background color as needed
                    display: "flex", // Use flexbox to center the icon horizontally and vertically
                    justifyContent: "center", // Center horizontally
                    alignItems: "center", // Center vertically
                }}
            >
                <ArrowBackIos />
            </mui.IconButton>

            {/* The Text in a Column */}
            <mui.Grid item xs={12} textAlign="center" mt={0}>
                <mui.Typography fontWeight="bold" fontSize={25} sx={{ color: "#fff" }}>
                    Select your<span style={{ color: "#01f0a0" }}> username</span>
                </mui.Typography>
                {/* The smaller Text */}
                <mui.Typography
                    variant="body1"
                    sx={{ color: "#9d9d9d", textAlign: "center" }}
                >
                    Make it dank.
                </mui.Typography>
            </mui.Grid>

            {/* The Text Field and eye outline icon */}
            <mui.Grid item xs={12} textAlign="center" mt={-20}>
                <AvailTextField isPassword={false} />
            </mui.Grid>

            {/* The Next button */}
            <mui.Grid item xs={12} textAlign="center" mt={10}>
                <mui.Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/password")}
                    sx={{
                        fontSize: "20px",
                        padding: "10px 160px",
                        background:
                            "linear-gradient(89.89deg, #3E3E3E -27.59%, rgba(62, 62, 62, 0) 42.72%), #00FFAA",
                    }}
                >
                    Own it
                </mui.Button>
                <mui.Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/password")}
                    sx={{
                        mt: "20px",
                        fontSize: "20px",
                        padding: "5px 142px",
                        backgroundColor: "gray",
                    }}
                >
                    <mui.Typography
                        sx={{ color: "#FFFFFF", textAlign: "center", fontWeight: "bold" }}
                    >
                        Maybe Later
                    </mui.Typography>
                </mui.Button>
            </mui.Grid>
        </mui.Grid>
    )
}

export default Username;