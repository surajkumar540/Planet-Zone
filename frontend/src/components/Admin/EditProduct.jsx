import React, { useEffect, useState } from "react";
import { Box, TextField, Typography, FormControl, InputLabel, MenuItem, Select, Button } from "@mui/material";
import { getUserId } from "../../utils/functions";
import { fetchSingleProductApi, updateSingleProduct } from "../../api/devApi";
import { useNavigate, useParams } from "react-router-dom";

const EditProduct = () => {
    const { pid } = useParams();
    const [productAdmin, setProductAdmin] = useState("")
    const [name, setName] = useState("")
    const [brand, setBrand] = useState("")
    const [category, setCategory] = useState("")
    const [countInStock, setCountInStock] = useState("")
    const [price, setPrice] = useState("")
    const [discount, setDiscount] = useState("")
    const [gst, setGst] = useState("")
    const [totalPrice, setTotalPrice] = useState("")
    const [image, setImage] = useState("")
    const [description, setDescription] = useState("");
    const [edit, setEdit] = useState(false);
    const navigate = useNavigate()

    const fetchProductFunction = async () => {
        try {
            const response = await fetchSingleProductApi(pid)
            const { User, name, brand, category, countInStock, price, discount, gst, totalPrice, image, description } = response.data;
            setProductAdmin(User);
            setName(name)
            setBrand(brand)
            setCategory(category)
            setCountInStock(countInStock)
            setPrice(price)
            setDiscount(discount)
            setGst(gst)
            setTotalPrice(totalPrice)
            setImage(image)
            setDescription(description)


        } catch (error) {
            console.log(error)
        }
    }

    const handleCalculation = () => {
        let total = price - ((price * discount) / 100) + ((price * gst) / 100);
        setTotalPrice(total)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
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
            }

            const response = await updateSingleProduct(apiBody);

            if (response.status) {
                navigate("/dashboard")
            }

        } catch (error) {
            console.log(error)
        }
    }


    useEffect(() => {
        if (price && discount && gst) {
            handleCalculation()
        }
    }, [price, discount, gst])

    useEffect(() => {
        fetchProductFunction()
    }, [])

    return (
        <Box marginX={'2rem'}>
            <Box paddingY={"1.5rem"} display={'flex'} justifyContent={'space-between'}>
                <Typography variant="h4">
                    Add New Product
                </Typography>

                {productAdmin === getUserId() && <Button variant="contained" sx={{ textTransform: 'capitalize', borderRadius: '5px' }} onClick={() => setEdit((prev) => !prev)}>Edit</Button>
                }
            </Box>

            <Box >
                <form onSubmit={handleSubmit}>


                    <Box mb="1.2rem" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <TextField sx={{ flex: 0.49 }} disabled type="text" label="Name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
                        <TextField sx={{ flex: 0.49 }} disabled type="text" label="Brand" name="brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
                    </Box>

                    <Box mb="1.2rem" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <FormControl sx={{ flex: 0.49 }}>
                            <InputLabel id="demo-simple-select-label">Category</InputLabel>
                            <Select
                                disabled={edit === false ? true : false}
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                label="Category"
                                name="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <MenuItem value={'Electronics'}>Electronics</MenuItem>
                                <MenuItem value={'Accessories'}>Accessories</MenuItem>
                                <MenuItem value={'Food'}>Food</MenuItem>
                                <MenuItem value={'Clothes'}>Clothes</MenuItem>
                                <MenuItem value={'Home'}>Home</MenuItem>
                                <MenuItem value={'Furniture'}>Furniture</MenuItem>
                                <MenuItem value={'Appliances'}> Appliances</MenuItem>
                                <MenuItem value={'Toys'}>Toys</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField sx={{ flex: 0.49 }} disabled={edit === false ? true : false} type="number" label="Stock count" name="countInStock" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} />
                    </Box>

                    <Box mb="1.2rem" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <TextField sx={{ flex: 0.49 }} disabled={edit === false ? true : false} type="number" label="Price" name="price" value={price} onChange={(e) => setPrice(e.target.value)} />
                        <TextField sx={{ flex: 0.49 }} disabled={edit === false ? true : false} type="number" label="Discount (%)" name="discount" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                    </Box>


                    <Box mb="1.2rem" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <TextField sx={{ flex: 0.49 }} disabled={edit === false ? true : false} type="number" label="Gst (%)" name="gst" value={gst} onChange={(e) => setGst(e.target.value)} />
                        <TextField sx={{ flex: 0.49 }} disabled type="number" label="Total Price" name="totalPrice" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} />
                    </Box>

                    <Box mb="1.2rem" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <TextField fullWidth disabled={edit === false ? true : false} type="text" label="Image Url" name="image" value={image} onChange={(e) => setImage(e.target.value)} />
                    </Box>

                    <Box mb="1.2rem" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <TextField fullWidth disabled={edit === false ? true : false} id="outlined-multiline-static" label="Multiline" multiline rows={4} defaultValue="Default Value" name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </Box>

                    <Box marginBottom={'0rem'}>
                        <Button variant="contained" type="submit" disabled={!edit}>Update</Button>
                    </Box>
                </form>
            </Box>
        </Box>
    );
};

export default EditProduct;
