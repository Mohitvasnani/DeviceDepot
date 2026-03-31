import React from 'react'
import ProductFilter from '../components/Productfilter'

function Mobiles() {
  return (
    <div className='accessories-container'>
      <div className='accessories-header'>
        <h3>Mobiles</h3>
      </div>
      <div>
        <ProductFilter category={"mobile"} />
      </div>
    </div>
  )
}

export default Mobiles