import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "../api/axiosClient";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Property, PropertyImage } from "../types/property";

const schema = yup.object({
  title: yup.string().required(),
  property_type: yup.mixed<NonNullable<Property["property_type"]>>()
    .oneOf(["apartment", "house", "villa", "office", "land"]).required(),
  status: yup.mixed<NonNullable<Property["status"]>>()
    .oneOf(["available", "sold", "rented", "pending"]).default("available"),
  price: yup.number().typeError("Giá phải là số").required(),
  area: yup.number().typeError("Diện tích phải là số").required(),
  address: yup.string().required(),
  city: yup.string().required(),
  district: yup.string().required(),
  contact_name: yup.string().required(),
  contact_phone: yup.string().required(),
});

type FormValues = yup.InferType<typeof schema>;

export default function PropertyForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const nav = useNavigate();

  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { status: "available" }
  });

  // Load data khi edit
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const res = await axios.get<Property>(`/properties/${id}`);
      const p = res.data;
      reset({
        title: p.title,
        property_type: p.property_type,
        status: p.status,
        price: p.price,
        area: p.area,
        address: p.address,
        city: p.city,
        district: p.district,
        contact_name: p.contact_name,
        contact_phone: p.contact_phone,
      });

      if (p.images && p.images.length > 0) {
        setExistingImages(p.images); // PropertyImage[]
        setPreviews(p.images.map(img => `http://127.0.0.1:8000/storage/${img.image_path}`)); // string[]
      }
    })();
  }, [id, isEdit, reset]);

  // Thêm file mới
  const onFilesChange = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...arr]); // thêm vào mảng cũ
  };

  // Xoá ảnh đã chọn
  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    // Nếu xoá ảnh cũ, xoá luôn khỏi existingImages
    if (index < existingImages.length) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      const form = new FormData();
      Object.entries(data).forEach(([k, v]) => form.append(k, String(v)));

      // Thêm ảnh mới
      const input = document.getElementById("imagesInput") as HTMLInputElement;
      if (input?.files && input.files.length > 0) {
        Array.from(input.files).forEach(f => form.append("images[]", f));
      }

      // Thêm id ảnh cũ còn giữ lại để backend biết không xoá
      existingImages.forEach(img => form.append("existing_images[]", String(img.id)));

      if (isEdit) {
        await axios.post(`/properties/${id}?_method=PUT`, form, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await axios.post(`/properties`, form, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      nav("/properties");
    } catch (e: unknown) {
      const err = e as { response?: { data?: unknown } };
      const m = typeof err?.response?.data === "string"
        ? err.response.data
        : JSON.stringify(err?.response?.data);
      setServerError(m);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">{isEdit ? "Chỉnh sửa" : "Tạo mới"} bất động sản</h1>
      {serverError && <p className="text-red-600 text-sm mb-2">{serverError}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-4">
        {/* Các input text, select giống trước */}
        <div>
          <label className="text-sm">Tiêu đề</label>
          <input className="w-full border rounded p-2" {...register("title")} />
          <p className="text-xs text-red-600">{errors.title?.message}</p>
        </div>
        <div>
          <label className="text-sm">Loại</label>
          <select className="w-full border rounded p-2" {...register("property_type")}>
            {["apartment", "house", "villa", "office", "land"].map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm">Giá</label>
          <input className="w-full border rounded p-2" {...register("price")} />
          <p className="text-xs text-red-600">{errors.price?.message}</p>
        </div>
        <div>
          <label className="text-sm">Diện tích (m²)</label>
          <input className="w-full border rounded p-2" {...register("area")} />
          <p className="text-xs text-red-600">{errors.area?.message}</p>
        </div>
        <div>
          <label className="text-sm">Trạng thái</label>
          <select className="w-full border rounded p-2" {...register("status")}>
            {["available", "sold", "rented", "pending"].map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm">Địa chỉ</label>
          <input className="w-full border rounded p-2" {...register("address")} />
        </div>
        <div>
          <label className="text-sm">Thành phố</label>
          <input className="w-full border rounded p-2" {...register("city")} />
        </div>
        <div>
          <label className="text-sm">Quận/Huyện</label>
          <input className="w-full border rounded p-2" {...register("district")} />
        </div>
        <div>
          <label className="text-sm">Liên hệ</label>
          <input className="w-full border rounded p-2 mb-2" placeholder="Tên" {...register("contact_name")} />
          <input className="w-full border rounded p-2" placeholder="SĐT" {...register("contact_phone")} />
        </div>

        {/* Ảnh */}
        <div className="md:col-span-2">
          <label className="text-sm">Ảnh (có thể chọn nhiều)</label>
          <input
            id="imagesInput"
            type="file"
            multiple
            className="block"
            onChange={e => onFilesChange(e.target.files)}
          />
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {previews.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} className="w-full h-28 object-contain rounded" />
                  <button
                    type="button"
                    onClick={() => removePreview(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <button className="px-4 py-2 rounded bg-black text-white">{isEdit ? "Cập nhật" : "Tạo mới"}</button>
        </div>
      </form>
    </div>
  );
}
