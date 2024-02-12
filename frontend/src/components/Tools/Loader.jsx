import React from "react";
import { Box } from "@mui/material";

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