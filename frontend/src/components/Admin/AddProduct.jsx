import React,{useEffect, useState} from "react";
import { Box, TextField, Typography,FormControl,InputLabel,MenuItem,Select,Button } from "@mui/material";

const AddProduct = () => {
  const [name,setName]=useState("")
  const [brand,setBrand]=useState("")
  const [category,setCategory]=useState("")
  const [countInStock,setCountInStock]=useState("")
  const [price,setPrice]=useState("")
  const [discount,setDiscount]=useState("")
  const [gst,setGst]=useState("")
  const [totalPrice,setTotalPrice]=useState("")
  const [image,setImage]=useState("")
  const [description,setDescription]=useState("")

  const handleCalculation=()=>{
    let total=price-((price*discount)/100)+((price*gst)/100);
    setTotalPrice(total)
  }

  useEffect(()=>{
    if(price && discount && gst)
    {
      handleCalculation()
    }
  },[price,discount,gst])

  const handleSubmit=async()=>{
    try{
      const apiBody={
        "User":"64a26434296c59d1a9ee9b0f",
        "name":"I mac",
        "brand":"Apple",
        "category":"Mobiles",
        "countInStock":4,
        "price":120000,
        "discount":2,
        "gst":1,
        "totalPrice":11642,
        "image":"https://th.bing.com/th/id/OIP.2yUWfMTP0yPt_vk6VcClawHaEK?pid=ImgDet&rs=1",
        "description":"68.58cm/27-inch (diagonal) 5120-by-2880 Retina 5K display 3.1GHz 6-core 10th-generation Intel Core i5 AMD Radeon Pro 5300 graphics Ultrafast SSD storage Two Thunderbolt 3 (USB-C) ports Four USB-A ports Gigabit Ethernet port"
    }
    }catch(error)
    {

    }
  }

  return (
    <Box marginX={'2rem'}>
      <Box paddingY={"1.5rem"}>
        <Typography variant="h4">
          Add New Product
        </Typography>
      </Box>

      <Box >
        
        <Box mb="1.2rem" sx={{display:'flex',justifyContent:'space-between'}}>
          <TextField sx={{flex:0.49}} type="text" label="Name" name="name" value={name} onChange={(e)=>setName(e.target.value)}/>
          <TextField sx={{flex:0.49}} type="text" label="Brand" name="brand" value={brand} onChange={(e)=>setBrand(e.target.value)}/>
        </Box>
        
        <Box mb="1.2rem" sx={{display:'flex',justifyContent:'space-between'}}>
          <FormControl sx={{flex:0.49}}>
            <InputLabel id="demo-simple-select-label">Category</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Category"
              name="category"
              value={category} 
              onChange={(e)=>setCategory(e.target.value)}
            >
              <MenuItem value={'Bottle'}>Bottle</MenuItem>
              <MenuItem value={'Bag'}>Bottle</MenuItem>
              <MenuItem value={'Shoes'}>Shoes</MenuItem>
              <MenuItem value={'Clothes'}>Clothes</MenuItem>
              <MenuItem value={'Matress'}>Matress</MenuItem>
              <MenuItem value={'Wallet'}>Wallet</MenuItem>
              <MenuItem value={'Chair'}>Chair</MenuItem>
              <MenuItem value={'Toys'}>Toys</MenuItem>
            </Select>
          </FormControl>
          <TextField sx={{flex:0.49}} type="number" label="Stock count" name="countInStock" value={countInStock} onChange={(e)=>setCountInStock(e.target.value)}/>
        </Box>
         
        <Box mb="1.2rem" sx={{display:'flex',justifyContent:'space-between'}}>
          <TextField sx={{flex:0.49}} type="number" label="Price" name="price" value={price} onChange={(e)=>setPrice(e.target.value)}/>
          <TextField sx={{flex:0.49}} type="number" label="Discount (%)" name="discount"  value={discount} onChange={(e)=>setDiscount(e.target.value)}/>
        </Box>   

         
        <Box mb="1.2rem" sx={{display:'flex',justifyContent:'space-between'}}>
          <TextField sx={{flex:0.49}} type="number" label="Gst (%)" name="gst" value={gst} onChange={(e)=>setGst(e.target.value)}/>
          <TextField sx={{flex:0.49}} disabled type="number" label="Total Price" name="totalPrice" value={totalPrice} onChange={(e)=>setTotalPrice(e.target.value)}/>
        </Box>
         
        <Box mb="1.2rem" sx={{display:'flex',justifyContent:'space-between'}}>
          <TextField fullWidth type="text" label="Image Url" name="image" value={image} onChange={(e)=>setImage(e.target.value)}/>
        </Box>
         
        <Box mb="1.2rem" sx={{display:'flex',justifyContent:'space-between'}}>
          <TextField fullWidth id="outlined-multiline-static" label="Multiline" multiline rows={4} defaultValue="Default Value" name="description" value={description} onChange={(e)=>setDescription(e.target.value)}/>
        </Box>

        <Box marginBottom={'0rem'}>
          <Button variant="contained">Add Product</Button>
        </Box>

      </Box>
    </Box>
  );
};

export default AddProduct;
