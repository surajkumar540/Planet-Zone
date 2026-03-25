import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { forgetOtp } from '../../api/userApi';
import { useNavigate } from "react-router-dom"
import { useState } from 'react';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#fff',
  borderRadius: 4,
  boxShadow: 24,
  p: 4,
  outline: 'none',
};

export default function ForgetModal() {
    const navigate = useNavigate()
    const [email,setEmail]=useState("")
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

  const handleSendForgetOtp = async () => {
    const dummy = { "email": email };
    try {
      const response = await forgetOtp(dummy);
      if (response.status) {
        navigate("/change-password");
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box>
      <Typography 
        onClick={handleOpen} 
        sx={{ 
          color: '#3CB815', 
          cursor: 'pointer', 
          fontSize: '13px', 
          fontWeight: 600,
          '&:hover': { textDecoration: 'underline' }
        }}
      >
        Forgot Password?
      </Typography>
      
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Box sx={{ width: 50, height: 50, borderRadius: '50%', bgcolor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <LockResetIcon sx={{ color: '#3CB815', fontSize: 28 }} />
            </Box>
            <Typography variant="h6" component="h2" fontWeight={700} color="#333">
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'center' }}>
              Enter your email and we'll send you an OTP to reset your password.
            </Typography>
          </Box>

          <TextField
            type='email'
            label="Email Address"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <Button
            variant='contained'
            fullWidth
            onClick={handleSendForgetOtp}
            sx={{
              py: 1.5,
              borderRadius: 2,
              bgcolor: '#3CB815',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(60, 184, 21, 0.25)',
              '&:hover': { bgcolor: '#2fa012' },
            }}
          >
            Send OTP
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}