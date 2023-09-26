import React, { useState, useEffect } from 'react';
import AlertPopUp from './AlertPopUp';

const AlertHelper = ({ errorMessage, successMessage, setErrorMessage, setSuccessMessage }) => {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (errorMessage || successMessage) {
      setShowAlert(true);
      const timeout = setTimeout(() => {
        setShowAlert(false);
        setErrorMessage("")
        setSuccessMessage("")
      }, 4000);


      return () => {
        clearTimeout(timeout);
      };
    }
  }, [errorMessage, successMessage]);

  const handleHideAlert = () => {
    setShowAlert(false);
  };

  return (
    showAlert ? (
      <AlertPopUp
        condition={errorMessage ? "fail" : "success"}
        content={errorMessage ? errorMessage : successMessage}
        setter={handleHideAlert}
      />
    ) : null
  );
};

export default AlertHelper;