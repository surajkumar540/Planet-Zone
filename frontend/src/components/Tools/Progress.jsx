import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

const steps = [
  'Select Shipping address',
  'Choose Payment Method',
];

export default function Progress({currentStep}) {
  const [step,setStep]=useState(0)
  useEffect(()=>{
    setStep(currentStep)
  },[])

  return (
    <Box sx={{ width: '100%',my:'3rem' }}>
      <Stepper activeStep={step} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}