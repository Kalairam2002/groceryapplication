import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SellerLayout from "./SellerLayout";
import { image } from "./image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useQuery } from "@tanstack/react-query";

const SellerEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    Category: "", // ✅ use same field as add product
    price: "",
    offerPrice: "",
    unit: "",
    stock: "",
    brand: "",
    barcode: "",
  });
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  // ✅ Fetch categories
  const { data: categorydata, isLoading: isCategoryLoading, isError: isCategoryError } = useQuery({
    queryKey: ["categorydatakey"],
    queryFn: async () => {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/admindata/getCategory`);
      return data;
    },
  });

  // ✅ Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/product/${id}`);
        if (data.success) {
          const p = data.product;
          setForm({
            name: p.name,
            description: Array.isArray(p.description) ? p.description.join("\n") : p.description,
            Category: typeof p.Category === "object" ? p.Category._id : p.Category || "",
            price: p.price,
            offerPrice: p.offerPrice,
            unit: p.unit,
            stock: p.stock,
            brand: p.brand,
            barcode: p.barcode,
          });
          setFiles(p.image || []);
        }
      } catch (err) {
        toast.error("❌ Failed to fetch product");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // ✅ Handle input changes
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Submit handler
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const productData = {
        ...form,
        Category: form.Category.toString(), // ✅ ensure string
        description: form.description.split("\n"),
      };

      const formData = new FormData();
      formData.append("productData", JSON.stringify(productData));

      files.forEach((file) => {
        if (file instanceof File) formData.append("images", file);
      });

      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/product/update/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data.success) {
        toast.success("✅ Product updated successfully");
        setTimeout(() => navigate("/SellerProductList"), 1500);
      } else toast.error("❌ Failed to update product");
    } catch (err) {
      console.error(err);
      toast.error("❌ Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  if (loading) return <p>Loading product...</p>;

  return (
    <SellerLayout page="edit-product">
      <div className="card product-card">
        <h4>Edit Product</h4>
        <form onSubmit={onSubmitHandler}>
          {/* Images */}
          <div className="form-group">
            <label>Product Images</label>
            <div className="image-upload-container">
              {Array(4)
                .fill("")
                .map((_, index) => (
                  <label key={index} className="image-upload-label">
                    <input
                      type="file"
                      hidden
                      onChange={(e) => {
                        const updatedFiles = [...files];
                        updatedFiles[index] = e.target.files[0];
                        setFiles(updatedFiles);
                      }}
                    />
                    <img
                      src={
                        files[index]
                          ? typeof files[index] === "string"
                            ? files[index]
                            : URL.createObjectURL(files[index])
                          : image.upload_area
                      }
                      alt="upload"
                      className="image-preview"
                    />
                  </label>
                ))}
            </div>
          </div>

          {/* Name + Brand */}
          <div className="form-row">
            <input
              type="text"
              className="form-input"
              placeholder="Product Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              className="form-input"
              placeholder="Brand Name"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              required
            />
          </div>

          {/* Barcode */}
          <div className="form-row">
            <input
              type="text"
              className="form-input"
              placeholder="Barcode"
              name="barcode"
              value={form.barcode}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <textarea
            className="form-textarea"
            rows={4}
            placeholder="Product Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />

          {/* Price + Offer */}
          <div className="form-row">
            <input
              type="number"
              className="form-input"
              placeholder="Price"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              className="form-input"
              placeholder="Offer Price"
              name="offerPrice"
              value={form.offerPrice}
              onChange={handleChange}
            />
          </div>

          {/* Unit + Stock */}
          <div className="form-row">
            <input
              type="text"
              className="form-input"
              placeholder="Unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              className="form-input"
              placeholder="Stock"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </div>

          {/* ✅ Dynamic Category Dropdown */}
          <select
            className="form-select mt-2"
            name="Category"
            value={form.Category}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              -- Select Category --
            </option>

            {isCategoryLoading && <option>Loading...</option>}

            {!isCategoryLoading &&
              categorydata &&
              categorydata.length > 0 &&
              categorydata.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}

            {isCategoryError && <option disabled>Error loading categories</option>}
          </select>

          {/* Buttons */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary w-100 mt-4"
              disabled={isPending}
            >
              {isPending ? "Updating..." : "Update Product"}
            </button>
            <button
              type="button"
              className="btn btn-secondary w-100 mt-2"
              onClick={() => navigate("/SellerProductList")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </SellerLayout>
  );
};

export default SellerEditProduct;
