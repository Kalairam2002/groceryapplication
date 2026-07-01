import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "../../context/AppContext";
import { useState } from "react";
import { assets, categories } from "../../assets/assets";

import React from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export const Subcategorylist = () => {

  const { axios } = useAppContext();
    const {
      data: getcategoryList,

    } = useQuery({
      queryKey: ["categoryListkey"],
      queryFn: async () => {
        const res = await axios.get("/api/admindata/getCategory");
        return res.data;
      },
    });
  const {
    data: categoryList,
    isLoading: loading,
    isError: error,
  } = useQuery({
    queryKey: ["subcategoryListkey"],
    queryFn: async () => {
      const res = await axios.get("/api/admindata/getsubCategory");
      return res.data;
    },
  });
  const queryClient = useQueryClient();

  const MySwal = withReactContent(Swal);
  const handleEdit = async (product) => {
    try {
      const res = await axios.get(`/api/admindata/GetsubCategoryData/${product}`);
      const data = res.data;

      MySwal.fire({
        title: <p>Edit Sub Category</p>,
        html: <EditForm initialData={data} />,
        showConfirmButton: false,
        customClass: {
          popup: "swal2-edit-popup",
        },
        width: "auto",
      });
    } catch (err) {
      console.error("Error fetching category:", err);
      Swal.fire("Error", "Unable to fetch category data", "error");
    }
  };



  const EditForm = ({ initialData }) => {
    const [files, setFiles] = useState(initialData?.image || []);
    const [name, setName] = useState(initialData?.name || "");
    const [isPending, setIsPending] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(initialData?.categoryid || "");


    const onSubmitHandler = async (e) => {
      e.preventDefault();
      setIsPending(true); 
      const categoryData = {
        name,
        categoryid: selectedCategoryId,
      };
      // updateCategory(categoryData);
      const formData = new FormData();
      formData.append("categoryData", JSON.stringify(categoryData));
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }

      try {
        await axios.put(
          `/api/admindata/updatesubCategory/${initialData._id}`,
          formData
        );
        Swal.fire("Updated!", "Category updated successfully.", "success");
        queryClient.invalidateQueries(["subcategoryListkey"]);

        // Swal.close();
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Update failed", "error");
      }
      finally {
      setIsPending(false); 
      }
    };

    return (
      <form
        onSubmit={onSubmitHandler}
        className="p-4 md:p-6 space-y-5 max-w-md"
      >
        <div>
          <p className="text-base font-medium">Sub Category Image</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {Array(4)
              .fill("")
              .map((_, index) => (
                <label key={index} htmlFor={`image${index}`}>
                  <input
                    onChange={(e) => {
                      const updatedFiles = [...files];
                      updatedFiles[index] = e.target.files[0];
                      setFiles(updatedFiles);
                    }}
                    name="images"
                    type="file"
                    id={`image${index}`}
                    hidden
                  />
                  <img
                    className="max-w-24 cursor-pointer"
                    src={
                      files[index]
                        ? typeof files[index] === "string"
                          ? files[index]
                          : URL.createObjectURL(files[index])
                        : assets.upload_area
                    }
                    alt="upload"
                  />
                </label>
              ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="Category-name">
            Sub Category Name
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
            {getcategoryList && categoryList.length > 0 ? (
            getcategoryList.map((category) => (
              <option  value={category._id}>
                {category.name}
              </option>
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
            "Update Category"
          )}
        </button>
      </form>
    );
  };

  const deleteAirframe = async ({ deleteid }) => {
    console.log("dldhairm", deleteid);
    const response = await axios.delete(
      `/api/admindata/dldsubCategory/${deleteid}`
    );
    return response.data;
  };
  const useDeleteAirframe = useMutation({
    mutationFn: deleteAirframe,
    onSuccess: () => {
      Swal.fire("Deleted!", "The Main Category has been deleted.", "success");
      queryClient.invalidateQueries(["subcategoryListkey"]);
    },
    onError: (error) => {
      Swal.fire("Error!", "Failed to delete the Category.", "error");
      console.error("Delete error:", error);
    },
  });

  const handleDelete = (deleteid) => {
    
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        useDeleteAirframe.mutate({ deleteid });
      }
    });
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
        <h2 className="pb-4 text-lg font-medium">Sub Category List</h2>
        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="table-auto w-full border-collapse">
            <thead className="bg-gray-100 text-gray-900 text-sm">
              <tr>
                <th className="px-4 py-3 text-left font-semibold w-[40%]">
                  Product
                </th>
                <th className="px-4 py-3 text-left font-semibold w-[30%]">
                  Sub Category Name
                </th>
                <th className="px-4 py-3 text-left font-semibold w-[30%]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {categoryList?.map((product) => (
                <tr
                  key={product._id}
                  className="border-t border-gray-300 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 flex items-center space-x-3">
                    <div className="w-14 h-14 flex-shrink-0 border border-gray-300 rounded p-1 bg-white">
                      <img
                        src={product.image[0]}
                        alt="Product"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <span className="truncate">{product.name}</span>
                  </td>
                  <td className="px-4 py-3 align-middle">{product.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 h-full">
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleEdit(product._id)}
                        className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
