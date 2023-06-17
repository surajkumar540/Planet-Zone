import { Box } from "@mui/material";
import React from "react";
import "../index.css"
const Loader = () => {
    return (
        <>
            <Box className="cs-loader">
                <Box className="cs-loader-inner">
                    <label>●</label>
                    <label>●</label>
                    <label>●</label>
                    <label>●</label>
                    <label>●</label>
                    <label>●</label>
                </Box>
            </Box>
        </>
    )
}

export default Loader;