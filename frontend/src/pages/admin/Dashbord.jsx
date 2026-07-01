import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./Dashboard.css";
import { useQuery } from "@tanstack/react-query";



const Dashboard = () => {
  const [data, setData] = useState({
    categories: 0,

  });
  const [loading, setLoading] = useState(true);

  const { data: sellerdata, isLoading, isError } = useQuery({
    queryKey: ["seller-list"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/seller/seller-list`
      );
      return res.data;
    },
  })
   const totalSellers = sellerdata?.data?.length || 0;
  

     const { data: order, } = useQuery({
    queryKey: ["orderkey"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/getOrderList`
      );
      return res.data;
    },
  })
  
   const orderdata = order?.orders?.length || 0;

    const { data: productlist, } = useQuery({
    queryKey: ["productlistkey"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/getProductList`
      );
      return res.data;
    },
  })
   const productlistdata = productlist?.products?.length || 0;


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [categoryRes, sellerRes, orderRes, productRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/admindata/getCategory`),
 
        ]);

        setData({
          categories: categoryRes.data.length || 0,

        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <AdminLayout page="dashboard">
      <section className="admin-dashboard py-5">
        <div className="container">
          <h3>Admin Dashboard</h3>

          {/* Stats Cards */}
          {loading ? (
            <p className="text-center text-muted">Loading data...</p>
          ) : (
            <div className="row g-4 mb-5">
              <div className="col-md-3">
                <div className="dashboard-card light-blue">
                  <h6>Total Categories</h6>
                  <h2>{data.categories}</h2>
                  <p className="small mb-0">All store categories</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="dashboard-card light-green">
                  <h6>Total Sellers</h6>
                  <h2>{totalSellers}</h2>
                  <p className="small mb-0">Registered vendors</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="dashboard-card light-yellow">
                  <h6>Total Orders</h6>
                  <h2>{orderdata}</h2>
                  <p className="small mb-0">Customer purchases</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="dashboard-card light-purple">
                  <h6>Total Products</h6>
                  <h2>{productlistdata}</h2>
                  <p className="small mb-0">Active listings</p>
                </div>
              </div>
            </div>
          )}

          {/* Table Section (Recent Orders) */}
          <div className="classic-table-container "   >
            <h4 className="mb-4 text-center">Seller List </h4>

            {/* Sample: using orders for recent */}
            {sellerdata?.data?.length === 0 ? (
              <p className="text-center text-muted">No orders found.</p>
            ) : (
              <table className="classic-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Order ID</th>
                    <th>Seller Name</th>
                    <th>Email</th>
                   
                   
                  </tr>
                </thead>
                <tbody>
                  {/* This is static demo row — replace when order data is available */}
                  {sellerdata?.data?.map((data) => (
                    <tr key={data._id} >
                        <td></td>
                      <td>{data._id}</td>
                      <td>{data.name}</td>
                      <td>{data.email}</td>
                      
                  
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default Dashboard;
