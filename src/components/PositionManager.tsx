"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Nama posisi harus minimal 2 karakter.",
  }),
});

interface Position {
  id: string;
  created_at: string;
  title: string;
}

const PositionManager = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  useEffect(() => {
    fetchPositions();
  }, []);

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitting new position:", values);
    const { data, error } = await supabase
      .from("positions")
      .insert([
        {
          title: values.title,
        },
      ])
      .select(); // Use select() to get the inserted data

    if (error) {
      console.error("Error inserting position:", error);
      showError("Gagal menyimpan posisi: " + error.message);
    } else {
      console.log("Position inserted successfully:", data);
      showSuccess("Posisi berhasil disimpan!");
      form.reset(); // Reset form after successful submission
      fetchPositions(); // Refresh the list
    }
  }

  return (
    <div className="space-y-6">
      <div className="w-full max-w-md mx-auto">
        <h3 className="text-xl font-semibold mb-4">Tambah Posisi Baru</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Posisi</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Simpan Posisi</Button>
          </form>
        </Form>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">Daftar Posisi</h3>
        {loading ? (
          <p>Memuat daftar posisi...</p>
        ) : positions.length === 0 ? (
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
    </div>
  );
};

export default PositionManager;