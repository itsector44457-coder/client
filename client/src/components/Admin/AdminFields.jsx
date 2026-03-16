import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { Plus, Trash2, LayoutGrid, Loader2 } from "lucide-react";

const AdminFields = () => {
  const { adminId } = useOutletContext();
  const [fields, setFields] = useState([]);
  const [fieldName, setFieldName] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Fetch Domains
  const fetchFields = async () => {
    try {
      const res = await axios.get(
        `https://backend-6hhv.onrender.com/api/admin/fields`,
      );
      setFields(res.data);
    } catch (err) {
      console.error("Failed to fetch fields", err);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  // 2. Add New Domain
  const handleAddField = async (e) => {
    e.preventDefault();
    if (!fieldName.trim()) return;

    setLoading(true);
    try {
      await axios.post(
        `https://backend-6hhv.onrender.com/api/admin/fields`,
        { field: fieldName },
        { headers: { adminid: adminId } },
      );
      setFieldName("");
      fetchFields();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add domain.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Delete Domain
  const handleDelete = async (id, name) => {
    if (
      window.confirm(`Are you sure you want to permanently delete '${name}'?`)
    ) {
      try {
        await axios.delete(
          `https://backend-6hhv.onrender.com/api/admin/fields/${id}`,
          {
            headers: { adminid: adminId },
          },
        );
        fetchFields();
      } catch (err) {
        alert("Delete failed.");
      }
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12 font-sans">
      {/* 🟢 HEADER */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <LayoutGrid size={24} />
          </div>
          Domain Architect
        </h2>
        <p className="text-slate-500 text-sm font-medium mt-2">
          Create and manage educational domains for the network.
        </p>
      </div>

      {/* 🟢 CREATE FIELD FORM */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm mb-8 relative overflow-hidden">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Add New Domain
        </h3>
        <form
          onSubmit={handleAddField}
          className="relative z-10 flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            required
            placeholder="e.g. Cyber Security, Robotics, UPSC"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm transition-colors shrink-0"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Plus size={18} />
            )}
            Build Domain
          </button>
        </form>
      </div>

      {/* 🟢 FIELDS LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {fields.map((f) => (
          <div
            key={f._id}
            className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all group relative flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-100 shrink-0">
                  <LayoutGrid size={20} className="text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800 text-base truncate">
                    {f.field}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                    Key: {f.fieldKey}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleDelete(f._id, f.field)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Delete Domain"
              >
                <Trash2 size={16} />{" "}
                <span className="sm:hidden group-hover:inline">Delete</span>
              </button>
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center text-center py-16 border border-dashed border-slate-200 bg-white rounded-2xl">
            <LayoutGrid size={40} className="text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium text-sm">
              No domains engineered yet. Please add one above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFields;
