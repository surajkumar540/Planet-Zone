
import React from 'react';
import Poster1 from '../components/Poster/Poster1';
import Products from "../components/Products/Products"
import Poster3 from '../components/Poster/Poster3';
import { useSelector } from 'react-redux';
import Loader from '../components/Tools/Loader';
import Footer from '../components/Footer/Footer';
import { Box } from '@mui/material';

const Home = () => {
  const { data: products, status } = useSelector((state) => state?.products);

  if (status === 'loading') return <Loader />;

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
      <Poster1 />
      <Products products={products.slice(0, 8)} />
      <Poster3 />
      <Products heading="Monsoon Sales" title="Monsoon products at your point" products={products} />
      <Footer />
    </Box>
  );
};

export default Home;
