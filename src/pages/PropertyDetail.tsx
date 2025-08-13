import { useQuery } from "@tanstack/react-query";
import axios from "../api/axiosClient";
import type { Property, PropertyImage } from "../types/property";
import { useParams } from "react-router-dom";

type Detail = Omit<Property, "images"> & { images?: PropertyImage[] };

export default function PropertyDetail() {
    const { id } = useParams();

    const { data, isLoading } = useQuery<Detail>({
        queryKey: ["property", id],
        queryFn: async () => {
            const res = await axios.get<Detail>(`/properties/${id}`);
            return res.data;
        }
    });


    if (isLoading) return <div>Loading...</div>;
    if (!data) return <div>Không tìm thấy</div>;

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-semibold">{data.title}</h1>
            <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-white p-4 rounded-xl shadow">
                    <p><b>Loại:</b> {data.property_type}</p>
                    <p><b>Trạng thái:</b> {data.status}</p>
                    <p><b>Giá:</b> {data.price.toLocaleString()}</p>
                    <p><b>Diện tích:</b> {data.area} m²</p>
                    <p><b>Địa chỉ:</b> {data.address}, {data.district}, {data.city}</p>
                    <p><b>Liên hệ:</b> {data.contact_name} - {data.contact_phone}</p>
                    {data.description && <p className="mt-2">{data.description}</p>}
                </div>
                <div className="bg-white p-4 rounded-xl shadow">
                    <h3 className="font-semibold mb-2">Thư viện ảnh</h3>
                    {data.images && data.images.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 max-h-96 overflow-auto">
                            {data.images.map(img => (
                                <img key={img.id}
                                    src={`http://127.0.0.1:8000/storage/${img.image_path}`}
                                    className="w-full h-24 object-contain rounded" />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Chưa có ảnh</p>
                    )}
                </div>
            </div>
        </div>
    );
}
