import React, { useEffect, useState } from 'react';
import ShowProduct from './ShowProduct';
import Products from '../Products/Products';
import { useSelector } from 'react-redux';
import { fetchSingleProductApi } from '../../api/productApi';
import { useParams } from 'react-router-dom';
import Footer from '../Footer/Footer';
import { Box } from '@mui/material';

const ShowProducts = () => {
    const { pid } = useParams();
    const { data: products } = useSelector((state) => state?.products);
    const [singleProduct, setSingleProduct] = useState({});

    const fetchSingleProduct = async () => {
        try {
            const response = await fetchSingleProductApi(pid);
            if (response.status) {
                setSingleProduct(response.data);
            }
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchSingleProduct();
        // Scroll to top when product changes
        window.scrollTo(0, 0);
    }, [pid]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Main Product Detail */}
            <Box sx={{ flexGrow: 1 }}>
                <ShowProduct obj={singleProduct} />
                
                {/* Similar Products Section */}
                <Box sx={{ bgcolor: '#F5F5F5', py: 6, mt: 4 }}>
                    <Products 
                        heading="You Might Also Like" 
                        title="Explore more from this category" 
                        products={products} 
                    />
                </Box>
            </Box>
            
            <Footer />
        </Box>
    );
};

export default ShowProducts;