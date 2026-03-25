import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/material';

export default function ProductSkeleton() {
    return (
        <Box
            sx={{
                bgcolor: '#fff',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #f0f0f0',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
        >
            {/* Image Placeholder */}
            <Box sx={{ position: 'relative', pt: '120%', bgcolor: '#f5f5f5' }}>
                <Skeleton 
                    variant="rectangular" 
                    sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
                />
            </Box>

            {/* Content Placeholder */}
            <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Brand/Category */}
                <Skeleton variant="text" sx={{ fontSize: '10px', width: '30%', mb: 0.5 }} />
                
                {/* Product Name */}
                <Skeleton variant="text" sx={{ fontSize: '14px', width: '80%', mb: 1 }} />

                {/* Rating */}
                <Skeleton variant="text" sx={{ fontSize: '12px', width: '40%', mb: 1 }} />

                {/* Price and Action Row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Skeleton variant="text" sx={{ fontSize: '16px', width: '25%' }} />
                    <Skeleton variant="circular" width={32} height={32} />
                </Box>
            </Box>
        </Box>
    );
}