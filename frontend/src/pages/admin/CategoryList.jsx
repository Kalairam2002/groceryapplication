import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "../../context/AppContext";
import { useState } from "react";
import { assets } from "../../assets/assets";
import React from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export const CategoryList = () => {
  const { axios } = useAppContext();

  const { data: maincategoryList } = useQuery({
    queryKey: ["maincategoryListkey"],
    queryFn: async () => {
      const res = await axios.get("/api/admindata/getmainCategory");
      return res.data;
    },
  });

  const {
    data: categoryList,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["categoryListkey"],
    queryFn: async () => {
      const res = await axios.get("/api/admindata/getCategory");
      return res.data;
    },
  });

  const queryClient = useQueryClient();
  const MySwal = withReactContent(Swal);

  const handleEdit = async (id) => {
    try {
      const res = await axios.get(`/api/admindata/GetCategoryData/${id}`);
      const data = res.data;
      MySwal.fire({
        title: <p className="font-semibold text-lg">Edit Category</p>,
        html: <EditForm initialData={data} />,
        showConfirmButton: false,
        width: "auto",
        customClass: {
          popup: "swal2-edit-popup",
        },
      });
    } catch (err) {
      Swal.fire("Error", "Unable to fetch category data", "error");
    }
  };

  const EditForm = ({ initialData }) => {
    const [files, setFiles] = useState(initialData?.image || []);
    const [name, setName] = useState(initialData?.name || "");
    const [selectedCategoryId, setSelectedCategoryId] = useState(
      initialData?.maincategory || ""
    );
    const [isPending, setIsPending] = useState(false);

    const onSubmitHandler = async (e) => {
      e.preventDefault();
      setIsPending(true);

      const categoryData = { name, maincategory: selectedCategoryId };
      const formData = new FormData();
      formData.append("categoryData", JSON.stringify(categoryData));
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }

      try {
        await axios.put(
          `/api/admindata/updateCategory/${initialData._id}`,
          formData
        );
        Swal.fire("Updated!", "Category updated successfully.", "success");
        queryClient.invalidateQueries(["categoryListkey"]);
      } catch (error) {
        Swal.fire("Error", "Update failed", "error");
      } finally {
        setIsPending(false);
      }
    };

    return (
      <form onSubmit={onSubmitHandler} className="space-y-4 p-4 max-w-md mx-auto">
        <div>
          <p className="font-medium mb-2">Category Image</p>
          <div className="flex gap-2 flex-wrap">
            {Array(4)
              .fill("")
              .map((_, i) => (
                <label key={i} htmlFor={`img${i}`} className="cursor-pointer">
                  <input
                    type="file"
                    id={`img${i}`}
                    hidden
                    onChange={(e) => {
                      const updatedFiles = [...files];
                      updatedFiles[i] = e.target.files[0];
                      setFiles(updatedFiles);
                    }}
                  />
                  <img
                    src={
                      files[i]
                        ? typeof files[i] === "string"
                          ? files[i]
                          : URL.createObjectURL(files[i])
                        : assets.upload_area
                    }
                    alt=""
                    className="w-20 h-20 object-cover border rounded-lg hover:scale-105 transition-transform"
                  />
                </label>
              ))}
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Category Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter category name"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Main Category</label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select Main Category</option>
            {maincategoryList?.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={`w-full py-2.5 font-semibold rounded-lg text-white ${
            isPending
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 transition"
          }`}
        >
          {isPending ? "Updating..." : "Update Category"}
        </button>
      </form>
    );
  };

  const deleteCategory = async ({ deleteid }) => {
    const res = await axios.delete(`/api/admindata/dldCategory/${deleteid}`);
    return res.data;
  };

  const mutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      Swal.fire("Deleted!", "Category deleted successfully.", "success");
      queryClient.invalidateQueries(["categoryListkey"]);
    },
    onError: () => {
      Swal.fire("Error", "Failed to delete category", "error");
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete this category?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Delete it!",
    }).then((res) => {
      if (res.isConfirmed) mutation.mutate({ deleteid: id });
    });
  };

  return (
    <div className="no-scrollbar h-[95vh] overflow-y-scroll bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📦 Category List</h1>

      <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-4 text-lg font-semibold">
          Categories Overview
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-100 border-b text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Image</th>
                <th className="px-6 py-3 text-left">Category Name</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-500">
                    Loading categories...
                  </td>
                </tr>
              ) : categoryList && categoryList.length > 0 ? (
                categoryList.map((cat, i) => (
                  <tr
                    key={cat._id}
                    className={`transition hover:bg-green-50 ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={cat.image[0]}
                          alt={cat.name}
                          className="w-14 h-14 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEdit(cat._id)}
                          className="px-4 py-1.5 rounded-full bg-blue-600 text-white font-semibold text-xs shadow hover:bg-blue-700 hover:scale-105 transition-transform"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="px-4 py-1.5 rounded-full bg-red-500 text-white font-semibold text-xs shadow hover:bg-red-600 hover:scale-105 transition-transform"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center py-8 text-gray-500 text-sm"
                  >
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
