import React from "react";
import { Box, TextField, Typography,FormControl,InputLabel,MenuItem,Select,Button } from "@mui/material";

const AddProduct = () => {
  return (
    <Box marginX={'2rem'}>
      <Box paddingY={"1.5rem"}>
        <Typography variant="h4">
          Add New Product
        </Typography>
      </Box>

      <Box >
        
        <Box mb="1.2rem" sx={{display:'flex',justifyContent:'space-between'}}>
          <TextField sx={{flex:0.49}} type="text" label="Name" name="name" />
          <TextField sx={{flex:0.49}} type="text" label="Brand" name="name" />
        </Box>
        
        <Box mb="1.2rem" sx={{display:'flex',justifyContent:'space-between'}}>
          <FormControl sx={{flex:0.49}}>
            <InputLabel id="demo-simple-select-label">Category</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Category"
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
          <TextField sx={{flex:0.49}} type="text" label="Stock count" name="name" />
        </Box>
         
        <Box mb="1.2rem" sx={{display:'flex',justifyContent:'space-between'}}>
          <TextField sx={{flex:0.49}} type="text" label="Price" name="name" />
          <TextField sx={{flex:0.49}} type="text" label="Discount" name="name" />
        </Box>   

         
        <Box mb="1.2rem" sx={{display:'flex',justifyContent:'space-between'}}>
          <TextField sx={{flex:0.49}} type="text" label="GST" name="name" />
          <TextField sx={{flex:0.49}} type="text" label="Total Price" name="name" />
        </Box>
         
        <Box mb="1.2rem" sx={{display:'flex',justifyContent:'space-between'}}>
          <TextField fullWidth type="text" label="Image Url" name="name" />
        </Box>
         
        <Box mb="1.2rem" sx={{display:'flex',justifyContent:'space-between'}}>
          <TextField fullWidth id="outlined-multiline-static" label="Multiline" multiline rows={4} defaultValue="Default Value"/>
        </Box>

        <Box marginBottom={'0rem'}>
          <Button variant="contained">Add Product</Button>
        </Box>

      </Box>
    </Box>
  );
};

export default AddProduct;
