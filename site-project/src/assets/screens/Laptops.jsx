import React from 'react'
import ProductFilter from '../components/Productfilter'

function Laptops() {
  return (
    <>
      <ProductFilter category={"laptops"}/>
    </>
  )
}

export default Laptops
































































// import axios from 'axios';
// import React, { useEffect, useState } from 'react'
// import {useNavigate} from 'react-router-dom'

// function Laptops() {
//     const [likedProducts, setLikedProducts] = useState({});
//     const [cartProducts, setCartProducts] = useState({});
//     const [filter, setFilter] = useState('laptops')
//     const [products, setProducts] = useState([])
//     const navigate = useNavigate();
//     useEffect(() => {
//         fetchProducts()
//     }, [])

//     const toggleLike = (productId) => {
//         setLikedProducts(prevState => ({
//             ...prevState,
//             [productId]: !prevState[productId],
//         }));
//     };

//     const toggleCart = (productId) => {
//         setCartProducts(prevState => ({
//             ...prevState,
//             [productId]: !prevState[productId],
//         }));
//     };

//     const fetchProducts = () =>{
//         axios.get('http://localhost:8080/api/product/allproducts')
//         .then(response=>{
//             setProducts(response.data)
//         }).catch(error=>{
//             console.log(error);
//         })
//         // try {
//         //     const response = axios.get('http://localhost:8080/api/product/allproducts')
//         //     setProducts(response.data)
//         // } catch (error) {
            
//         // }
//     }

//     const filterProducts = products.filter(product=>product.categories === filter)
//     const handleClick = (product)=>{
//         navigate('/view-product', {state:{productData: product}})
//     }

    

//   return (
//     <>
//       <div className="home_display_card text-dark d-flex row row-gap-4 ">
//                 {filterProducts.map((product,index) => (
//                     <div key={index} className="col-lg-3 col-md-6  col-sm-8">
//                         <div className="card h-100 border-0 shadow-sm">
//                             <div className="position-relative">
//                                 <img
//                                     src={product.file}
//                                     className="card-img-top"
//                                     alt="Product"
//                                     style={{ height: '300px', objectFit: 'contain' }}
//                                     onClick={()=>{handleClick(product)}}
//                                 />
//                                 <div className="position-absolute top-0 end-0 p-2">
//                                     <i
//                                         className={`bi ${likedProducts[product.id] ? 'bi-heart-fill' : 'bi-heart'} text-danger fs-4`}
//                                         onClick={() => toggleLike(product.id)}
//                                     ></i>
//                                 </div>
//                             </div>
//                             <div className="card-body d-flex flex-column">
//                                 <div className="position-absolute top-0 start-0 p-2">
//                                     <span className="badge bg-secondary">{product.categories}</span>
//                                 </div>
//                                 <h5 className="card-title">{product.name}</h5>
//                                 <p className="card-text text-muted">{product.description}</p>
//                                 <div className="mt-auto d-flex justify-content-between align-items-center">
//                                     <h4 className="text-danger mb-0">₹{product.price}</h4>
//                                     <i
//                                         className={`bi ${cartProducts[product.id] ? 'bi-cart-fill' : 'bi-cart'} fs-4`}
//                                         onClick={() => toggleCart(product.id)}
//                                     ></i>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//     </>
//   )
// }

// export default Laptops
