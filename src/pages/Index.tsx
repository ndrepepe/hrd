import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Car, CheckCircle2, Users } from "lucide-react";

const modules = [
  {
    to: "/car-rental",
    title: "Peminjaman Mobil",
    description: "Kelola unit kendaraan, jadwal peminjaman, sopir, dan tujuan dinas.",
    icon: Car,
    accent: "bg-cyan-50 text-cyan-700",
  },
  {
    to: "/daily-report",
    title: "Laporan Harian",
    description: "Input aktivitas kerja dan pantau rekap laporan karyawan setiap hari.",
    icon: BarChart3,
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    to: "/employees",
    title: "Data Karyawan",
    description: "Simpan profil, jabatan, status kerja, dan kontak karyawan.",
    icon: Users,
    accent: "bg-amber-50 text-amber-700",
  },
];

const Index = () => {
  return (
    <div className="app-shell">
      <div className="app-container">
        <section className="mb-6 grid gap-5 rounded-lg border border-white/70 bg-white/85 p-6 shadow-sm shadow-slate-200/80 backdrop-blur lg:grid-cols-[1.35fr_0.65fr] lg:p-8">
          <div className="flex flex-col justify-center">
            <p className="page-kicker">Human Resource Dashboard</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
              Selamat datang di Aplikasi HRD ANDI OFFSET
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Semua modul utama tetap berada di tempat yang sama, sekarang dengan tampilan yang lebih bersih untuk kerja harian.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/daily-report">
                <Button>
                  Mulai Laporan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/employees">
                <Button variant="outline">
                  Lihat Karyawan
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-3 rounded-lg bg-slate-950 p-5 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-400/20 text-emerald-200">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white/70">Status Sistem</p>
                <p className="text-xl font-bold">Siap Digunakan</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-md bg-white/10 p-3">
                <p className="font-bold">Mobil</p>
                <p className="text-white/60">Aktif</p>
              </div>
              <div className="rounded-md bg-white/10 p-3">
                <p className="font-bold">Laporan</p>
                <p className="text-white/60">Harian</p>
              </div>
              <div className="rounded-md bg-white/10 p-3">
                <p className="font-bold">SDM</p>
                <p className="text-white/60">Terdata</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.to} to={module.to} className="module-card group">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-md ${module.accent}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-950">{module.title}</h2>
                <p className="mt-2 min-h-16 text-sm leading-6 text-muted-foreground">{module.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Buka modul
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </section>
      </div>
    </div>
  );
};

export default Index;
