"use client";

type PasswordFieldProps = {
  label: string;
  name: string;
  autoComplete: string;
  value: string;
  placeholder: string;
  show: boolean;
  onChange: (value: string) => void;
};

export default function PasswordField({
  label,
  name,
  autoComplete,
  value,
  placeholder,
  show,
  onChange,
}: PasswordFieldProps) {
  return (
    <label className="block space-y-2 text-sm text-slate-600">
      <span>{label}</span>
      <input
        type={show ? "text" : "password"}
        name={name}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200/70"
        placeholder={placeholder}
        required
      />
    </label>
  );
}
