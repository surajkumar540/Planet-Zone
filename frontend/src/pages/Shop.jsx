import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer/Footer';
import { Box, Typography, Chip } from '@mui/material';
import FilterModal from "../components/Modals/FilterModal";
import Product from '../components/Products/Product';
import { getAllProducts } from '../api/productApi';
import ProductSkeleton from '../components/Tools/ProductSkeleton';
import SpaIcon from '@mui/icons-material/Spa';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';

const Categories = () => {
    const [productConstant, setProductConstant] = useState([]);
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState("All");
    const [isLoading, setIsLoading] = useState(false);
    const [cols, setCols] = useState(4); // 4 or 2 column toggle

    const filterTypeFunction = (cat, data = productConstant) => {
        if (cat === 'All') return setProducts(data);
        setProducts(data.filter((item) => item?.category === cat));
    };

    const fetchAllProducts = async () => {
        setIsLoading(true);
        try {
            const response = await getAllProducts();
            setProducts(response?.data);
            setProductConstant(response?.data);
        } catch (error) {
            console.log(error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        filterTypeFunction(category);
    }, [category]);

    useEffect(() => {
        fetchAllProducts();
    }, []);

    const gridCols = cols === 4
        ? { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(4,1fr)' }
        : { xs: 'repeat(1,1fr)', sm: 'repeat(2,1fr)', md: 'repeat(2,1fr)' };

    return (
        <Box sx={{ bgcolor: '#FAFDF8', minHeight: '100vh' }}>

            {/* ── Hero Banner ── */}
            <Box
                sx={{
                    background: 'linear-gradient(145deg, #0A3D0A 0%, #1B5E20 55%, #2E7D32 100%)',
                    pt: { xs: 10, md: 12 },
                    pb: { xs: 5, md: 7 },
                    px: { xs: 3, md: '7%' },
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Dot texture */}
                <Box sx={{ position: 'absolute', inset: 0, opacity: 0.07, backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)`, backgroundSize: '28px 28px', pointerEvents: 'none' }} />
                {/* Ghost text */}
                <Typography sx={{ position: 'absolute', fontFamily: "'Cormorant Garamond', serif", fontSize: { xs: '100px', md: '180px' }, fontWeight: 900, color: 'rgba(255,255,255,0.03)', bottom: -20, right: -10, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>
                    SHOP
                </Typography>

                <Box sx={{ position: 'relative', zIndex: 2 }}>
                    {/* Eyebrow */}
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.1)', color: '#A5D6A7', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', px: 2, py: 0.8, borderRadius: '50px', border: '1px solid rgba(255,255,255,0.15)', mb: 2.5 }}>
                        <SpaIcon sx={{ fontSize: '13px' }} />
                        Organic Store
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'flex-end' }, justifyContent: 'space-between', gap: 3 }}>
                        <Box>
                            <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: { xs: '36px', md: '52px' }, fontWeight: 700, color: '#fff', lineHeight: 1.05 }}>
                                {category === 'All' ? 'All Products' : category}
                            </Typography>
                            <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', mt: 1, fontFamily: "'Lato', sans-serif" }}>
                                {isLoading ? 'Fetching fresh products…' : `${products.length} item${products.length !== 1 ? 's' : ''} available`}
                            </Typography>
                        </Box>

                        {/* Filter button — passed to FilterModal */}
                        <FilterModal category={category} setCategory={setCategory} />
                    </Box>
                </Box>
            </Box>

            {/* ── Toolbar Row ── */}
            <Box
                sx={{
                    px: { xs: 3, md: '7%' },
                    py: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #EEF4EC',
                    bgcolor: '#fff',
                    position: 'sticky',
                    top: 64,
                    zIndex: 10,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                }}
            >
                {/* Active category chip */}
                <Box display="flex" alignItems="center" gap={1}>
                    {category !== 'All' && (
                        <Chip
                            label={category}
                            onDelete={() => setCategory('All')}
                            size="small"
                            sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 700, fontSize: '12px', '& .MuiChip-deleteIcon': { color: '#2E7D32' } }}
                        />
                    )}
                   
                </Box>

                {/* Grid density toggle */}
                <Box display="flex" gap={0.5}>
                    {[4, 2].map((n) => (
                        <Box
                            key={n}
                            onClick={() => setCols(n)}
                            sx={{
                                width: 34, height: 34, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                bgcolor: cols === n ? '#E8F5E9' : 'transparent',
                                color: cols === n ? '#2E7D32' : '#BBBBBB',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: '#F0F9EE' },
                            }}
                        >
                            {n === 4 ? <GridViewIcon sx={{ fontSize: '18px' }} /> : <ViewListIcon sx={{ fontSize: '18px' }} />}
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* ── Products Area ── */}
            <Box sx={{ px: { xs: 3, md: '7%' }, py: { xs: 4, md: 6 }, minHeight: '60vh' }}>
                {isLoading ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: gridCols, gap: { xs: 2, sm: 3 } }}>
                        {Array(8).fill({}).map((_, i) => <ProductSkeleton key={i} />)}
                    </Box>
                ) : products.length === 0 ? (
                    /* ── Empty State ── */
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 14, textAlign: 'center' }}>
                        <Box
                            sx={{
                                width: 90, height: 90, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3,
                                boxShadow: '0 8px 24px rgba(60,184,21,0.15)',
                            }}
                        >
                            <SpaIcon sx={{ fontSize: '42px', color: '#3CB815' }} />
                        </Box>
                        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 700, color: '#1A2F1A', mb: 1 }}>
                            No Products Found
                        </Typography>
                        <Typography sx={{ color: '#8A9E86', mb: 4, maxWidth: 360, fontSize: '14px', lineHeight: 1.7, fontFamily: "'Lato', sans-serif" }}>
                            No items in the "{category}" category yet. Try browsing everything we have!
                        </Typography>
                        <Box
                            onClick={() => setCategory('All')}
                            sx={{
                                display: 'inline-flex', alignItems: 'center', gap: 1,
                                bgcolor: '#3CB815', color: '#fff',
                                px: 3.5, py: 1.2, borderRadius: '14px',
                                fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                                fontFamily: "'Lato', sans-serif",
                                boxShadow: '0 6px 20px rgba(60,184,21,0.3)',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: '#33a313', transform: 'translateY(-2px)' },
                            }}
                        >
                            View All Products →
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: gridCols, gap: { xs: 2, sm: 3 } }}>
                        {products.map((item, index) => (
                            <Product key={item._id || index} obj={item} />
                        ))}
                    </Box>
                )}
            </Box>

            <Footer />
        </Box>
    );
};

export default Categories;