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
    InputAdornment,
    Chip
} from "@mui/material";
import { getUserId } from "../../utils/functions";
import { fetchSingleProductApi, updateSingleProduct } from "../../api/productApi";
import { useNavigate, useParams } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';

const EditProduct = () => {
    const { pid } = useParams();
    const [productAdmin, setProductAdmin] = useState("");
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
    const [edit, setEdit] = useState(false);
    const navigate = useNavigate();

    const fetchProductFunction = async () => {
        try {
            const response = await fetchSingleProductApi(pid);
            const { User, name, brand, category, countInStock, price, discount, gst, totalPrice, image, description } = response.data;
            setProductAdmin(User);
            setName(name);
            setBrand(brand);
            setCategory(category);
            setCountInStock(countInStock);
            setPrice(price);
            setDiscount(discount);
            setGst(gst);
            setTotalPrice(totalPrice);
            setImage(image);
            setDescription(description);
        } catch (error) {
            console.log(error);
        }
    };

    const handleCalculation = () => {
        const p = parseFloat(price) || 0;
        const d = parseFloat(discount) || 0;
        const g = parseFloat(gst) || 0;
        let total = p - ((p * d) / 100) + ((p * g) / 100);
        setTotalPrice(Math.floor(total));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const apiBody = {
                "_id": pid,
                "countInStock": countInStock,
                "price": price,
                "category": category,
                "discount": discount,
                "gst": gst,
                "totalPrice": totalPrice,
                "image": image,
                "description": description
            };

            const response = await updateSingleProduct(apiBody);
            if (response.status) {
                navigate("/dashboard");
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        handleCalculation();
    }, [price, discount, gst]);

    useEffect(() => {
        fetchProductFunction();
    }, []);

    const isAdmin = productAdmin === getUserId();

    return (
        <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="md">
                <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                    {/* Header */}
                    <Box sx={{ bgcolor: '#fff', p: 3, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                                Edit Product
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Update product details or modify pricing.
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {isAdmin && (
                                <Chip 
                                    icon={edit ? <LockIcon /> : <EditIcon />} 
                                    label={edit ? "Editing Active" : "Enable Edit"} 
                                    onClick={() => setEdit((prev) => !prev)} 
                                    color={edit ? "success" : "default"}
                                    sx={{ fontWeight: 600, cursor: 'pointer' }}
                                />
                            )}
                        </Box>
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
                                        disabled 
                                        label="Product Name" 
                                        value={name}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#333' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField 
                                        fullWidth 
                                        disabled 
                                        label="Brand" 
                                        value={brand}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#333' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth disabled={!edit} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
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
                                        disabled={!edit} 
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
                                        disabled={!edit} 
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
                                        disabled={!edit} 
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
                                        disabled={!edit} 
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
                                        disabled={!edit} 
                                        label="Image URL" 
                                        value={image} 
                                        onChange={(e) => setImage(e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        disabled={!edit}
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
                        {edit && (
                            <Box sx={{ bgcolor: '#FAFAFA', p: 3, borderTop: '1px solid #f0f0f0', textAlign: 'right' }}>
                                <Button
                                    variant="contained"
                                    type="submit"
                                    size="large"
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
                                    Update Product
                                </Button>
                            </Box>
                        )}
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default EditProduct;