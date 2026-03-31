import React from 'react'
import ProductFilter from '../components/Productfilter'

function Laptops() {
  return (
    <div className='accessories-container'>
      <div className='accessories-header'>
        <h3>Laptops</h3>
      </div>
      <div>
        <ProductFilter category={"laptop"} />
      </div>
    </div>
  )
}

export default Laptops