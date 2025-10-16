export async function fetchWithAuth(url, options = {}) {
  let token = localStorage.getItem('token');

  // If the request body is FormData, do NOT set Content-Type: the browser
  // will add the correct multipart/form-data boundary automatically.
  const isFormData = options && options.body instanceof FormData;

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    // Only set JSON content-type for non-FormData requests when not provided
    ...(isFormData ? {} : { 'Content-Type': (options.headers && options.headers['Content-Type']) || 'application/json' }),
  };

  let response = await fetch(url, { ...options, headers });

  // If access token expired → try refresh
  if (response.status === 401) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.message === 'Invalid or expired access token') {
        console.log('Access token expired, trying to refresh...');
      // Try refresh
      const refreshRes = await fetch('http://localhost:5000/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include', // important for refresh cookie
      });

      if (refreshRes.ok) {
        const { accessToken } = await refreshRes.json();
        localStorage.setItem('token', accessToken);

        // retry original request with new token
        const isFormDataRetry = options && options.body instanceof FormData;
        const retryHeaders = {
          ...(options.headers || {}),
          Authorization: `Bearer ${accessToken}`,
          ...(isFormDataRetry ? {} : { 'Content-Type': (options.headers && options.headers['Content-Type']) || 'application/json' }),
        };

        return fetch(url, { ...options, headers: retryHeaders });
      } else {
        // refresh also failed → log out user
        // localStorage.removeItem('token');
        // window.location.href = '/login';
        console.error('Session expired. Please log in again.');
      }
    }
  }
  return response;
}