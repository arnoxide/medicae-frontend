import React from 'react';
import { useLoader } from './LoaderContext';
import loaderGif from '../assets/images/loader.gif'; // Adjust the path as necessary
import '../styles/Loader.css'; // Create this CSS file for styling


const Loader = () => {
    const { loading } = useLoader();
  
    if (!loading) {
      return null;
    }
  
    return (
      <div className="loader">
        <img src={loaderGif} alt="Loading..." />
      </div>
    );
  };
  
  export default Loader;