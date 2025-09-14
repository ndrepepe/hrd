import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4"> {/* Removed pt-16 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Selamat Datang di Aplikasi HRD ANDI OFFSET</h1>
        <p className="text-xl text-gray-600 mb-8">
          Gunakan bilah navigasi di atas untuk berpindah antar modul.
        </p>
        {/* Navigation buttons removed */}
      </div>
    </div>
  );
};

export default Index;