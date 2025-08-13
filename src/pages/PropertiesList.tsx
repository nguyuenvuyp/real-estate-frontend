import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../api/axiosClient";
import type { Property } from "../types/property";
import type { Pagination, } from "../types/property";
import { Link, useNavigate } from "react-router-dom";

const types = ["apartment","house","villa","office","land"] as const;
const statuses = ["available","sold","rented","pending"] as const;

export default function PropertiesList() {
  const nav = useNavigate();
  const [q, setQ] = useState({
    search: "",
    city: "",
    property_type: "",
    status: "",
    sort_by: "created_at",
    order: "desc",
    page: 1,
    per_page: 10,
  });

  const params = useMemo(() => ({ ...q }), [q]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["properties", params],
    queryFn: async () => {
      const res = await axios.get<Pagination<Property>>("/properties", { params });
      return res.data;
    }
  });

  useEffect(() => { 
    console.log("/properties?" + new URLSearchParams(params).toString());
    refetch(); 
  }, [params, refetch]);

  const onDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xoá?")) return;
    await axios.delete(`/properties/${id}`);
    refetch();
  };

  // test thử lấy data thủ công
useEffect(() => {
  console.log("/properties?" + new URLSearchParams(params).toString());
  axios.get('/properties', { params }).then(res => {
    console.log(res.data);
  });
}, []);


  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Danh sách bất động sản</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow grid md:grid-cols-5 gap-3">
        <input className="border rounded p-2" placeholder="Tìm tiêu đề"
          value={q.search} onChange={e=>setQ(s=>({...s, search:e.target.value, page:1}))}/>
        <input className="border rounded p-2" placeholder="Thành phố"
          value={q.city} onChange={e=>setQ(s=>({...s, city:e.target.value, page:1}))}/>
        <select className="border rounded p-2" value={q.property_type}
          onChange={e=>setQ(s=>({...s, property_type:e.target.value, page:1}))}>
          <option value="">Loại</option>
          {types.map(t=> <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="border rounded p-2" value={q.status}
          onChange={e=>setQ(s=>({...s, status:e.target.value, page:1}))}>
          <option value="">Trạng thái</option>
          {statuses.map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex gap-2">
          <select className="border rounded p-2 flex-1" value={q.sort_by}
            onChange={e=>setQ(s=>({...s, sort_by:e.target.value}))}>
            <option value="created_at">Mới nhất</option>
            <option value="price">Giá</option>
            <option value="area">Diện tích</option>
            <option value="title">Tiêu đề</option>
          </select>
          <select className="border rounded p-2"
            value={q.order} onChange={e=>setQ(s=>({...s, order:e.target.value}))}>
            <option value="desc">↓</option>
            <option value="asc">↑</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">Tiêu đề</th>
              <th className="p-3">Loại</th>
              <th className="p-3">Thành phố</th>
              <th className="p-3">Giá</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td className="p-3" colSpan={6}>Loading...</td></tr>}
            {data?.data?.map(p=>(
              <tr key={p.id} className="border-b">
                <td className="p-3"><Link className="text-blue-600" to={`/properties/${p.id}`}>{p.title}</Link></td>
                <td className="p-3">{p.property_type}</td>
                <td className="p-3">{p.city}</td>
                <td className="p-3">{p.price.toLocaleString()}</td>
                <td className="p-3">{p.status}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={()=>nav(`/properties/${p.id}/edit`)}
                          className="px-2 py-1 rounded bg-yellow-100">Sửa</button>
                  <button onClick={()=>onDelete(p.id)}
                          className="px-2 py-1 rounded bg-red-100">Xoá</button>
                </td>
              </tr>
            ))}
            {!isLoading && data && data.data.length===0 && (
              <tr><td colSpan={6} className="p-3">Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && (
        <div className="flex items-center gap-2">
          <button
            disabled={q.page<=1}
            onClick={()=>setQ(s=>({...s, page:s.page-1}))}
            className="px-3 py-1 rounded bg-white border disabled:opacity-50"
          >Prev</button>
          <span className="text-sm">Trang {data.current_page}/{data.last_page}</span>
          <button
            disabled={q.page>=data.last_page}
            onClick={()=>setQ(s=>({...s, page:s.page+1}))}
            className="px-3 py-1 rounded bg-white border disabled:opacity-50"
          >Next</button>
          <select
            className="border rounded p-1 ml-2"
            value={q.per_page}
            onChange={e=>setQ(s=>({...s, per_page: Number(e.target.value), page:1}))}
          >
            {[5,10,20,50].map(n=> <option key={n} value={n}>{n}/page</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
