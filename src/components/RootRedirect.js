import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

const RootRedirect = () => {
  const [firstPageId, setFirstPageId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFirstPage = async () => {
      try {
        const response = await fetch('/api/pages');
        const pages = await response.json();
        if (pages.length > 0) {
          const sortedPages = pages.sort((a, b) => a.display_order - b.display_order);
          setFirstPageId(sortedPages[0].id);
        }
      } catch (error) {
        console.error('Error fetching pages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFirstPage();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (firstPageId) {
    return <Navigate to={`/page/${firstPageId}`} replace />;
  }

  // If no pages exist, show a message or redirect to config
  return <Navigate to="/config" replace />;
};

export default RootRedirect;