import React from 'react';
import { Box, Typography, Container } from "@mui/material";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CampaignIcon from '@mui/icons-material/Campaign';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import SavingsIcon from '@mui/icons-material/Savings';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

// Configuration for features
const featuresData = [
    { icon: <LocalShippingIcon />, title: "Free Shipping", color: "#8771E8", bgColor: "#EDE7F6" },
    { icon: <CampaignIcon />, title: "Promotions", color: "#D268CA", bgColor: "#FCE4EC" },
    { icon: <ShoppingCartIcon />, title: "Online Order", color: "#2196F3", bgColor: "#E3F2FD" },
    { icon: <CardGiftcardIcon />, title: "Happy Sale", color: "#FCBD5E", bgColor: "#FFF8E1" },
    { icon: <SavingsIcon />, title: "Save Money", color: "#FFC201", bgColor: "#FFFDE7" },
    { icon: <SupportAgentIcon />, title: "24/7 Support", color: "#9BABB8", bgColor: "#ECEFF1" },
];

const Features = () => {
    return (
        <Box sx={{ py: 8, bgcolor: '#F5F5F5' }}>
            <Container maxWidth="lg">
                <Typography 
                    variant="h4" 
                    textAlign="center" 
                    sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, mb: 6, color: '#1A1A1A' }}
                >
                    Why Choose Us
                </Typography>
                
                <Box 
                    display='grid' 
                    gridTemplateColumns={{ xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }} 
                    gap={3}
                >
                    {featuresData.map((feature, index) => (
                        <Box 
                            key={index}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                p: 2,
                                borderRadius: '16px',
                                bgcolor: '#fff',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
                                }
                            }}
                        >
                            {/* Icon Container */}
                            <Box 
                                sx={{ 
                                    width: 60, 
                                    height: 60, 
                                    borderRadius: '50%', 
                                    bgcolor: feature.bgColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2,
                                    color: feature.color
                                }}
                            >
                                {React.cloneElement(feature.icon, { sx: { fontSize: '28px' } })}
                            </Box>
                            
                            {/* Title */}
                            <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                    fontWeight: 600, 
                                    color: '#333',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {feature.title}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Container>
        </Box>
    )
}

export default Features;