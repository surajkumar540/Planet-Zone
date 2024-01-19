import * as React from 'react';
import { useState } from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TuneIcon from '@mui/icons-material/Tune';

const style = {
    position: 'absolute',
    top: '16%',
    right: '2%',
    width: 200,
    bgcolor: 'background.paper',
    boxShadow: 2,
    p: 3,
    borderRadius: "10px"

};

export default function FilterModal({category,setCategory}) {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);


    return (
        <Box>
            <Button variant="contained" sx={{ textTransform: 'capitalize' }} onMouseEnter={handleOpen}>Filter</Button>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={open}
                onClose={handleClose}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 300,
                    },
                }}
            >
                <Fade in={open}>
                    <Box sx={style}>
                        {/* <Box display="flex" alignItems="center" gap={1} mb='1rem'>
                            <TuneIcon />
                            <Typography id="transition-modal-title" fontSize={'20px'}>
                                Filter
                            </Typography>
                        </Box> */}
                        <Box sx={{ minWidth: 120 }}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Product Type</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Product Type"
                                    value={category}
                                    onChange={(e)=>{setCategory(e.target.value);handleClose()}}
                                >
                                    <MenuItem value={'All'}>All</MenuItem>
                                    <MenuItem value={'Accessories'}>Accessories</MenuItem>
                                    <MenuItem value={'Clothes'}>Clothes</MenuItem>
                                    <MenuItem value={'Home'}>Home</MenuItem>
                                    <MenuItem value={'Furniture'}>Furniture</MenuItem>
                                    <MenuItem value={'Toys'}>Toys</MenuItem>
                                    {/* <MenuItem value={'Food'}>Food</MenuItem> */}
                                    {/* <MenuItem value={'Electronics'}>Electronics</MenuItem> */}
                                    {/* <MenuItem value={'Appliances'}> Appliances</MenuItem> */}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* {
                            category&&<Box sx={{ minWidth: 120 }} pt={2}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Brand</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={brand}
                                    label="Brand"
                                    onChange={(e)=>setBrand(e.target.value)}
                                >
                                    
                                    {
                                        brandList?.map((item)=>{
                                            return <MenuItem value={item}>{item}</MenuItem>
                                        })
                                    }
                                </Select>
                            </FormControl>
                        </Box>
                        } */}

                        {/* <Box sx={{ minWidth: 120 }} pt={2}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Price</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={price}
                                    label="Price"
                                    onChange={handleChange}
                                >
                                    <MenuItem value={1000}>1000</MenuItem>
                                    <MenuItem value={2000}>2000</MenuItem>
                                    <MenuItem value={3000}>3000</MenuItem>
                                </Select>
                            </FormControl>
                        </Box> */}
                        {/* <Box pt={2} width="100%" display="flex" justifyContent="right">
                            <Button variant="contained" onClick={handleClose}>Apply</Button>
                        </Box> */}
                    </Box>
                </Fade>
            </Modal>
        </Box>
    );
}