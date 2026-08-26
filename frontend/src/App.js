import { BrowserRouter, Route, Routes } from "react-router-dom";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import HomePageOne from "./pages/HomePageOne";
import HomePageTwo from "./pages/HomePageTwo";
import HomePageThree from "./pages/HomePageThree";
import ShopPage from "./pages/ShopPage";
import ShopPagecopy from "./pages/ShopPage";
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
import Billing from "./pages/seller/Billing";
import SellerOrder from "./pages/seller/SellerOrder";
import SellerEditProduct from './pages/seller/SellerEditProduct';
import AdminAuthForm from "./pages/admin/AdminAuthForm";
import ProductList from "./pages/admin/ProductList";
import OrderList from "./pages/admin/OrderList";
import AdminProtectedRoute from "./pages/admin/AdminProtectedRoute";
import SellerProtectedRoute from "./pages/seller/SellerProtectedRoute";
import SellerList from "./pages/admin/SellerList";
import ContactList from "./pages/admin/ContactList";
import Addcategoryone from "./pages/admin/Addcategoryone";
import AdminCategoryList from "./pages/admin/AdminCategoryList";
import SellerProductPage from "./pages/SellerProductPage";
import AddBrand from './pages/admin/AddBrand'
import BrandList from "./pages/admin/BrandList";
import AddAdminSubCategory from './pages/admin/AddAdminSubcategory'
import AdminSubCategoryList from './pages/admin/AdminSubCategoryList'
import AddVariant from './pages/admin/AddVariant'
import VariantList from './pages/admin/VariantList'
import BrandSectionPage from "./pages/BrandSectionPage";
import ShopPageTwo from "./pages/ShopPageTwo";
import Shoppagefour from "./pages/Shoppagefour";
import Shoppagefive from "./pages/Shoppagefive";
import Shoppagesix from "./pages/Shoppagesix";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import AllProductPage from "./pages/AllProductPage";
import Dashbord from "./pages/admin/Dashbord";
import Sellerdashboard from "./pages/seller/Sellerdashboard";
import ResetPassword from "./pages/ResetPassword";
import SellerResetPassword from "./pages/sellerResetPassword";
import AdminResetPassword from "./pages/AdminResetPassword";
import PaymentSuccess from "./components/PaymentSuccess";
import Searchpage from "./pages/Shoppagesreach";
import SellerEditProfile from "./pages/seller/SellerEditProfile";
import UserEditProfile from "./components/userEditProfile";
import SellerExistingProducts from "./pages/seller/SellerExistingProducts"; 
import SellerInvoices from "./pages/seller/SellerInvoices";
import ExpiredVariantsTable from "./pages/seller/ExpiredVariantsTable";
import ReturnPage from "./pages/ReturnPage";
import SellerReturns from "./pages/seller/SellerReturns";
import DeliveryAuth from "./pages/DeliveryAuth";
import DeliveryBoyList from "./pages/DeliveryBoyList";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import DeliveryResetPassword from "./pages/DeliveryResetPassword";
import MyOrdersPage from "./pages/MyOrdersPage";
import AIChatbot from "./components/AIChatbot";
import AdminAddProduct from "./pages/admin/AdminAddProduct";


function App() {
  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <PhosphorIconInit />

      <Routes>
        <Route exact path='/' element={<HomePageOne />} />
        <Route exact path='/index-two' element={<HomePageTwo />} />
        <Route exact path='/index-three' element={<HomePageThree />} />
        <Route exact path='/shop/:id' element={<ShopPage />} />
        <Route exact path='/shop' element={<ShopPagecopy />} />
       
        <Route exact path='/privacy' element={<PrivacyPolicyPage />} />
        <Route exact path='/products' element={<AllProductPage />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route exact path='/seller-details' element={<ProductDetailsPageOne />} />
        <Route path="/seller/:id/products" element={<SellerProductPage />} />
        <Route exact path='/product-details-two' element={<ProductDetailsPageTwo />} />
        <Route exact path='/cart' element={<CartPage />} />
        <Route exact path='/payment-success' element={<PaymentSuccess />} />
        <Route exact path='/checkout' element={<CheckoutPage />} />
        <Route exact path='/become-seller' element={<BecomeSellerPage />} />
        <Route exact path='/wishlist' element={<WishlistPage />} />
        <Route exact path='/account' element={<AccountPage />} />
        <Route path="/edit-profile" element={<UserEditProfile />} />
        <Route exact path='/blog' element={<BlogPage />} />
        <Route exact path='/blog-details' element={<BlogDetailsPage />} />
        <Route exact path='/contact' element={<ContactPage />} />
        <Route exact path='/vendor' element={<VendorPage />} />
        <Route exact path='/vendor-details' element={<VendorDetailsPage />} />
        <Route exact path='/vendor-two' element={<VendorTwoPage />} />
        <Route exact path='/vendor-two-details' element={<VendorTwoDetailsPage />} />
        <Route exact path='/Brand' element={<BrandSectionPage />} />
        <Route exact path='subcategory/:id' element={<ShopPageTwo />} />
        <Route exact path='/brandlist/:id' element={<Shoppagefour />} />
        <Route exact path='/varientlist/:id' element={<Shoppagefive />} />
        <Route exact path='/Productlist/:id' element={<Shoppagesix />} />
        <Route exact path='/searchpage' element={<Searchpage />} />
        <Route exact path='/myorders' element={<MyOrdersPage />} />

        {/* Seller Routes */}
        <Route exact path='/seller' element={<SellerAuthForm />} />
        <Route path="/seller/reset-password/:token" element={<SellerResetPassword />} />
        <Route exact path='/selleraddproduct' element={<SellerProtectedRoute><SellerAddProduct /></SellerProtectedRoute>} />
        <Route exact path='/SellerProductList' element={<SellerProtectedRoute><SellerProductList /></SellerProtectedRoute>} />
        <Route exact path='/barcodeScanner' element={<SellerProtectedRoute><BarcodeScanner /></SellerProtectedRoute>} />
        <Route exact path='/sellerOrder' element={<SellerProtectedRoute><SellerOrder /></SellerProtectedRoute>} />
        <Route exact path="/seller/edit-product/:id" element={<SellerProtectedRoute><SellerEditProduct /></SellerProtectedRoute>} />
        <Route exact path="/seller/billing" element={<SellerProtectedRoute><Billing /></SellerProtectedRoute>} />
        <Route path="/seller/edit-profile" element={<SellerEditProfile />} />
        <Route exact path='/sellerDashboard' element={<SellerProtectedRoute><Sellerdashboard /></SellerProtectedRoute>} />
        {/* New Existing Products Route */}
        <Route exact path='/sellerExistingProducts' element={<SellerProtectedRoute><SellerExistingProducts /></SellerProtectedRoute>} />
        <Route exact path="/seller/invoices" element={<SellerProtectedRoute><SellerInvoices /></SellerProtectedRoute>} />
        <Route exact path="/seller/expired" element={<SellerProtectedRoute><ExpiredVariantsTable /></SellerProtectedRoute>} />
        <Route path="/return/:orderId" element={<ReturnPage />} />
        <Route path="/seller/returns" element={<SellerProtectedRoute><SellerReturns /></SellerProtectedRoute>} />

        
        {/* Admin Routes */}
        <Route exact path='/admin' element={<AdminAuthForm />} />
        <Route path="/admin/reset-password/:token" element={<AdminResetPassword />} />
        <Route exact path='/adminProductList' element={<AdminProtectedRoute><ProductList /></AdminProtectedRoute>} />
        <Route exact path='/adminOrderList' element={<AdminProtectedRoute><OrderList /></AdminProtectedRoute>} />
        <Route exact path='/sellerList' element={<AdminProtectedRoute><SellerList /></AdminProtectedRoute>} />
        <Route exact path='/contactList' element={<AdminProtectedRoute><ContactList /></AdminProtectedRoute>} />
        <Route exact path='/addcategory' element={<AdminProtectedRoute><Addcategoryone /></AdminProtectedRoute>} />
        <Route exact path='/listCategory' element={<AdminProtectedRoute><AdminCategoryList /></AdminProtectedRoute>} />
        <Route exact path='/addBrand' element={<AdminProtectedRoute><AddBrand /></AdminProtectedRoute>} />
        <Route exact path='/listBrand' element={<AdminProtectedRoute><BrandList /></AdminProtectedRoute>} />
        <Route exact path='/addSubCategory' element={<AdminProtectedRoute><AddAdminSubCategory /></AdminProtectedRoute>} />
        <Route exact path='/listSubCategory' element={<AdminProtectedRoute><AdminSubCategoryList /></AdminProtectedRoute>} />
        <Route exact path='/addVariant' element={<AdminProtectedRoute><AddVariant /></AdminProtectedRoute>} />
        <Route exact path='/listVariant' element={<AdminProtectedRoute><VariantList /></AdminProtectedRoute>} />
        <Route exact path='/Dashbord' element={<AdminProtectedRoute><Dashbord /></AdminProtectedRoute>} />
        <Route exact path='/adminAddProduct' element={<AdminProtectedRoute><AdminAddProduct /></AdminProtectedRoute>} />

        {/* Delivery*/}
       <Route path="/delivery/login" element={<DeliveryAuth />} />
       <Route path="/deliveryBoyList" element={<DeliveryBoyList />} />
       <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
       <Route path="/delivery/reset-password/:token" element={<DeliveryResetPassword />} />

      </Routes>

      {/* AI Chatbot */}
      <AIChatbot />
      
    </BrowserRouter>
  );
}

export default App;