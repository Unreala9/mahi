import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Landmark, AlertCircle } from "lucide-react";

interface BankAccountDetails {
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  bankName: string;
}

interface BankAccountFormProps {
  onSubmit: (details: BankAccountDetails) => void;
  loading?: boolean;
}

export const BankAccountForm = ({
  onSubmit,
  loading,
}: BankAccountFormProps) => {
  const [details, setDetails] = useState<BankAccountDetails>({
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    bankName: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof BankAccountDetails, string>>
  >({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BankAccountDetails, string>> = {};

    if (!details.accountHolderName.trim()) {
      newErrors.accountHolderName = "Account holder name is required";
    }

    if (!details.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d{9,18}$/.test(details.accountNumber)) {
      newErrors.accountNumber = "Invalid account number (9-18 digits)";
    }

    if (details.accountNumber !== details.confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Account numbers don't match";
    }

    if (!details.ifscCode.trim()) {
      newErrors.ifscCode = "IFSC code is required";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(details.ifscCode.toUpperCase())) {
      newErrors.ifscCode = "Invalid IFSC code format";
    }

    if (!details.bankName.trim()) {
      newErrors.bankName = "Bank name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...details,
        ifscCode: details.ifscCode.toUpperCase(),
      });
    }
  };

  const handleChange = (field: keyof BankAccountDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 flex items-start gap-3 mb-6">
        <Landmark className="w-5 h-5 text-blue-500 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-blue-500 uppercase">
            Bank Account Details
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Please provide your bank account details for withdrawal. Ensure all
            information is correct.
          </p>
        </div>
      </div>

      <div>
        <Label
          htmlFor="accountHolderName"
          className="text-xs font-bold text-muted-foreground uppercase"
        >
          Account Holder Name
        </Label>
        <Input
          id="accountHolderName"
          type="text"
          value={details.accountHolderName}
          onChange={(e) => handleChange("accountHolderName", e.target.value)}
          className="mt-1"
          placeholder="Enter account holder name"
          disabled={loading}
        />
        {errors.accountHolderName && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {errors.accountHolderName}
          </p>
        )}
      </div>

      <div>
        <Label
          htmlFor="bankName"
          className="text-xs font-bold text-muted-foreground uppercase"
        >
          Bank Name
        </Label>
        <Input
          id="bankName"
          type="text"
          value={details.bankName}
          onChange={(e) => handleChange("bankName", e.target.value)}
          className="mt-1"
          placeholder="e.g., State Bank of India"
          disabled={loading}
        />
        {errors.bankName && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {errors.bankName}
          </p>
        )}
      </div>

      <div>
        <Label
          htmlFor="accountNumber"
          className="text-xs font-bold text-muted-foreground uppercase"
        >
          Account Number
        </Label>
        <Input
          id="accountNumber"
          type="text"
          value={details.accountNumber}
          onChange={(e) =>
            handleChange("accountNumber", e.target.value.replace(/\D/g, ""))
          }
          className="mt-1"
          placeholder="Enter account number"
          disabled={loading}
          maxLength={18}
        />
        {errors.accountNumber && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {errors.accountNumber}
          </p>
        )}
      </div>

      <div>
        <Label
          htmlFor="confirmAccountNumber"
          className="text-xs font-bold text-muted-foreground uppercase"
        >
          Confirm Account Number
        </Label>
        <Input
          id="confirmAccountNumber"
          type="text"
          value={details.confirmAccountNumber}
          onChange={(e) =>
            handleChange(
              "confirmAccountNumber",
              e.target.value.replace(/\D/g, ""),
            )
          }
          className="mt-1"
          placeholder="Re-enter account number"
          disabled={loading}
          maxLength={18}
        />
        {errors.confirmAccountNumber && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {errors.confirmAccountNumber}
          </p>
        )}
      </div>

      <div>
        <Label
          htmlFor="ifscCode"
          className="text-xs font-bold text-muted-foreground uppercase"
        >
          IFSC Code
        </Label>
        <Input
          id="ifscCode"
          type="text"
          value={details.ifscCode}
          onChange={(e) =>
            handleChange("ifscCode", e.target.value.toUpperCase())
          }
          className="mt-1"
          placeholder="e.g., SBIN0001234"
          disabled={loading}
          maxLength={11}
        />
        {errors.ifscCode && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {errors.ifscCode}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-sm font-black uppercase tracking-widest bg-foreground text-background hover:bg-muted transition-all rounded-none"
        disabled={loading}
      >
        {loading ? "Processing..." : "Proceed with Withdrawal"}
      </Button>
    </form>
  );
};
