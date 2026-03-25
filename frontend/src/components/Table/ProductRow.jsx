import { Typography, Grid, Box, CardMedia, IconButton, Tooltip } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { deleteSingleProduct } from "../../api/productApi";
import { useNavigate } from "react-router-dom";

const ProductRow = ({ obj, sno, refetch }) => {
  
  const navigate = useNavigate();

  const handleDeleteProduct = async (pid) => {
    if(window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await deleteSingleProduct(pid);
        if (response.status) {
          refetch();
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <Box 
      sx={{ 
        borderBottom: '1px solid #f0f0f0',
        transition: 'background 0.2s',
        '&:hover': {
          bgcolor: '#F1F8E9', // Light green hover
        },
        '&:last-child': {
          borderBottom: 'none'
        }
      }}
    >
      <Grid container sx={{ py: 2, px: 3, alignItems: 'center' }}>

        {/* S.No */}
        <Grid item xs={1}>
          <Typography variant="body2" color="text.secondary">{sno}</Typography>
        </Grid>

        {/* Image */}
        <Grid item xs={1} display="flex" justifyContent="center">
          <Box 
            sx={{ 
              width: 45, 
              height: 45, 
              borderRadius: 2, 
              overflow: 'hidden', 
              bgcolor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CardMedia
              component="img"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              image={obj?.image || "https://via.placeholder.com/50"}
              alt={obj?.name}
            />
          </Box>
        </Grid>

        {/* Name */}
        <Grid item xs={3}>
          <Typography 
            sx={{ 
              fontWeight: 600, 
              color: '#333', 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              maxWidth: '200px',
              cursor: 'pointer',
              '&:hover': { color: '#3CB815' }
            }}
            onClick={() => navigate(`/editProduct/${obj?._id}`)}
          >
            {obj?.name}
          </Typography>
        </Grid>

        {/* Brand */}
        <Grid item xs={2}>
          <Typography variant="body2" color="text.secondary">{obj?.brand || 'N/A'}</Typography>
        </Grid>
       
        {/* Category */}
        <Grid item xs={2}>
          <Typography variant="body2" color="text.secondary">{obj?.category}</Typography>
        </Grid>

        {/* Price */}
        <Grid item xs={2}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A1A1A' }}>
            ₹{obj?.price}
          </Typography>
        </Grid>

        {/* Actions */}
        <Grid item xs={1} textAlign="center">
          <Tooltip title="Delete">
            <IconButton 
              sx={{ 
                color: '#ef5350',
                '&:hover': { bgcolor: '#FFEBEE' }
              }} 
              size="small" 
              onClick={() => handleDeleteProduct(obj?._id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Grid>

      </Grid>
    </Box>
  );
};

export default ProductRow;