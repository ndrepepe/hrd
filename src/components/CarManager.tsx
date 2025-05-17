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
  name: z.string().min(2, {
    message: "Nama mobil harus minimal 2 karakter.",
  }),
});

interface Car {
  id: string;
  created_at: string;
  name: string;
}

interface CarManagerProps {
  onCarAdded: () => void; // Callback to notify parent when a car is added
}

const CarManager = ({ onCarAdded }: CarManagerProps) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .order("name", { ascending: true }); // Order by name

    if (error) {
      console.error("Error fetching cars:", error);
      showError("Gagal memuat daftar mobil: " + error.message);
    } else {
      setCars(data || []);
    }
    setLoading(false);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitting new car:", values);
    const { data, error } = await supabase
      .from("cars")
      .insert([
        {
          name: values.name,
        },
      ])
      .select(); // Use select() to get the inserted data

    if (error) {
      console.error("Error inserting car:", error);
      showError("Gagal menyimpan mobil: " + error.message);
    } else {
      console.log("Car inserted successfully:", data);
      showSuccess("Mobil berhasil disimpan!");
      form.reset(); // Reset form after successful submission
      fetchCars(); // Refresh the list
      onCarAdded(); // Notify parent
    }
  }

  return (
    <div className="space-y-6">
      <div className="w-full max-w-md mx-auto">
        <h3 className="text-xl font-semibold mb-4">Tambah Nama Mobil</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Mobil</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Toyota Avanza" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Simpan Mobil</Button>
          </form>
        </Form>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">Daftar Nama Mobil</h3>
        {loading ? (
          <p>Memuat daftar mobil...</p>
        ) : cars.length === 0 ? (
          <p>Belum ada nama mobil yang ditambahkan.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Mobil</TableHead>
                  <TableHead>Dibuat Pada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cars.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell>{car.name}</TableCell>
                    <TableCell>{new Date(car.created_at).toLocaleString()}</TableCell>
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

export default CarManager;