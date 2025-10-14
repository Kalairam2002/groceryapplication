import { useState } from "react";
import axios from "axios";
import SellerLayout from "./SellerLayout";
import "./SellerDashboard.css";
import { image } from "./image";
import Barcode from "react-barcode"; // ✅ install with: npm install react-barcode
import {useQuery} from '@tanstack/react-query';

const SellerAddProduct = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [Category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [stock, setStock] = useState("");
  const [Brand, setBrand] = useState("");

  const{data:categorydata,isLoading} = useQuery({
    queryKey:['categorydatakey'],
    queryFn: async()=>{
      const {data} = await axios.get(`${process.env.REACT_APP_API_URL}/api/admindata/getCategory`);
      return data;
    }
  })

  // ✅ barcode states
  const [barcodeOption, setBarcodeOption] = useState("manual"); // manual | auto
  const [barcode, setBarcode] = useState("");

  const [isPending, setIsPending] = useState(false);

  // generate unique barcode
  const generateBarcode = () =>
    "BC" + Date.now() + Math.floor(1000 + Math.random() * 9000);

  // download barcode as SVG
  const handleDownload = () => {
    const svg = document.querySelector("#barcode svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgData = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${barcode}.svg`;
    link.click();

    URL.revokeObjectURL(url);
  };

  // print barcode
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode</title>
        </head>
        <body style="text-align:center; margin-top:50px;">
          <div>${document.querySelector("#barcode").innerHTML}</div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); }
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsPending(true);

    try {
      let finalBarcode = barcode;

      if (barcodeOption === "auto" && !barcode) {
        finalBarcode = generateBarcode();
        setBarcode(finalBarcode); // show it in preview
      }

      const productData = {
        name,
        description: description.split("\n"),
        price,
        offerPrice,
        unit,
        stock,
        brand: Brand,
        Category,
        barcode: finalBarcode,
      };

      const formData = new FormData();
      formData.append("productData", JSON.stringify(productData));
      files.forEach((file) => formData.append("images", file));

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/product/add`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
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
        setBrand("");
        setCategory("");
        setBarcode("");
        setBarcodeOption("manual");
      }
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <SellerLayout page="add-product">
      <div className="card product-card">
        <h4>Add New Product</h4>
        <form onSubmit={onSubmitHandler}>
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
                      src={
                        files[index]
                          ? URL.createObjectURL(files[index])
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="text"
              className="form-input"
              placeholder="Brand Name"
              value={Brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
          </div>

          {/* ✅ Barcode Options */}
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
                    const autoCode = generateBarcode();
                    setBarcode(autoCode);
                  }}
                />
                Auto Generate
              </label>
            </div>
          </div>

          {/* Show input if manual */}
          {barcodeOption === "manual" && (
            <div className="form-row">
              <input
                type="text"
                className="form-input"
                placeholder="Enter Barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
            </div>
          )}

          {/* ✅ Barcode Preview & Download/Print */}
          {barcode && (
            <div className="mt-3 text-center" id="barcode">
              <Barcode value={barcode} />
              <div style={{ marginTop: "10px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleDownload}
                >
                  Download
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  style={{ marginLeft: "10px" }}
                  onClick={handlePrint}
                >
                  Print
                </button>
              </div>
            </div>
          )}

          {/* Description */}
          <textarea
            className="form-textarea"
            rows={4}
            placeholder="Product Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          {/* Price + Offer */}
          <div className="form-row">
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
          <div className="form-row">
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

          {/* Category */}
          <select
            className="form-select mt-2"
            value={Category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="" disabled>
              -- Select Category --
            </option>
              {!isLoading && categorydata && categorydata.length > 0 ? (
                categorydata.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))
              ) : (
                <option className="text-lg-center">No data Available </option>
              )}
            {isLoading && <option>Loading...</option>}
            
          </select>

          {/* Submit */}
          <button
            className="btn btn-primary w-100"
            style={{ marginTop: "40px" }}
            disabled={isPending}
          >
            {isPending ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>
    </SellerLayout>
  );
};

export default SellerAddProduct;
