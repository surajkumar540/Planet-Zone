import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';

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

export default function OtpModal() {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <Box>
            <Button onClick={handleOpen}>Open modal</Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        OTP Verification
                    </Typography>
                    <Typography id="modal-modal-description" fontSize='12px'>
                        check your mail inbox
                    </Typography>

                    <Box marginY={2} >
                        <TextField type='number'  label="Enter the otp" variant="outlined" fullWidth />
                    </Box>

                    <Box textAlign='center'>
                        <Button variant='contained' >verify Otp</Button>
                    </Box>

                </Box>
            </Modal>
        </Box>
    );
}
