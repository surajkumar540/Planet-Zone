import * as React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/material';

export default function ProductSkeleton() {
    return (
        <Stack spacing={1} width={"16rem"} height={"22rem"} display={"flex"} flexDirection={"column"}>

            <Skeleton variant="rectangular" sx={{ flex: "0.68" }} />
            <Skeleton variant="text" sx={{ fontSize: '1rem', width: "20%", ml: "2rem" }} />
            <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
            <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"}>

                <Skeleton variant="text" sx={{ fontSize: '1rem', width: "40%" }} />
                <Skeleton variant="circular" width={40} height={40} />
            </Box>
        </Stack>
    );
}