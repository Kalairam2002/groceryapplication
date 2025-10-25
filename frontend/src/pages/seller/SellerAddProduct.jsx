import { useState, useEffect } from "react";
import axios from "axios";
import SellerLayout from "./SellerLayout";
import "./SellerDashboard.css";
import { image } from "./image";
import Barcode from "react-barcode";
import { useQuery } from "@tanstack/react-query";

const SellerAddProduct = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [Category, setCategory] = useState("");
  const [Subcategory, setSubcategory] = useState("");
  const [Brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [stock, setStock] = useState("");

  // Barcode states
  const [barcodeOption, setBarcodeOption] = useState("manual");
  const [barcode, setBarcode] = useState("");
  const [isPending, setIsPending] = useState(false);

  // Fetch categories
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["categoryData"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admindata/getCategory`
      );
      return data; // array of categories
    },
  });

  // Fetch brands
  const { data: brandData, isLoading: brandLoading } = useQuery({
    queryKey: ["brandData"],
    queryFn: async () => {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/brand`);
      return data.brands;
    },
  });

  // Subcategories based on selected category
  const [subcategories, setSubcategories] = useState([]);
  useEffect(() => {
    if (!Category) return setSubcategories([]);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/subcategory/byCategory/${Category}`)
      .then((res) => {
        if (res.data.success) setSubcategories(res.data.subCategories);
      })
      .catch((err) => console.error(err));
  }, [Category]);

  // Generate unique barcode
  const generateBarcode = () =>
    "BC" + Date.now() + Math.floor(1000 + Math.random() * 9000);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);

    try {
      let finalBarcode = barcode;

      if (barcodeOption === "auto" && !barcode) {
        finalBarcode = generateBarcode();
        setBarcode(finalBarcode); // preview
      }

      const productData = {
        name,
        description: description.split("\n"),
        price,
        offerPrice,
        unit,
        stock,
        brand: Brand, // ✅ store brand ID
        category: Category, // ✅ store category ID
        subcategory: Subcategory, // ✅ store subcategory ID
        barcode: finalBarcode,
      };

      const formData = new FormData();
      formData.append("productData", JSON.stringify(productData));
      files.forEach((file) => formData.append("images", file));

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/product/add`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );

      alert(data.message);
      if (data.success) {
        setName("");
        setDescription("");
        setPrice("");
        setOfferPrice("");
        setUnit("");
        setStock("");
        setFiles([]);
        setCategory("");
        setSubcategory("");
        setBrand("");
        setBarcode("");
        setBarcodeOption("manual");
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <SellerLayout page="add-product">
      <div className="card product-card">
        <h4>Add New Product</h4>
        <form onSubmit={handleSubmit}>
          {/* Upload Images */}
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
                      src={files[index] ? URL.createObjectURL(files[index]) : image.upload_area}
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <select
              className="form-select"
              value={Brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            >
              <option value="" disabled>
                -- Select Brand --
              </option>
              {!brandLoading &&
                brandData?.length > 0 &&
                brandData.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Barcode Options */}
          <div className="form-group mt-2">
            <label>Barcode Option</label>
            <div className="form-row">
              <label>
                <input
                  type="radio"
                  value="manual"
                  checked={barcodeOption === "manual"}
                  onChange={(e) => setBarcodeOption(e.target.value)}
                />
                Manual
              </label>
              <label style={{ marginLeft: "20px" }}>
                <input
                  type="radio"
                  value="auto"
                  checked={barcodeOption === "auto"}
                  onChange={(e) => {
                    setBarcodeOption(e.target.value);
                    setBarcode(generateBarcode());
                  }}
                />
                Auto Generate
              </label>
            </div>
          </div>

          {barcodeOption === "manual" && (
            <input
              type="text"
              className="form-input mt-1"
              placeholder="Enter Barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
          )}

          {barcode && (
            <div className="mt-2 text-center" id="barcode">
              <Barcode value={barcode} />
            </div>
          )}

          {/* Category + Subcategory */}
          <div className="form-row mt-2">
            <select
              className="form-select"
              value={Category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>
                -- Select Category --
              </option>
              {!categoryLoading &&
                categoryData?.length > 0 &&
                categoryData.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
            </select>

            <select
              className="form-select"
              value={Subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              required
              disabled={!Category || subcategories.length === 0}
            >
              <option value="" disabled>
                -- Select Subcategory --
              </option>
              {subcategories.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <textarea
            className="form-textarea mt-2"
            rows={4}
            placeholder="Product Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          {/* Price + Offer */}
          <div className="form-row mt-2">
            <input
              type="number"
              className="form-input"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <input
              type="number"
              className="form-input"
              placeholder="Offer Price"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
            />
          </div>

          {/* Unit + Stock */}
          <div className="form-row mt-2">
            <input
              type="text"
              className="form-input"
              placeholder="Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            />
            <input
              type="number"
              className="form-input"
              placeholder="Stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary w-100 mt-4" disabled={isPending}>
            {isPending ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>
    </SellerLayout>
  );
};

export default SellerAddProduct;
