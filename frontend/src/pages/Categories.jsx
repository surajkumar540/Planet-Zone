import React, { useEffect,useState } from 'react';
import { useSelector } from 'react-redux';
import Loader from '../components/Tools/Loader';
import Footer from '../components/Footer/Footer';
import { getClothes } from '../utils/functions';
import { Box,Typography } from '@mui/material';
import ProdFilterModal from "../components/Modals/ProdFilterModal"
import Product from '../components/Products/Product';

const Categories = () => {
    const { data, status } = useSelector((state) => state?.products)

    const [products,setProducts]=useState(data);
    const [categoryProducts,setCategoryProducts]=useState([])
    const [category,setCategory]=useState("")
    const [brandList,setBrandList]=useState([])
    const [brand,setBrand]=useState("")

    if (status === 'loading') {
        return <Loader />
    }

    const filterTypeFunction=()=>{
        let brandArr=[]
        setBrand("")
        setBrandList("")
        const resultArr=data?.filter((item)=>{
            if(item?.category===category)
            {
                brandArr.push(item?.brand);
                return true
            }
        })
        setProducts(resultArr)
        setCategoryProducts(resultArr)
        setBrandList(brandArr)
    }

    const filterBrandFunction=()=>{
        const resultArr=categoryProducts?.filter((item)=>{
            return item?.brand===brand
        })
        setProducts(resultArr)
    }

    useEffect(()=>{
        if(category&&brand)
        {
            filterBrandFunction()
        }
        else if(category)
        {
            filterTypeFunction()
        }
        else if(!brand)
        {
            setProducts(data)
        }
    },[category,brand])

    return (
        <>
            <Box textAlign={'center'} my={2}>
                <Typography fontSize={'3rem'}>{"All Products"}</Typography>
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