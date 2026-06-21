import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, LinearProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

export default function NavigationProgress() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, height: 3 }}>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: '0% 50%', height: '100%' }}
          >
            <LinearProgress
              variant="indeterminate"
              sx={{
                height: 3,
                backgroundColor: 'transparent',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #6366f1, #06b6d4, #10b981)',
                },
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
