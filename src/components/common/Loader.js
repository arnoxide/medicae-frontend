import React from 'react';
import { useLoader } from '../../context/LoaderContext';
import loaderGif from '../../assets/images/loader.gif';
import '../../styles/Loader.css';


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