import axios from 'axios';
import { useState, useEffect , useCallback} from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export function OtpView() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);

  // Handle countdown timer for resend option
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (timer > 0 && resendDisabled) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer, resendDisabled]);

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    // Allow only digits
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input if current one is filled
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle key press for backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>): void => {
    e.preventDefault();
    const pastedData: string = e.clipboardData.getData('text');
    if (!/^\d+$/.test(pastedData)) return;
    
    const digits: string[] = pastedData.split('').slice(0, 6);
    const newOtp: string[] = [...otp];
    
    digits.forEach((digit: string, index: number) => {
      if (index < 6) newOtp[index] = digit;
    });
    
    setOtp(newOtp);
    
    // Focus the appropriate field after pasting
    if (digits.length < 6) {
      const nextInput: HTMLElement | null = document.getElementById(`otp-input-${digits.length}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle OTP verification
  const handleVerify = useCallback(async () => {
    try {
      setLoading(true);
      const otpString = otp.join('');
      
      if (otpString.length !== 6) {
        alert('Please enter the complete 6-digit OTP');
        setLoading(false);
        return;
      }

      const response = await axios.post("http://localhost:3000/api/auth/verify-otp", {
        otp: otpString
      });

      if (response.data.success) {
        // Store token or session data
        localStorage.setItem("token", response.data.token);
        
        // Navigate to dashboard or home
        router.push("/");
      } else {
        alert(response.data.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("Verification Error:", error.response?.data?.message || error.message);
      alert(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  }, [otp, router]);

  // Handle resend OTP
  const handleResend = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await axios.post("http://localhost:3000/api/auth/resend-otp");
      
      if (response.data.success) {
        setTimer(60);
        setResendDisabled(true);
        alert("OTP has been resent to your email");
      } else {
        alert(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend Error:", error.response?.data?.message || error.message);
      alert(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  }, []);

  const renderForm = (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box 
        display="flex" 
        justifyContent="space-between" 
        width="100%" 
        maxWidth="360px" 
        mb={3}
      >
        {otp.map((digit, index) => (
          <TextField
            key={index}
            id={`otp-input-${index}`}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            inputProps={{
              maxLength: 1,
              style: { 
                textAlign: 'center', 
                fontSize: '1.5rem',
                padding: '8px',
                width: '40px'
              }
            }}
            sx={{ 
              width: '52px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px'
              }
            }}
          />
        ))}
      </Box>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        onClick={handleVerify}
        loading={loading}
        sx={{ mb: 2 }}
      >
        Verify
      </LoadingButton>

      <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
        <Typography variant="body2" color="text.secondary">
          Did not receive the code?
        </Typography>
        {resendDisabled ? (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            Resend in {timer}s
          </Typography>
        ) : (
          <Link
            variant="body2"
            color="inherit"
            sx={{ ml: 1, cursor: 'pointer' }}
            onClick={handleResend}
          >
            Resend
          </Link>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">Verify OTP</Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Enter the 6-digit code we sent to your email
        </Typography>
      </Box>

      {renderForm}
    </>
  );
}