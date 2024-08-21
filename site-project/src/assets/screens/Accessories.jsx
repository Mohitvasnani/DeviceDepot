import React from 'react'
import ProductFilter from '../components/Productfilter'
import '../css/Productcard.css'
function Accessories() {
  return (
    <>
    <div className='accessories-container'>

    <div className='accessories-header'>
      <h3>Accessories</h3>
    </div>
    <div>

      <ProductFilter category={"accessories"}/>
    </div>
    </div>
    </>
  )
}

export default Accessories
