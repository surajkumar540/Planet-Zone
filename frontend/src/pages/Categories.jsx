import React, { useEffect,useState } from 'react';
import { useSelector } from 'react-redux';
import Loader from '../components/Tools/Loader';
import Footer from '../components/Footer/Footer';
import { getClothes } from '../utils/functions';
import { Box,Typography } from '@mui/material';
import ProdFilterModal from "../components/Modals/ProdFilterModal"
import Product from '../components/Products/Product';
import { getAllProducts } from '../api/devApi';

const Categories = () => {
    const [products,setProducts]=useState([]);
    const [productConstant,setProductConstant]=useState([])
    const [category,setCategory]=useState("")
    const [brandList,setBrandList]=useState([])
    const [brand,setBrand]=useState("")

    if (status === 'loading') {
        return <Loader />
    }

    const filterTypeFunction=()=>{
        const resultArr=productConstant?.filter((item)=>{
            if(item?.category===category)
            {
                return true
            }
        })
        setProducts(resultArr)
    }


    const fetchAllProducts=async()=>{
        try{
            const response=await getAllProducts()
            setProducts(response?.data)
            setProductConstant(response?.data)
        }catch(error)
        {
            console.log(error)
        }
    }

    useEffect(()=>{
        if(category==='All')
        {
            setProducts(productConstant)
        }
        else
        {
            filterTypeFunction()
        }
    },[category])

    useEffect(()=>{
        fetchAllProducts()
    },[])

    return (
        <>
            <Box textAlign={'center'} my={2}>
                <Typography fontSize={'3rem'}>{"All Products"}</Typography>
                <Typography>{"Search products at your convenience"}</Typography>
            </Box>


            <Box display="flex" justifyContent={'right'} pr='2rem' my={2}>
                <ProdFilterModal category={category} setCategory={setCategory} brandList={brandList} brand={brand} setBrand={setBrand}/>
            </Box>

            <Box display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'} mb='5rem'>

                <Box display={'flex'} p={2} gap={12} flexWrap={'wrap'} width={'85%'}>
                    {
                        products?.map((item, index) => {
                            return <Box key={index}>
                            <Product obj={item} />
                            </Box> 
                        })
                    }

                </Box>
            </Box>
            <Footer />
        </>
    )
}

export default Categories