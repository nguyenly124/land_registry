// src/components/RegisterModal.tsx
import { useState } from "react";
import { createPortal } from "react-dom";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import { X } from "lucide-react"; 

type Step = 1 | 2 | 3;
type Step1Data = { email: string; username: string; password: string };

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function RegisterModal({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);

  if (!open) return null;

  const handleSuccess = () => {
    setTimeout(() => {
      onClose();
      alert("Đăng ký thành công, vui lòng chọn đăng nhập vào hệ thống");
      window.location.href = "/";
    }, 1500);
  };

  return createPortal(
    // Overlay: Sử dụng flex để căn giữa modal
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
      {/* Modal Container: Điều chỉnh padding, thêm transition để mượt mà hơn */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm md:max-w-md p-8 relative transition-all duration-300 ease-in-out">
        
        {/* Tiêu đề Modal và Nút đóng */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">
                Đăng ký tài khoản
            </h2>
            {/* Nút đóng modal (icon X) - Đảm bảo dễ nhấn và căn chỉnh tốt */}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition p-1 rounded-full hover:bg-gray-100"
              aria-label="Đóng"
            >
              <X size={24} />
            </button>
        </div>


        {/* Các bước đăng ký */}
        {step === 1 && (
          <Step1
            onNext={(data) => {
              setStep1Data(data);
              setStep(2);
            }}
            onBack={onClose} 
          />
        )}

        {step === 2 && step1Data && (
          <Step2
            email={step1Data.email}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && step1Data && (
          <Step3 data={step1Data} onSuccess={handleSuccess} />
        )}
      </div>
    </div>,
    document.body
  );
}