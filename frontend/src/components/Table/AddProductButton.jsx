import { Box,Button } from '@mui/material'
import React from 'react'

const AddProductButton = () => {
  return (
    <Box marginX={'2rem'} marginY={'1rem'} display={'flex'} justifyContent={'flex-end'}>

        <Button variant='contained' sx={{textTransform:'capitalize'}}>Add Product</Button>
    </Box>
  )
}

export default AddProductButton