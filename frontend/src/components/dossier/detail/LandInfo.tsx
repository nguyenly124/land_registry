// src/components/dossier/detail/LandInfo.tsx
interface LandInfoProps {
  parcel?: {
    parcel_code: string;
    address: string;
  };
}

export default function LandInfo({ parcel }: LandInfoProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-blue-900 mb-4">THÔNG TIN THỬA ĐẤT</h3>
      {parcel ? (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-lg border border-blue-200">
          <p className="font-bold text-xl text-blue-900">{parcel.parcel_code}</p>
          <p className="text-gray-700 mt-1 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {parcel.address}
          </p>
        </div>
      ) : (
        <p className="text-gray-500 italic">Không có thửa đất liên kết</p>
      )}
    </div>
  );
}