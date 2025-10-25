import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SellerLayout from "./SellerLayout";
import { image } from "./image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useQuery } from "@tanstack/react-query";
import Barcode from "react-barcode";

const SellerEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;

  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    brand: "",
    price: "",
    offerPrice: "",
    unit: "",
    stock: "",
    barcode: "",
  });
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  // Fetch categories
  const { data: categories, isLoading: isCategoryLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/api/admindata/Category`);
      return data.categories || [];
    },
  });

  // Fetch brands
  const { data: brands, isLoading: isBrandLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/api/brand`);
      return data.brands || [];
    },
  });

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${API}/api/product/${id}`);
        if (!data.success || !data.product) {
          toast.error("❌ Failed to fetch product");
          setLoading(false);
          return;
        }

        const p = data.product;

        setForm({
          name: p.name,
          description: Array.isArray(p.description) ? p.description.join("\n") : p.description,
          category: p.category || "",
          subcategory: p.subcategory || "",
          brand: p.brand || "",
          price: p.price,
          offerPrice: p.offerPrice,
          unit: p.unit,
          stock: p.stock,
          barcode: p.barcode || "",
        });

        setFiles(p.image || []);

        // Fetch subcategories for existing category
        if (p.category) {
          const { data: subData } = await axios.get(`${API}/api/subcategory/byCategory/${p.category}`);
          if (subData.success) setSubcategories(subData.subCategories || []);
        }
      } catch (err) {
        console.error("Fetch product error:", err);
        toast.error("❌ Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const productData = {
        ...form,
        description: form.description.split("\n"),
      };

      const formData = new FormData();
      formData.append("productData", JSON.stringify(productData));

      files.forEach((file) => {
        if (file instanceof File) formData.append("images", file);
      });

      const { data } = await axios.put(`${API}/api/product/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        toast.success("✅ Product updated successfully");
        setTimeout(() => navigate("/SellerProductList"), 1500);
      } else {
        toast.error("❌ Failed to update product");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  // Barcode download function
  const downloadBarcode = () => {
    const svg = document.querySelector("#barcode svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = pngFile;
      link.download = `${form.barcode}.png`;
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgStr);
  };

  if (loading || isCategoryLoading) return <p>Loading product...</p>;

  return (
    <SellerLayout page="edit-product">
      <div className="card product-card">
        <h4>Edit Product</h4>
        <form onSubmit={handleSubmit}>
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

            <select
              name="brand"
              className="form-select"
              value={form.brand} // ID stored
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                -- Select Brand --
              </option>
              {!isBrandLoading &&
                brands?.length > 0 &&
                brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} {/* Name displayed */}
                  </option>
                ))}
            </select>
          </div>

          {/* Category + Subcategory */}
          <div className="form-row mt-2">
            <select
              name="category"
              className="form-select"
              value={form.category} // ID stored
              onChange={(e) => {
                handleChange(e);
                const catId = e.target.value;
                if (catId) {
                  axios
                    .get(`${API}/api/subcategory/byCategory/${catId}`)
                    .then((res) => {
                      if (res.data.success) setSubcategories(res.data.subCategories || []);
                      setForm((prev) => ({ ...prev, subcategory: "" })); // reset subcategory
                    })
                    .catch((err) => console.error(err));
                } else {
                  setSubcategories([]);
                  setForm((prev) => ({ ...prev, subcategory: "" }));
                }
              }}
              required
            >
              <option value="" disabled>
                -- Select Category --
              </option>
              {!isCategoryLoading &&
                categories?.length > 0 &&
                categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {/* display name */}
                  </option>
                ))}
            </select>

            <select
              name="subcategory"
              className="form-select"
              value={form.subcategory} // ID stored
              onChange={handleChange}
              required
              disabled={!form.category || subcategories.length === 0}
            >
              <option value="" disabled>
                -- Select Subcategory --
              </option>
              {subcategories.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} {/* display name */}
                </option>
              ))}
            </select>
          </div>

          {/* Barcode */}
          <div className="form-row mt-2">
            <input type="text" className="form-input" value={form.barcode} readOnly />
          </div>

          {form.barcode && (
            <div className="mt-2 text-center" id="barcode">
              <Barcode value={form.barcode} />
              <button
                type="button"
                className="btn btn-secondary mt-2"
                onClick={downloadBarcode}
              >
                Download Barcode
              </button>
            </div>
          )}

          {/* Description */}
          <textarea
            name="description"
            className="form-textarea mt-2"
            rows={4}
            placeholder="Product Description"
            value={form.description}
            onChange={handleChange}
            required
          />

          {/* Price + Offer */}
          <div className="form-row mt-2">
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
          <div className="form-row mt-2">
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

          <button type="submit" className="btn btn-primary w-100 mt-4" disabled={isPending}>
            {isPending ? "Updating..." : "Update Product"}
          </button>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </SellerLayout>
  );
};

export default SellerEditProduct;
