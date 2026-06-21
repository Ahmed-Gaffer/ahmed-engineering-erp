import { Component } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { ErrorOutlineRounded, Home, Refresh } from '@mui/icons-material';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" textAlign="center" px={3}>
          <ErrorOutlineRounded sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} mb={1}>Something went wrong</Typography>
          <Typography variant="body2" color="text.secondary" mb={3} maxWidth={400}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<Home />} onClick={() => window.location.href = '/engineering/dashboard'}>
              Go Home
            </Button>
            <Button variant="contained" startIcon={<Refresh />} onClick={this.handleReset}>
              Try Again
            </Button>
          </Stack>
        </Box>
      );
    }
    return this.props.children;
  }
}
