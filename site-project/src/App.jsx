import { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './assets/components/Navbar';
import Footer from './assets/components/Footer';
import LoginRegisterPage from './assets/screens/Login_registerpage';
import Home from './assets/screens/Home';
import Aboutus from './assets/screens/Aboutus';
import Productdisplay from './assets/screens/Productdisplay';
import Admindashboard from './assets/admin/Admindashboard';

import Cart from './assets/screens/Cart';
import Accessories from './assets/screens/Accessories';
import Mobiles from './assets/screens/Mobiles';
import Laptops from './assets/screens/Laptops';
import { ProductsProvider } from './assets/components/Productcontext';
import EnterEmail from './assets/components/EnterEmail';
import EnterNewPassword from './assets/components/EnterNewPassword';
import EnterOTP from './assets/components/EnterOTP';

import ViewLikedItems from './assets/screens/ViewLikedItems';
import TrackOrders from './assets/user/Trackorders';
import ManageProducts from './assets/admin/Manageproducts';
import ViewOrders from './assets/admin/Vieworders';
import Viewproducts from './assets/admin/Viewproducts';
import CreateBanner from './assets/admin/Createbanner';
import ManageBanners from './assets/admin/Managebanner';
import AddProducts from './assets/admin/Addproducts';
import Userdashboard from './assets/user/Userdashboard';
import UserProfile from './assets/user/UserProfile';

function App() {
  const [userCount, setUserCount] = useState(0);

  return (
    <div className='appf'>

    
    <ProductsProvider>
      <Router>
        <Navbar  />
        <Routes>
          <Route path='/loginregister' element={<LoginRegisterPage />}></Route>
          <Route path='/home' element={<Home />}></Route>
          <Route path='/about' element={<Aboutus />}></Route>
          <Route path="/admin/*" element={<Admindashboard setUserCount={setUserCount} userCount={userCount} />}>
            <Route path="mngproducts" element={<ManageProducts />} />
            <Route path="vieworders" element={<ViewOrders />} />
            <Route path="viewusers" element={<Viewproducts />} />
            <Route path="addbanner" element={<CreateBanner />} />
            <Route path="mngbanner" element={<ManageBanners />} />
            <Route path="addproduct" element={<AddProducts />} />
          </Route>
          <Route path='/cart' element={<Cart />}></Route>
          <Route path='/accessories' element={<Accessories />}></Route>
          <Route path='/mobile' element={<Mobiles />}></Route>
          <Route path='/laptop' element={<Laptops />}></Route>
          <Route path='/userdash/*' element={<Userdashboard />}>
            <Route path="userprofile" element={<UserProfile />} />
            <Route path="trackorder" element={<TrackOrders />} />
          </Route>
          <Route path='/view-product' element={<Productdisplay />}></Route>
          <Route path="/enter-email" element={<EnterEmail />} />
          <Route path="/enter-otp" element={<EnterOTP />} />
          <Route path="/enter-new-password" element={<EnterNewPassword />} />
          <Route path="/liked-items" element={<ViewLikedItems />} />
        </Routes>
        <Footer />
      </Router>
    </ProductsProvider>
    </div>
  );
}

export default App;
