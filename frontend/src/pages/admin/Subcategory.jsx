import { assets, categories } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

export const Subcategory = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isPending, setIsPending] = useState(false);

  const { axios } = useAppContext();

  const {
    data: categoryList,
    isLoading: loading,
    isError: error,
  } = useQuery({
    queryKey: ["categoryListkey"],
    queryFn: async () => {
      const res = await axios.get("/api/admindata/getCategory");
      return res.data;
    },
  });

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      setIsPending(true);

      const subcategoryData = {
        name,
        categoryid: selectedCategoryId,
      };
      const formData = new FormData();
      formData.append("subcategoryData", JSON.stringify(subcategoryData));
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }

      try {
        const { data } = await axios.post(
          `/api/admindata/addSubCategory`,
          formData
        );

        if (data.success) {
          toast.success("Subcategory added successfully");
          setSelectedCategoryId("");
          setName(" ");
          setFiles([]);
        } else {
          toast.error(data.message || "Failed to add subcategory");
        }
      } catch (error) {
        toast.error(error.message);
        console.error(error.response?.data?.message || error.message);
      } finally {
        setIsPending(false);
      }
    } catch (error) {
      toast.error(error.message);
      console.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <form
        className="md:p-10 p-4 space-y-5 max-w-lg"
        onSubmit={onSubmitHandler}
      >
        <div className="">
          <p className="text-base font-medium">Sub Category Image</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {Array(1)
              .fill("")
              .map((_, index) => (
                <label key={index} htmlFor={`image${index}`}>
                  <input
                    onChange={(e) => {
                      const updatedFiles = [...files];
                      updatedFiles[index] = e.target.files[0];
                      setFiles(updatedFiles);
                    }}
                    type="file"
                    id={`image${index}`}
                    hidden
                  />

                  <img
                    className="max-w-24 cursor-pointer"
                    src={
                      files[index]
                        ? URL.createObjectURL(files[index])
                        : assets.upload_area
                    }
                    alt="uploadArea"
                    width={100}
                    height={100}
                  />
                </label>
              ))}
          </div>
        </div>
        <div className="flex flex-col gap-1 max-w-md ">
          <label className="text-base font-medium" htmlFor="Category-name">
            SubCategory Name
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            id="Category-name"
            type="text"
            value={name}
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            required
          />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="category-select">
            Choose Category Name
          </label>
          <select
            id="category-select"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            required
          >
            <option value="" disabled>
              -- Select Category --
            </option>
            {categoryList && categoryList.length > 0 ? (
              categoryList.map((category) => (
                <option value={category._id}>{category.name}</option>
              ))
            ) : (
              <option disabled>Loading...</option>
            )}
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={`px-8 py-2.5 rounded cursor-pointer flex items-center justify-center gap-2
          ${
            isPending ? "bg-green-400" : "bg-green-500"
          } text-white font-medium transition duration-300`}
        >
          {isPending ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              Loading...
            </>
          ) : (
            "ADD"
          )}
        </button>
      </form>
    </div>
  );
};
