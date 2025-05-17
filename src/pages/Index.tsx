import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Selamat Datang di Aplikasi Anda</h1>
        <p className="text-xl text-gray-600 mb-8">
          Pilih modul yang ingin Anda akses:
        </p>
        <div className="flex flex-col space-y-4">
          <Link to="/car-rental">
            <Button className="w-64">Modul Peminjaman Mobil</Button>
          </Link>
          <Link to="/recruitment">
            <Button className="w-64">Modul Rekrutmen Karyawan</Button>
          </Link>
          <Link to="/daily-report"> {/* Activate the link */}
            <Button className="w-64">Modul Laporan Harian Karyawan</Button> {/* Update button text */}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;