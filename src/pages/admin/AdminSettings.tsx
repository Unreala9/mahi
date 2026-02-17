import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Save,
  Upload,
  Landmark,
  CreditCard,
  QrCode,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Types for our settings
interface BankDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
}

interface UPIDetails {
  upiId: string;
}

interface QRDetails {
  url: string;
}

const AdminSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State for each setting
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
  });
  const [upiDetails, setUpIDetails] = useState<UPIDetails>({ upiId: "" });
  const [qrDetails, setQRDetails] = useState<QRDetails>({ url: "" });
  const [qrFile, setQrFile] = useState<File | null>(null);

  // Fetch initial settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .in("key", ["bank_details", "upi_details", "qr_code"]);

      if (error) throw error;

      data?.forEach((setting) => {
        if (setting.key === "bank_details") setBankDetails(setting.value);
        if (setting.key === "upi_details") setUpIDetails(setting.value);
        if (setting.key === "qr_code") setQRDetails(setting.value);
      });
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      toast({
        title: "Error",
        description: "Failed to load settings: " + err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBank = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("system_settings")
        .update({ value: bankDetails, updated_at: new Date().toISOString() })
        .eq("key", "bank_details");

      if (error) throw error;
      toast({
        title: "Success",
        description: "Bank details updated successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUPI = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("system_settings")
        .update({ value: upiDetails, updated_at: new Date().toISOString() })
        .eq("key", "upi_details");

      if (error) throw error;
      toast({ title: "Success", description: "UPI ID updated successfully" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveQR = async () => {
    setSaving(true);
    try {
      let qrUrl = qrDetails.url;

      if (qrFile) {
        // 1. Upload new image
        const fileExt = qrFile.name.split(".").pop();
        const fileName = `admin-qr-${Date.now()}.${fileExt}`;

        // Note: Using 'deposit_proofs' bucket temporarily if 'deposit_qr' doesn't exist,
        // or assuming 'deposit_proofs' allows admin uploads.
        // Best practice: Create a dedicated 'public_assets' bucket.
        // For now, let's try 'deposit_proofs' and see if it works for public read.
        // Actually, let's assume we use a public folder in 'deposit_proofs' or a new bucket.
        // Let's rely on standard storage for now.
        const { error: uploadError, data } = await supabase.storage
          .from("deposit_proofs") // Reusing existing bucket for simplicity
          .upload(`public/${fileName}`, qrFile, {
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Get Public URL
        const {
          data: { publicUrl },
        } = supabase.storage
          .from("deposit_proofs")
          .getPublicUrl(`public/${fileName}`);

        qrUrl = publicUrl;
      }

      // 2. Update DB
      const { error } = await supabase
        .from("system_settings")
        .update({ value: { url: qrUrl }, updated_at: new Date().toISOString() })
        .eq("key", "qr_code");

      if (error) throw error;

      setQRDetails({ url: qrUrl });
      setQrFile(null);
      toast({ title: "Success", description: "QR Code updated successfully" });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Deposit Settings</h1>
        <p className="text-gray-400">
          Manage payment methods and details shown to users.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bank Details Config */}
        <Card className="bg-[#131824] border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Landmark className="w-5 h-5 text-blue-400" /> Bank Transfer
            </CardTitle>
            <CardDescription>
              Configure the bank account details for manual deposits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Bank Name</Label>
              <Input
                className="bg-[#0A0E1A] border-white/10 text-white"
                value={bankDetails.bankName}
                onChange={(e) =>
                  setBankDetails({ ...bankDetails, bankName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400">Account Holder Name</Label>
              <Input
                className="bg-[#0A0E1A] border-white/10 text-white"
                value={bankDetails.accountHolder}
                onChange={(e) =>
                  setBankDetails({
                    ...bankDetails,
                    accountHolder: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-400">Account Number</Label>
                <Input
                  className="bg-[#0A0E1A] border-white/10 text-white"
                  value={bankDetails.accountNumber}
                  onChange={(e) =>
                    setBankDetails({
                      ...bankDetails,
                      accountNumber: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-400">IFSC Code</Label>
                <Input
                  className="bg-[#0A0E1A] border-white/10 text-white"
                  value={bankDetails.ifsc}
                  onChange={(e) =>
                    setBankDetails({ ...bankDetails, ifsc: e.target.value })
                  }
                />
              </div>
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-500"
              onClick={handleSaveBank}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Bank Details
            </Button>
          </CardContent>
        </Card>

        {/* UPI Config */}
        <Card className="bg-[#131824] border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CreditCard className="w-5 h-5 text-purple-400" /> UPI Settings
            </CardTitle>
            <CardDescription>
              Set the official UPI ID for receiving payments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-400">UPI ID / VPA</Label>
              <Input
                className="bg-[#0A0E1A] border-white/10 text-white font-mono"
                value={upiDetails.upiId}
                onChange={(e) => setUpIDetails({ upiId: e.target.value })}
                placeholder="example@upi"
              />
            </div>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-500"
              onClick={handleSaveUPI}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save UPI ID
            </Button>
          </CardContent>
        </Card>

        {/* QR Code Config */}
        <Card className="bg-[#131824] border-white/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <QrCode className="w-5 h-5 text-green-400" /> QR Code Scanner
            </CardTitle>
            <CardDescription>
              Upload the QR code image that users will scan.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/2 space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-400">Upload New QR Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    className="bg-[#0A0E1A] border-white/10 text-white file:text-green-400"
                    onChange={(e) => setQrFile(e.target.files?.[0] || null)}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Supported formats: PNG, JPG, WEBP
                </p>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-500"
                onClick={handleSaveQR}
                disabled={saving || (!qrFile && !qrDetails.url)}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {qrFile ? "Upload & Save QR" : "Update QR URL"}
              </Button>
            </div>

            <div className="w-full md:w-1/2 flex flex-col items-center">
              <Label className="text-gray-400 mb-2 self-start">
                Current Preview
              </Label>
              <div className="bg-white p-4 rounded-lg shadow-lg border-4 border-white">
                {qrDetails.url ? (
                  <img
                    src={qrDetails.url}
                    alt="Admin QR"
                    className="w-48 h-48 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-gray-100 text-gray-400 text-xs text-center p-4">
                    No QR Code Configured
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
