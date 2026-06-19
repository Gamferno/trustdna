import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { verifyStepUp } from '../utils/api';
import { IconFingerprint, IconMail, IconCamera, IconCheck } from '../components/Icons.jsx';

const VERIFY_CONFIG = {
  fingerprint: {
    title: 'Verify with Fingerprint',
    instruction: 'Place your finger on the sensor or use fingerprint authentication',
    processingText: 'Scanning fingerprint...',
    successText: 'Fingerprint verified!',
    Icon: IconFingerprint,
  },
  email: {
    title: 'Verify via Email',
    instruction: 'We sent a 6-digit code to om****@gmail.com',
    processingText: 'Verifying code...',
    successText: 'Email verified!',
    Icon: IconMail,
  },
  selfie: {
    title: 'Verify with Video Selfie',
    instruction: "We'll match this to your ID photo on file",
    processingText: 'Analyzing face match...',
    successText: 'Face verified! 99% match with ID photo.',
    Icon: IconCamera,
  },
};

export default function VerificationPage() {
  const { method } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState('idle');
  const [countdown, setCountdown] = useState(5);
  const [otpCode, setOtpCode] = useState('');
  const sessionToken = location.state?.sessionToken;

  const config = VERIFY_CONFIG[method] || VERIFY_CONFIG.fingerprint;
  const MethodIcon = config.Icon;

  const handleStart = () => {
    if (method === 'selfie') {
      setStep('recording');
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setStep('processing');
            setTimeout(() => completeVerification(), 1000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setStep('processing');
      setTimeout(() => completeVerification(), 1000);
    }
  };

  const handleOtpSubmit = () => {
    if (otpCode.length >= 6) {
      setStep('processing');
      setTimeout(() => completeVerification(), 1000);
    }
  };

  const completeVerification = async () => {
    try {
      const data = await verifyStepUp(sessionToken, method);
      setStep('success');

      setTimeout(() => {
        navigate('/dashboard', {
          state: { sessionToken: data.new_session_token || sessionToken },
        });
      }, 2000);
    } catch (err) {
      console.error(err);
      setStep('idle');
    }
  };

  if (!sessionToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light">
        <button onClick={() => navigate('/')} className="text-navy underline">
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-border p-8 text-center animate-slide-down">
        <div className="flex justify-center mb-4">
          <MethodIcon size={52} color="#1A3A52" />
        </div>
        <h2 className="font-display font-bold text-2xl text-navy mb-2">{config.title}</h2>

        {step === 'idle' && (
          <>
            {method === 'selfie' ? (
              <div className="mb-6">
                <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center mb-4">
                  <IconCamera size={48} color="#1A3A52" opacity="0.3" />
                </div>
                <p className="text-sm text-navy/60 mb-6">{config.instruction}</p>
                <button
                  onClick={handleStart}
                  className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-navy hover:bg-navy/90 transition active:scale-[0.98]"
                >
                  Start Recording
                </button>
              </div>
            ) : method === 'email' ? (
              <div className="mb-6">
                <p className="text-sm text-navy/60 mb-1">{config.instruction}</p>
                <div className="flex justify-center gap-2 my-6">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-border rounded-lg focus:border-orange-accent focus:outline-none transition"
                      value={otpCode[i] || ''}
                      onChange={(e) => {
                        const newCode = otpCode.split('');
                        newCode[i] = e.target.value;
                        const joined = newCode.join('');
                        setOtpCode(joined);
                        if (joined.length >= 6) handleOtpSubmit();
                      }}
                      onKeyUp={(e) => {
                        if (e.key === 'Backspace' && !otpCode[i] && i > 0) {
                          const prev = document.querySelector(`input:nth-child(${i})`);
                          if (prev) prev.focus();
                        }
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleOtpSubmit}
                  disabled={otpCode.length < 6}
                  className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-navy hover:bg-navy/90 transition active:scale-[0.98] disabled:opacity-30"
                >
                  Verify Code
                </button>
                <p className="text-xs text-navy/30 mt-4">Didn't receive? Resend in 45s</p>
              </div>
            ) : (
              <div className="mb-6">
                <div className="my-8 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-orange-accent/10 flex items-center justify-center animate-pulse-slow">
                    <IconFingerprint size={44} color="#FF6B35" />
                  </div>
                </div>
                <p className="text-sm text-navy/60 mb-6">{config.instruction}</p>
                <button
                  onClick={handleStart}
                  className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-navy hover:bg-navy/90 transition active:scale-[0.98]"
                >
                  Authenticate
                </button>
              </div>
            )}

            <div className="flex gap-3 text-xs">
              {method !== 'fingerprint' && (
                <button
                  onClick={() => navigate(`/verify/fingerprint`, { state: { sessionToken } })}
                  className="flex-1 py-2 rounded-lg border border-border text-navy/50 hover:text-orange-accent hover:border-orange-accent/30 transition"
                >
                  Use Fingerprint
                </button>
              )}
              {method !== 'email' && (
                <button
                  onClick={() => navigate(`/verify/email`, { state: { sessionToken } })}
                  className="flex-1 py-2 rounded-lg border border-border text-navy/50 hover:text-orange-accent hover:border-orange-accent/30 transition"
                >
                  Use Email
                </button>
              )}
              {method !== 'selfie' && (
                <button
                  onClick={() => navigate(`/verify/selfie`, { state: { sessionToken } })}
                  className="flex-1 py-2 rounded-lg border border-border text-navy/50 hover:text-orange-accent hover:border-orange-accent/30 transition"
                >
                  Use Selfie
                </button>
              )}
            </div>
          </>
        )}

        {step === 'recording' && (
          <div className="mb-6">
            <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center mb-4 relative">
              <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-alert-red animate-pulse" />
              <IconCamera size={48} color="#1A3A52" opacity="0.3" />
            </div>
            <p className="font-display font-bold text-5xl text-orange-accent">{countdown}</p>
          </div>
        )}

        {step === 'processing' && (
          <div className="mb-6 py-8">
            <div className="w-16 h-16 mx-auto border-4 border-orange-accent/20 border-t-orange-accent rounded-full animate-spin mb-4" />
            <p className="text-navy/60 animate-pulse-slow">{config.processingText}</p>
          </div>
        )}

        {step === 'success' && (
          <div className="mb-6 py-8">
            <div className="flex justify-center mb-4">
              <IconCheck size={48} />
            </div>
            <p className="text-trust-green font-semibold text-lg">{config.successText}</p>
            <p className="text-navy/40 text-sm mt-2">Trust Score updated to 98%</p>
            <p className="text-xs text-navy/30 mt-4">Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}
