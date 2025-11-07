// src/components/common/ParcelMap.tsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { LandParcel } from "../../api/types";

// Fix icon lỗi mặc định
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface ParcelMapProps {
  land: LandParcel;
}

// Component tự động zoom đến marker
function FlyToMarker({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 16, { animate: true });
  return null;
}

export default function ParcelMap({ land }: ParcelMapProps) {
  if (!land.latitude || !land.longitude) {
    return (
      <div className="h-96 bg-blue-100 rounded-xl flex items-center justify-center text-gray-500">
        Không có tọa độ để hiển thị bản đồ
      </div>
    );
  }

  const center: [number, number] = [land.latitude, land.longitude];

  return (
    <div className="h-96 rounded-xl overflow-hidden shadow-md">
      <MapContainer center={center} zoom={16} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={center}>
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{land.parcel_code}</p>
              <p>{land.address}</p>
              <p className="text-gray-600">Diện tích: {land.area} m²</p>
            </div>
          </Popup>
        </Marker>
        <FlyToMarker center={center} />
      </MapContainer>
    </div>
  );
}