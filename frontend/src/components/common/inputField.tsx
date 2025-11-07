// === InputField Component  ===
export  function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm transition-all focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none disabled:bg-gray-50"
      />
    </div>
  );
}