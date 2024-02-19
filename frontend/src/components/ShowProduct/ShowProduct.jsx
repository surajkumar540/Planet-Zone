import React, { useEffect, useState } from 'react';
import { Box, CardMedia, Typography, Button, FormControl, MenuItem, Select, InputLabel } from '@mui/material';
import { useDispatch } from 'react-redux';
import { addToCartAsync } from '../../redux/reducers/cartSlice';
import { useNavigate } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';


const ShowProduct = ({ obj }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [qty, setQty] = useState(0);

    const handleCart = () => {
        const dummy = {
            id: obj?._id,
            qty: qty
        }
        dispatch(addToCartAsync(dummy))
        navigate("/cart")
    }

    useEffect(() => {
        setQty(1)
    }, [obj])

    return (
        <>
            <Box display={'flex'} height={'80vh'}>
                <Box flex={0.4} display={'flex'} justifyContent={'center'} alignItems={'flex-end'}>

                    {
                        obj?.image ? (
                            <CardMedia
                                sx={{ height: '95%', width: '90%', borderRadius: '20px', objectFit: "contain" }}
                                image={obj?.image}
                                title="green iguana"
                            />
                        ) : (
                            <ImageSkeleton />
                        )
                    }
                </Box>
                <Box flex={0.6} display={'flex'} flexDirection={'column'} boxSizing={'border-box'} p='2rem' justifyContent={'space-around'}>

                    <Box flex='0.6' display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}>

                        <Typography fontSize={'1rem'}>
                            {
                                obj?.brand ? (
                                    `${obj?.brand} ${obj?.category}`
                                ) : (
                                    <Skeleton />
                                )
                            }
                        </Typography>

                        <Typography fontSize={'1.5rem'}>
                            {
                                obj?.name ? obj.name : <Skeleton />
                            }
                        </Typography>

                        <Typography fontSize={'28px'} color={'green'}>
                            {
                                obj?.totalPrice ? (
                                    <Box>
                                        ₹{Math.floor(obj?.totalPrice)}{" "}
                                        <Typography as='del' fontSize='1rem' sx={{ color: "grey", fontWeight: 400 }}>
                                            {obj?.price && `₹${obj?.price}`}
                                        </Typography>

                                        <Typography as='span' fontSize='1rem' color='#388E3C'>{obj?.discount && `${obj?.discount}% off`}</Typography>
                                    </Box>
                                ) : (
                                    <Skeleton />
                                )
                            }

                        </Typography>

                        <Box py='1rem' display={'flex'} alignItems={'center'}>
                            <Box>
                                {
                                    obj?.countInStock ? (
                                        <FormControl fullWidth size="small" sx={{ m: 1, minWidth: 60 }}>

                                            <InputLabel id="demo-simple-select-label">Qty</InputLabel>

                                            <Select
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                value={qty}
                                                label="Age"
                                                onChange={(e) => setQty(e.target.value)}
                                            >
                                                {
                                                    [...Array(obj?.countInStock).keys()].map((item) => {
                                                        return <MenuItem key={item} value={item + 1}>{item + 1}</MenuItem>
                                                    })
                                                }

                                            </Select>
                                        </FormControl>
                                    ) : (
                                        <Skeleton sx={{ p: 2, minWidth: 60 }} />
                                    )
                                }

                            </Box>
                        </Box>
                        <Box fontSize={'1.5rem'}>
                            {
                                obj?.name ? (
                                    <Button variant='contained' sx={{
                                        marginRight: '1rem', bgcolor: "#0D9276", px: "3rem", py: "1rem",
                                        "&:hover": {
                                            bgcolor: "#047d63",
                                            color: "white"
                                        }
                                    }} onClick={handleCart}>Add to Cart</Button>
                                ) : (
                                    <Skeleton sx={{ px: "3rem", py: "1.5rem", width: "6rem" }} />
                                )
                            }

                        </Box>

                    </Box>

                    <Box flex='0.38'>
                        {
                            obj?.name ?
                                (
                                    <Typography variant='h5'>
                                        Description
                                    </Typography>
                                )
                                : <Skeleton sx={{ px: "3rem", py: ".3rem", width: "6rem" }} />
                        }
                        {
                            obj?.description ? (
                                <Typography py='1rem'>
                                    {obj?.description}
                                </Typography>
                            ) : (
                                <Skeleton width={'100%'} height={'8rem'} />
                            )
                        }
                    </Box>
                </Box>
            </Box>
        </>
    )
}

export default ShowProduct


export function ImageSkeleton() {
    return (
        <Stack spacing={1} sx={{ height: '95%', width: '80%', borderRadius: '20px', objectFit: "contain" }} >
            <Skeleton variant="rounded" width={'100%'} height={'100%'} />
        </Stack>
    );
}