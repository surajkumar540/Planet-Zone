
import React from 'react'
import { Box, Typography, Container } from '@mui/material'
import Features from "../components/Tools/Features"
import Banner from '../components/Tools/Banner';
import Footer from '../components/Footer/Footer';

const AboutUs = () => {
    return (
        <>
            <Banner title='About Us' text='Dedicated to purity, sustainability, and your well-being.' />
            
            <Container maxWidth="lg" sx={{ py: 8 }}>
                {/* Section 1: Who We Are */}
                <Box 
                    display='flex' 
                    flexDirection={{ xs: 'column', md: 'row' }} 
                    alignItems='center' 
                    gap={6}
                    mb={10}
                >
                    {/* Left: Abstract Art Composition */}
                    <Box 
                        flex={1} 
                        sx={{ 
                            position: 'relative', 
                            height: { xs: '300px', md: '450px' },
                            width: '100%'
                        }}
                    >
                        {/* Background large circle */}
                        <Box sx={{ 
                            position: 'absolute', 
                            top: '10%', 
                            left: '10%', 
                            width: '80%', 
                            height: '80%', 
                            borderRadius: '50%', 
                            background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                            zIndex: 0
                        }} />
                        
                        {/* Overlapping card shape */}
                        <Box sx={{ 
                            position: 'absolute', 
                            top: '20%', 
                            right: '5%', 
                            width: '250px', 
                            height: '300px', 
                            borderRadius: '20px', 
                            bgcolor: '#fff',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                            zIndex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#3CB815', opacity: 0.2 }} />
            <Banner title='About Us' text='Dedicated to purity, sustainability, and your well-being.' />
            
            <Container maxWidth="lg" sx={{ py: 8 }}>
                {/* Section 1: Who We Are */}
                <Box 
                    display='flex' 
                    flexDirection={{ xs: 'column', md: 'row' }} 
                    alignItems='center' 
                    gap={6}
                    mb={10}
                >
                    {/* Left: Abstract Art Composition */}
                    <Box 
                        flex={1} 
                        sx={{ 
                            position: 'relative', 
                            height: { xs: '300px', md: '450px' },
                            width: '100%'
                        }}
                    >
                        {/* Background large circle */}
                        <Box sx={{ 
                            position: 'absolute', 
                            top: '10%', 
                            left: '10%', 
                            width: '80%', 
                            height: '80%', 
                            borderRadius: '50%', 
                            background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                            zIndex: 0
                        }} />
                        
                        {/* Overlapping card shape */}
                        <Box sx={{ 
                            position: 'absolute', 
                            top: '20%', 
                            right: '5%', 
                            width: '250px', 
                            height: '300px', 
                            borderRadius: '20px', 
                            bgcolor: '#fff',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                            zIndex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#3CB815', opacity: 0.2 }} />
                        </Box>

                         {/* Floating Elements */}
                         <Box sx={{ position: 'absolute', top: '15%', left: '25%', width: 40, height: 40, borderRadius: '50%', bgcolor: '#3CB815', opacity: 0.6, zIndex: 2 }} />
                         <Box sx={{ position: 'absolute', bottom: '20%', right: '20%', width: 60, height: 60, borderRadius: '12px', bgcolor: '#81C784', opacity: 0.4, zIndex: 2, transform: 'rotate(15deg)' }} />
                    </Box>

                    {/* Right: Content */}
                    <Box flex={1}>
                        <Typography 
                            sx={{ 
                                fontFamily: "'Playfair Display', serif", 
                                fontWeight: 700, 
                                fontSize: { xs: '32px', md: '42px' }, 
                                color: '#1A1A1A',
                                mb: 3
                            }}
                        >
                            Who We Are
                        </Typography>
                        <Typography sx={{ color: '#555', lineHeight: 1.8, mb: 2 }}>
                            We are a community of farmers, artisans, and nature enthusiasts dedicated to bringing the purest organic products to your table. Our journey started with a simple idea: everyone deserves access to food that is free from harmful chemicals and grown with love.
                        </Typography>
                        <Typography sx={{ color: '#666', lineHeight: 1.8, borderLeft: '4px solid #3CB815', pl: 2 }}>
                            From the fields to your doorstep, we ensure every step is sustainable, transparent, and ethical. We believe in the power of nature to heal and nourish.
                        </Typography>
                         {/* Floating Elements */}
                         <Box sx={{ position: 'absolute', top: '15%', left: '25%', width: 40, height: 40, borderRadius: '50%', bgcolor: '#3CB815', opacity: 0.6, zIndex: 2 }} />
                         <Box sx={{ position: 'absolute', bottom: '20%', right: '20%', width: 60, height: 60, borderRadius: '12px', bgcolor: '#81C784', opacity: 0.4, zIndex: 2, transform: 'rotate(15deg)' }} />
                    </Box>

                    {/* Right: Content */}
                    <Box flex={1}>
                        <Typography 
                            sx={{ 
                                fontFamily: "'Playfair Display', serif", 
                                fontWeight: 700, 
                                fontSize: { xs: '32px', md: '42px' }, 
                                color: '#1A1A1A',
                                mb: 3
                            }}
                        >
                            Who We Are
                        </Typography>
                        <Typography sx={{ color: '#555', lineHeight: 1.8, mb: 2 }}>
                            We are a community of farmers, artisans, and nature enthusiasts dedicated to bringing the purest organic products to your table. Our journey started with a simple idea: everyone deserves access to food that is free from harmful chemicals and grown with love.
                        </Typography>
                        <Typography sx={{ color: '#666', lineHeight: 1.8, borderLeft: '4px solid #3CB815', pl: 2 }}>
                            From the fields to your doorstep, we ensure every step is sustainable, transparent, and ethical. We believe in the power of nature to heal and nourish.
                        </Typography>
                    </Box>
                </Box>

                {/* Section 2: Our Mission (Reversed Layout) */}
                <Box 
                    display='flex' 
                    flexDirection={{ xs: 'column-reverse', md: 'row' }} 
                    alignItems='center' 
                    gap={6}
                >
                    {/* Left: Content */}
                    <Box flex={1}>
                        <Typography 
                            sx={{ 
                                fontFamily: "'Playfair Display', serif", 
                                fontWeight: 700, 
                                fontSize: { xs: '32px', md: '42px' }, 
                                color: '#1A1A1A',
                                mb: 3
                            }}
                        >
                            Our Mission
                        </Typography>
                        <Typography sx={{ color: '#555', lineHeight: 1.8, mb: 2 }}>
                            Our mission is to revolutionize the way you shop for groceries. We aim to bridge the gap between local farmers and urban consumers, reducing carbon footprints while supporting local economies.
                        </Typography>
                        <Typography sx={{ color: '#666', lineHeight: 1.8 }}>
                            Every purchase you make is a step towards a healthier planet. We pledge 1% of our profits to reforestation and sustainable farming education.
                        </Typography>
                    </Box>

                {/* Section 2: Our Mission (Reversed Layout) */}
                <Box 
                    display='flex' 
                    flexDirection={{ xs: 'column-reverse', md: 'row' }} 
                    alignItems='center' 
                    gap={6}
                >
                    {/* Left: Content */}
                    <Box flex={1}>
                        <Typography 
                            sx={{ 
                                fontFamily: "'Playfair Display', serif", 
                                fontWeight: 700, 
                                fontSize: { xs: '32px', md: '42px' }, 
                                color: '#1A1A1A',
                                mb: 3
                            }}
                        >
                            Our Mission
                        </Typography>
                        <Typography sx={{ color: '#555', lineHeight: 1.8, mb: 2 }}>
                            Our mission is to revolutionize the way you shop for groceries. We aim to bridge the gap between local farmers and urban consumers, reducing carbon footprints while supporting local economies.
                        </Typography>
                        <Typography sx={{ color: '#666', lineHeight: 1.8 }}>
                            Every purchase you make is a step towards a healthier planet. We pledge 1% of our profits to reforestation and sustainable farming education.
                        </Typography>
                    </Box>

                    {/* Right: Abstract Art Composition */}
                    <Box 
                        flex={1} 
                        sx={{ 
                            position: 'relative', 
                            height: { xs: '300px', md: '450px' },
                            width: '100%'
                        }}
                    >
                        {/* Grid Pattern */}
                        <Box sx={{ 
                            position: 'absolute', 
                            inset: 0, 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(3, 1fr)', 
                            gap: 2,
                            zIndex: 1
                        }}>
                            {[...Array(9)].map((_, i) => (
                                <Box 
                                    key={i} 
                                    sx={{ 
                                        bgcolor: i % 2 === 0 ? '#F1F8E9' : '#fff', 
                                        borderRadius: '16px',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {i === 4 && <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#3CB815', opacity: 0.8 }} />}
                                </Box>
                            ))}
                    {/* Right: Abstract Art Composition */}
                    <Box 
                        flex={1} 
                        sx={{ 
                            position: 'relative', 
                            height: { xs: '300px', md: '450px' },
                            width: '100%'
                        }}
                    >
                        {/* Grid Pattern */}
                        <Box sx={{ 
                            position: 'absolute', 
                            inset: 0, 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(3, 1fr)', 
                            gap: 2,
                            zIndex: 1
                        }}>
                            {[...Array(9)].map((_, i) => (
                                <Box 
                                    key={i} 
                                    sx={{ 
                                        bgcolor: i % 2 === 0 ? '#F1F8E9' : '#fff', 
                                        borderRadius: '16px',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {i === 4 && <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#3CB815', opacity: 0.8 }} />}
                                </Box>
                            ))}
                        </Box>
                        
                        {/* Floating Circle */}
                        <Box sx={{ 
                            position: 'absolute', 
                            top: '10%', 
                            left: '10%', 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%', 
                            border: '3px solid #81C784',
                            zIndex: 2
                        }} />
                        
                        {/* Floating Circle */}
                        <Box sx={{ 
                            position: 'absolute', 
                            top: '10%', 
                            left: '10%', 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%', 
                            border: '3px solid #81C784',
                            zIndex: 2
                        }} />
                    </Box>
                </Box>
            </Container>
            </Container>

            <Features />
            <Footer />
            <Features />
            <Footer />
        </>
    )
}

export default AboutUs;
