import React, { useEffect, useState } from "react";
import { 
    Box, 
    TextField, 
    Typography, 
    FormControl, 
    InputLabel, 
    MenuItem, 
    Select, 
    Button, 
    Paper, 
    Container, 
    Grid, 
    Divider,
    InputAdornment
} from "@mui/material";
import { getUserId } from "../../utils/functions";
import { addSingleProduct } from "../../api/productApi";
import { useNavigate } from "react-router-dom";
import SaveIcon from '@mui/icons-material/Save';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const AddProduct = () => {
    const [name, setName] = useState("");
    const [brand, setBrand] = useState("");
    const [category, setCategory] = useState("");
    const [countInStock, setCountInStock] = useState("");
    const [price, setPrice] = useState("");
    const [discount, setDiscount] = useState("");
    const [gst, setGst] = useState("");
    const [totalPrice, setTotalPrice] = useState("");
    const [image, setImage] = useState("");
    const [description, setDescription] = useState("");
    const navigate = useNavigate();

    const handleCalculation = () => {
        // Ensure inputs are numbers
        const p = parseFloat(price) || 0;
        const d = parseFloat(discount) || 0;
        const g = parseFloat(gst) || 0;
        
        let total = p - ((p * d) / 100) + ((p * g) / 100);
        setTotalPrice(Math.floor(total));
    };

    useEffect(() => {
        handleCalculation();
    }, [price, discount, gst]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const apiBody = {
                "User": getUserId(),
                "name": name,
                "brand": brand,
                "category": category,
                "countInStock": countInStock,
                "price": price,
                "discount": discount,
                "gst": gst,
                "totalPrice": Math.floor(totalPrice),
                "image": image,
                "description": description
            };

            const response = await addSingleProduct(apiBody);
            if (response.status) {
                navigate("/dashboard");
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="md">
                <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                    {/* Header */}
                    <Box sx={{ bgcolor: '#fff', p: 3, borderBottom: '1px solid #f0f0f0' }}>
                        <Typography variant="h5" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                            Add New Product
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Fill in the details below to list a new product.
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ p: 4 }}>
                            
                            {/* Section 1: Basic Info */}
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
                                Basic Information
                            </Typography>
                            <Grid container spacing={3} mb={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField 
                                        fullWidth 
                                        label="Product Name" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField 
                                        fullWidth 
                                        label="Brand" 
                                        value={brand} 
                                        onChange={(e) => setBrand(e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            value={category}
                                            label="Category"
                                            onChange={(e) => setCategory(e.target.value)}
                                        >
                                            <MenuItem value={'Accessories'}>Accessories</MenuItem>
                                            <MenuItem value={'Clothes'}>Clothes</MenuItem>
                                            <MenuItem value={'Home'}>Home</MenuItem>
                                            <MenuItem value={'Furniture'}>Furniture</MenuItem>
                                            <MenuItem value={'Toys'}>Toys</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField 
                                        fullWidth 
                                        type="number" 
                                        label="Stock Count" 
                                        value={countInStock} 
                                        onChange={(e) => setCountInStock(e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            {/* Section 2: Pricing */}
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
                                Pricing Details
                            </Typography>
                            <Grid container spacing={3} mb={3}>
                                <Grid item xs={12} sm={4}>
                                    <TextField 
                                        fullWidth 
                                        type="number" 
                                        label="Base Price" 
                                        value={price} 
                                        onChange={(e) => setPrice(e.target.value)}
                                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField 
                                        fullWidth 
                                        type="number" 
                                        label="Discount (%)" 
                                        value={discount} 
                                        onChange={(e) => setDiscount(e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField 
                                        fullWidth 
                                        type="number" 
                                        label="GST (%)" 
                                        value={gst} 
                                        onChange={(e) => setGst(e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>
                                
                                {/* Total Price Result */}
                                <Grid item xs={12}>
                                    <Box 
                                        sx={{ 
                                            bgcolor: '#E8F5E9', 
                                            p: 2, 
                                            borderRadius: 2, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between' 
                                        }}
                                    >
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2E7D32' }}>
                                            Final Selling Price
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                                            ₹ {totalPrice || '0.00'}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            {/* Section 3: Media & Description */}
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
                                Media & Description
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField 
                                        fullWidth 
                                        label="Image URL" 
                                        value={image} 
                                        onChange={(e) => setImage(e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        label="Description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Footer Actions */}
                        <Box sx={{ bgcolor: '#FAFAFA', p: 3, borderTop: '1px solid #f0f0f0', textAlign: 'right' }}>
                            <Button
                                variant="contained"
                                type="submit"
                                size="large"
                                startIcon={<SaveIcon />}
                                sx={{
                                    bgcolor: '#3CB815',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 5,
                                    borderRadius: 2,
                                    boxShadow: '0 4px 14px rgba(60, 184, 21, 0.2)',
                                    '&:hover': { bgcolor: '#2fa012' }
                                }}
                            >
                                Save Product
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default AddProduct;