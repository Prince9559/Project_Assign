//frontend/utils/alertService


import Swal from 'sweetalert2';

// Reusable base config
const baseConfig = {
  showConfirmButton: true,
  confirmButtonText: 'OK',
  customClass: {
    popup: 'swal2-border-radius',
    confirmButton: 'swal2-confirm-btn',
  },
  willOpen: () => {
    // Optional: add focus or analytics
  },
};

export const showProfileIncompleteAlert = (userRole) => {
  return Swal.fire({
    ...baseConfig,
    icon: 'info',
    title: 'Complete Your Profile!',
    text: 'Please fill in your account details before exploring other sections.',
    // showCancelButton: true,
    // confirmButtonText: 'Go to Setup',
    // cancelButtonText: 'Okay',
    reverseButtons: true,
    customClass: {
      ...baseConfig.customClass,
      cancelButton: 'swal2-cancel-btn',
    },
  });
};

//  Success alert
export const showSuccessAlert = (title = 'Success!', text = '') => {
  return Swal.fire({
    ...baseConfig,
    icon: 'success',
    title,
    text,
    timer: 2000, // auto-close after 2 seconds
    timerProgressBar: true,
    showConfirmButton: false, // auto-close, no button needed
  });
};

// Error alert
export const showErrorAlert = (title = 'Error!', text = '') => {
  return Swal.fire({
    ...baseConfig,
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Try Again',
  });
};

// Warning (non-blocking UX)
export const showWarningAlert = (title = 'Notice', text = '') => {
  return Swal.fire({
    ...baseConfig,
    icon: 'warning',
    title,
    text,
    confirmButtonText: 'OK',
  });
};