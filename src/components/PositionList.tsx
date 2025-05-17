"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Position {
  id: string;
  created_at: string;
  title: string;
}

interface PositionListProps {
  refreshTrigger: number; // Prop to trigger refresh
}

const PositionList = ({ refreshTrigger }: PositionListProps) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPositions();
  }, [refreshTrigger]); // Depend on refreshTrigger

  const fetchPositions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("positions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching positions:", error);
      showError("Gagal memuat data posisi: " + error.message);
    } else {
      setPositions(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return <p>Memuat daftar posisi...</p>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Daftar Posisi</h3>
      {positions.length === 0 ? (
        <p>Belum ada posisi yang ditambahkan.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Posisi</TableHead>
                <TableHead>Dibuat Pada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell>{position.title}</TableCell>
                  <TableCell>{new Date(position.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default PositionList;