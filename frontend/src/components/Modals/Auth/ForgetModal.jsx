import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { Link } from 'react-router-dom';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 300,
    bgcolor: 'background.paper',
    borderRadius: '10px',
    boxShadow: 24,
    p: 4,
};

export default function ForgetModal() {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <Box>
            <Typography mt={'.3rem'} textAlign={'center'} color={'red'} sx={{cursor:'pointer'}} onClick={handleOpen}>Forgot Password ?</Typography>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Forget Password
                    </Typography>

                    <Box marginY={2} >
                        <TextField type='email'  label="your@example.com" variant="outlined" fullWidth />
                    </Box>

                    <Box textAlign='center'>
                        <Link to="/otp">
                        <Button variant='contained' >Send Otp</Button>
                        </Link>
                    </Box>

                </Box>
            </Modal>
        </Box>
    );
}
