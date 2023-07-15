import { Typography, Grid, Box, Avatar, CardMedia, IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteSingleProduct } from "../../api/devApi";
import { useNavigate } from "react-router-dom";

const ProductRow = ({obj,sno,refetch}) => {
  
  const navigate=useNavigate()
  const handleNavigate=()=>{
    navigate(`/editProduct/${obj?._id}`)
  }

  const handleDeleteProduct=async(pid)=>{
    try{
      const response=await deleteSingleProduct(pid);
      if(response.status)
      {
        refetch()
      }
    }catch(error)
    {
      console.log(error)
    }
  }

  return (
    <Box marginX={'2rem'} marginY={'1rem'}>
    <Grid container sx={{bgcolor:'whitesmoke',paddingY:'.8rem',borderRadius:"10px",textAlign:'center',cursor:"pointer"}}>

      <Grid item xs={1} alignSelf={"center"} onClick={handleNavigate}>
      <Typography>{sno}</Typography>
      </Grid>

      

      <Grid item xs={1} display={"flex"} justifyContent={"center"} alignItems={"center"} onClick={handleNavigate}>

        <CardMedia
          component="img"
          height="50"
          sx={{objectFit:'contain'}}
          image={obj?.image||"https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
          alt="green iguana"
        />
      </Grid>


      <Grid item xs={3} alignSelf={"center"} onClick={handleNavigate}>
        <Typography>{obj?.name}</Typography>
      </Grid>


      <Grid item xs={2} alignSelf={"center"} onClick={handleNavigate}>
        <Typography>{obj?.brand}</Typography>
      </Grid>
      
     
      <Grid item xs={2} alignSelf={"center"} onClick={handleNavigate}>
        <Typography>
            {obj?.category}
        </Typography>
      </Grid>

      <Grid item xs={2} alignSelf={"center"}>
        <Typography>
            ₹ {obj?.price}
        </Typography>
      </Grid>
  
        <Grid item xs={1} alignSelf={"center"} >
          <IconButton sx={{color:"red"}} size="small" onClick={()=>handleDeleteProduct(obj?._id)}>
            <DeleteIcon/>
          </IconButton>
        </Grid>
 
    </Grid>
    </Box>
  );
};

export default ProductRow;
