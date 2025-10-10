import { BrowserRouter, Route, Routes } from "react-router-dom";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import HomePageOne from "./pages/HomePageOne";
import HomePageTwo from "./pages/HomePageTwo";
import HomePageThree from "./pages/HomePageThree";
import ShopPage from "./pages/ShopPage";
import ProductDetailsPageOne from "./pages/ProductDetailsPageOne";
import ProductDetailsPageTwo from "./pages/ProductDetailsPageTwo";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AccountPage from "./pages/AccountPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailsPage from "./pages/BlogDetailsPage";
import ContactPage from "./pages/ContactPage";
import PhosphorIconInit from "./helper/PhosphorIconInit";
import VendorPage from "./pages/VendorPage";
import VendorDetailsPage from "./pages/VendorDetailsPage";
import VendorTwoPage from "./pages/VendorTwoPage";
import VendorTwoDetailsPage from "./pages/VendorTwoDetailsPage";
import BecomeSellerPage from "./pages/BecomeSellerPage";
import WishlistPage from "./pages/WishlistPage";
import SellerAuthForm from "./pages/seller/SellerAuthForm";
import SellerAddProduct from "./pages/seller/SellerAddProduct";
import SellerProductList from "./pages/seller/SellerProductList";
import BarcodeScanner from "./pages/seller/BarcodeScanner";
import SellerOrder from "./pages/seller/SellerOrder";
import SellerEditProduct from './pages/seller/SellerEditProduct';
import AdminAuthForm from "./pages/admin/AdminAuthForm";
import ProductList from "./pages/admin/ProductList";
import OrderList from "./pages/admin/OrderList";
import AdminProtectedRoute from "./pages/admin/AdminProtectedRoute";
import SellerProtectedRoute from "./pages/seller/SellerProtectedRoute";
import SellerList from "./pages/admin/SellerList";
import ContactList from "./pages/admin/ContactList";

function App() {
  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <PhosphorIconInit />

      <Routes>
        <Route exact path='/' element={<HomePageOne />} />
        <Route exact path='/index-two' element={<HomePageTwo />} />
        <Route exact path='/index-three' element={<HomePageThree />} />
        <Route exact path='/shop' element={<ShopPage />} />
        <Route
          exact
          path='/product-details'
          element={<ProductDetailsPageOne />}
        />
        <Route
          exact
          path='/product-details-two'
          element={<ProductDetailsPageTwo />}
        />
        <Route exact path='/cart' element={<CartPage />} />
        <Route exact path='/checkout' element={<CheckoutPage />} />
        <Route exact path='/become-seller' element={<BecomeSellerPage />} />
        <Route exact path='/wishlist' element={<WishlistPage />} />
        <Route exact path='/account' element={<AccountPage />} />
        <Route exact path='/blog' element={<BlogPage />} />
        <Route exact path='/blog-details' element={<BlogDetailsPage />} />
        <Route exact path='/contact' element={<ContactPage />} />
        <Route exact path='/vendor' element={<VendorPage />} />
        <Route exact path='/vendor-details' element={<VendorDetailsPage />} />
        <Route exact path='/vendor-two' element={<VendorTwoPage />} />
        <Route
          exact
          path='/vendor-two-details'
          element={<VendorTwoDetailsPage />}
        />
        {/* seller login register */}
       <Route exact path='/seller' element={<SellerAuthForm />} />
       <Route exact path='/selleraddproduct' element={<SellerProtectedRoute><SellerAddProduct /></SellerProtectedRoute>} />
       <Route exact path='/SellerProductList' element={<SellerProtectedRoute><SellerProductList /></SellerProtectedRoute>} />
       <Route exact path='/barcodeScanner' element={<SellerProtectedRoute><BarcodeScanner /></SellerProtectedRoute>} />
       <Route exact path='/sellerOrder' element={<SellerProtectedRoute><SellerOrder /></SellerProtectedRoute>} />
       <Route exact path="/seller/edit-product/:id" element={<SellerProtectedRoute><SellerEditProduct /></SellerProtectedRoute>} />

       {/* Admin login register */}
       <Route exact path='/admin' element={<AdminAuthForm />} />
        <Route exact path='/adminProductList' element={<AdminProtectedRoute><ProductList /></AdminProtectedRoute>} />
        <Route exact path='/adminOrderList' element={<AdminProtectedRoute><OrderList /></AdminProtectedRoute>} />
        <Route exact path='/sellerList' element={<AdminProtectedRoute><SellerList /></AdminProtectedRoute>} />
        <Route exact path='/contactList' element={<AdminProtectedRoute><ContactList /></AdminProtectedRoute>} />
       
       
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;
