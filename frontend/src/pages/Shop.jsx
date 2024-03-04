import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer/Footer';
import { Box, Typography, CardMedia, Grid } from '@mui/material';
import FilterModal from "../components/Modals/FilterModal"
import Product from '../components/Products/Product';
// import { getAllProducts } from '../api/devApi';
import { getAllProducts } from '../api/productApi';
import blankHome from "../assets/Images/admin_empty.webp"
import ProductSkeleton from '../components/Tools/ProductSkeleton';

const Categories = () => {
    const [productConstant, setProductConstant] = useState([])
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState("All")
    const [isLoading, setIsLoading] = useState(false)

    const filterTypeFunction = () => {
        const resultArr = productConstant?.filter((item) => {
            if (item?.category === category) {
                return true
            }
        })
        setProducts(resultArr)
    }


    const fetchAllProducts = async () => {
        setIsLoading(true)
        try {
            const response = await getAllProducts()
            setProducts(response?.data)
            setProductConstant(response?.data)
        } catch (error) {
            console.log(error)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        if (category === 'All') {
            setProducts(productConstant)
        }
        else {
            filterTypeFunction()
        }
    }, [category])

    useEffect(() => {
        fetchAllProducts()
    }, [])


    // if (status === 'loading') {
    //     return <Loader />
    // }

    return (
        <>
            <Box textAlign={'center'} my={2}>
                <Typography fontSize={'3rem'}>{"All Products"}</Typography>
                <Typography>{"Search products at your convenience"}</Typography>
            </Box>


            <Box display="flex" justifyContent={'right'} pr='2rem' my={2}>
                <FilterModal category={category} setCategory={setCategory} />
            </Box>

            <Box display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'} mb='5rem'>

                {!isLoading && products.length === 0 &&
                    <Box display={'flex'} justifyContent={'center'} flexDirection={'columnn'} alignContent={'center'}>
                        <Box>
                            <CardMedia
                                sx={{ height: 440, width: 440 }}
                                image={blankHome}
                                title="green iguana"
                            />
                            <Typography textAlign={'center'} fontWeight={500} fontSize={'22px'}>{`No ${category} Products Found`}</Typography>
                        </Box>
                    </Box>}


                <Box flexGrow={1} width={'95%'}>
                    <Grid container spacing={2} rowSpacing={{ xs: 1, sm: 2, md: 8 }}>

                        {
                            isLoading ? (
                                Array(20).fill({})?.map((item, index) => {
                                    return <Grid item key={index} xs={12} sm={6} md={4} lg={3} display={"flex"} justifyContent={"center"}>
                                        <ProductSkeleton />
                                    </Grid>
                                })
                            ) : (products?.map((item, index) => {
                                return <Grid item key={index} xs={12} sm={6} md={4} lg={3} display={"flex"} justifyContent={"center"}>
                                    <Product key={index} obj={item} />
                                </Grid>
                            }))
                        }
                    </Grid>
                </Box>
            </Box>
            <Footer />
        </>
    )
}

export default Categories