import React, { useEffect, useState } from 'react';
import ProductRow from '../Table/ProductRow';
import ProductHeading from '../Table/ProductHeading';
import { getAllProducts } from '../../api/productApi';
import { Box, Typography, Button, Paper, Container } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

const AdminHome = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await getAllProducts();
      setProducts(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', p: 3 }}>
      <Container maxWidth="xl">
        {/* Page Header */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={4}
        >
          <Box>
            <Typography 
              variant="h4" 
              sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#1A1A1A' }}
            >
              Inventory
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your product listings
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate("/addProduct")}
            sx={{
              bgcolor: '#3CB815',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: '0 4px 14px rgba(60, 184, 21, 0.2)',
              '&:hover': { bgcolor: '#2fa012' }
            }}
          >
            Add Product
          </Button>
        </Box>

        {/* Main Content Area */}
        {products.length === 0 ? (
          // Empty State
          <Paper 
            elevation={0}
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: '60vh',
              borderRadius: 4,
              border: '1px dashed #ccc'
            }}
          >
            <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Inventory2OutlinedIcon sx={{ fontSize: 40, color: '#3CB815' }} />
            </Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>No Products Yet</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start by adding your first product to the store.
            </Typography>
            <Button variant="outlined" onClick={() => navigate("/addProduct")}>
              Add Now
            </Button>
          </Paper>
        ) : (
          // Table Container
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 4, 
              overflow: 'hidden', 
              border: '1px solid rgba(0,0,0,0.05)' 
            }}
          >
            <ProductHeading />
            <Box sx={{ maxHeight: '65vh', overflow: 'auto' }}>
              {products.map((item, index) => (
                <ProductRow 
                  key={item._id || index} 
                  obj={item} 
                  sno={index + 1} 
                  refetch={fetchProducts} 
                />
              ))}
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default AdminHome;